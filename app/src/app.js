import Aragon, { providers } from '@aragon/client'

const app = new Aragon(new providers.WindowMessage(window.parent))
const view = document.getElementById('view')

// ugly hack: aragon.js doesn't have handshakes yet
// the wrapper is sending a message to the app before the app's ready to handle it
// the iframe needs some time to set itself up,
// so we put a timeout to wait for 5s before subscribing
setTimeout(subscribe, 5000)

function subscribe() {
  app.state().subscribe(
    (state) => {
      console.log('app.js state ', state)
      view.innerHTML = `The counter is ${state}`
    },
    (err) => {
      view.innerHTML = 'An error occured, check the console'
      console.log(err)
    }
  )
}
