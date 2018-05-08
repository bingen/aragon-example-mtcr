const Aragon = require('@aragon/client').default

// Initialise the app
const app = new Aragon()

// Listen for events and reduce them to a state
const state$ = app.store((state, event) => {
  // Initial state
  if (state === null) state = 0

  console.log('worker.js state ', state)
  console.log('worker.js event ', event)
  // Build state
  switch (event.event) {
  case 'NewEntry':
    state++
    break
  case 'DelEntry':
    state--
    break
  default:
    console.log('Unkwnown event')
    break
  }

  return state
})
