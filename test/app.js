const App = artifacts.require('./App.sol')

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
})
