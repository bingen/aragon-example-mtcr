const namehash = require('eth-ens-namehash').hash
//const sha3 = require('js-sha3')
const keccak256 = require('js-sha3').keccak_256

const getContract = name => artifacts.require(name) //artifacts.require
const pct16 = x => new web3.BigNumber(x).times(new web3.BigNumber(10).toPower(16))

const APP_BASE_NAMESPACE = '0x'+keccak256('base')

module.exports = async (deployer, network, accounts) => {
  const daoAddress = process.env.DAO
  const ensAddress = process.env.ENS
  const appProxyAddress = process.env.APP
  console.log("DAO", daoAddress)
  console.log("ENS", ensAddress)
  console.log("APP", appProxyAddress)
  const ens = getContract('ENS').at(ensAddress)
  const apmAddress = await getContract('PublicResolver').at(await ens.resolver(namehash('aragonpm.eth'))).addr(namehash('aragonpm.eth'))

  console.log("APM", apmAddress)
  console.log(accounts[0])

  const apm = getContract('APMRegistry').at(apmAddress)


  const n = '0x00'
  const token = await getContract('MiniMeToken').new(n, n, 0, 'n', 0, 'n', true) // empty parameters minime

  const dao = getContract('Kernel').at(daoAddress)

  // Voting Repo
  const votingAppId = namehash(require(`@aragon/apps-voting/arapp`).appName)
  console.log("Voting app Id", votingAppId)
  console.log("Voting app Id with NS", web3.sha3(APP_BASE_NAMESPACE + votingAppId.substring(2), { encoding: 'hex' }))

  let votingProxyAddress
  if (await ens.owner(votingAppId) == '0x0000000000000000000000000000000000000000') {
    const votingContract = await getContract('Voting').new()
    const votingRepo = await apm.newRepoWithVersion('voting', accounts[0], [1, 0, 0], votingContract.address, '0x1245')
    const votingProxy = await dao.newAppInstance(votingAppId, votingContract.address)
    // initialize

    const supportNeeded = pct16(50)
    const minAcceptanceQuorum = pct16(20)
    const voteDuration = 1000
    await getContract('Voting').at(votingProxy).initialize(token, supportNeeded, minAcceptanceQuorum, voteDuration)
    votingProxyAddress = votingProxy.address
  } else {
    console.log('Voting Repo already exists')
    //const votingRepo = await getContract('PublicResolver').at(await ens.resolver(namehash('aragonpm.eth'))).addr(votingAppId)
    //TODO: get Voting app proxy
    votingProxyAddress = "0xda857e57a1528bf2d9b04ac652b251175183921d"
  }

  console.log("Voting", votingProxyAddress)

  const acl = getContract('ACL').at(await dao.acl())

  // voting permissions
  const anyEntity = "0xffffffffffffffffffffffffffffffffffffffff"
  //const CREATE_VOTES_ROLE = "0xe7dcd7275292e064d090fbc5f3bd7995be23b502c1fed5cd94cfddbbdcd32bbc"
  const CREATE_VOTES_ROLE = await getContract('Voting').at(votingProxyAddress).CREATE_VOTES_ROLE()
  await acl.createPermission(anyEntity, votingProxyAddress, CREATE_VOTES_ROLE, accounts[0]);
  // mTCR permission
  //const mtcrRepo = await getContract('PublicResolver').at(await ens.resolver(namehash('aragonpm.eth'))).addr(namehash('mtcr.aragonpm.eth'))
  //const mtcrAppId = web3.sha3(APP_BASE_NAMESPACE + namehash('mtcr.aragonpm.eth').substring(2), { encoding: 'hex' })
  //console.log("mTCR", await dao.getApp(mtcrAppId))
  //const ADD_ROLE = await appProxyAddress.ADD_ROLE()
  const ADD_ROLE = "0x9fdb66370b2703c58b55fbb88662023f986df503f838f6ca75ff9f9bdabd694a"
  await acl.revokePermission(accounts[0], appProxyAddress, ADD_ROLE)
  await acl.grantPermission(votingProxyAddress, appProxyAddress, ADD_ROLE)

}
