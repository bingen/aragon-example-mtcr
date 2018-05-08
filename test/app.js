const App = artifacts.require('./App.sol')
const { assertRevert } = require('@aragon/test-helpers/assertThrow')

const getEvent = (receipt, event, arg) => { return receipt.logs.filter(l => l.event == event)[0].args[arg] }

contract('App', (accounts) => {
  let app

  beforeEach(async () => {
    app = await App.new()
  })

  it('adds new entry', async () => {
    const r = await app.add("test")
    const id = getEvent(r, "NewEntry", "id")
    assert.equal(await app.getEntry(id), "test", "Entry should match")
  })

  it('fails on duplicated entry', async () => {
    const r = await app.add("test")
    const id = getEvent(r, "NewEntry", "id")
    assert.equal(await app.getEntry(id), "test", "Entry should match")
    return assertRevert(async () => {
      await app.add("test")
    })
  })

  it('dels entry', async () => {
    const r = await app.add("test")
    const id = getEvent(r, "NewEntry", "id")
    assert.equal(await app.getEntry(id), "test", "Entry should match")
    await app.del("test")
    assert.equal(await app.getEntry(id), "", "Entry should be empty")
  })

  it('fails deleting non-existent entry', async () => {
    return assertRevert(async () => {
      await app.del("test")
    })
  })
})
