# Aragon Minimal TCR example

This is an example of a simple app created using aragon cli tool. Based on [this guide](https://gist.github.com/onbjerg/5c2658bd2fa206167b6e66fcd8ffa617)

## Prerequisites

- [**truffle**](https://github.com/trufflesuite/truffle): Used to build and test the contracts
- [**@aragon/cli**](https://github.com/aragon/aragon-dev-cli): Used to publish the application
- [**webpack-cli**](https://webpack.js.org/api/cli/): Or the bundler you like, to build the frontend.


## Init app

```sh
aragon-dev-cli init mtcr.aragonpm.eth bare
cd mtcr
```

## Create smart contract

Edit `contracts/App.sol` to add your own logic, install any other needed dependency, e.g.:

```
npm i @aragon/apps-voting
```

and compile it:

```
truffle compile
```

## Add some tests

Kind of optional, but absolutely recommended ;-)
Edit `test/app.js` and make sure everything works as expected, with:

```
npm run test
```

## Build Front end

Install Aragon.js:

```
cd app
npm init
npm i @aragon/client
```

Create a background worker, `src/worker.js`, to :

```
const Aragon = require('@aragon/client').default

// Initialise the app
const app = new Aragon()

// Listen for events and reduce them to a state
const state$ = app.store((state, event) => {
  // Initial state
  if (state === null) state = 0

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
```

And your view, with a simple `index.html`:

```
<!doctype>
<html>
  <body>
    <div id="view">...</div>
    <script src="public/app.js"></script>
  </body>
</html>
```

and a Javascript file `src/app.js` that observes the events generated by our worker:

```
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
```

As we are using Node.js modules, we need a builder, e.g., webpack, so add the following `webpack.config.js` file too:

```
module.exports = {
  entry: {
    app: './src/app.js',
    worker: './src/worker.js'
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/public'
  }
}
```

Add the following line to `package.json`:

```
    "build": "webpack"
```

And finally build the frontend:

```
npm run build
cd ..
```

## Tweak config files

Edit `arapp.json`, change your app name and add your roles.

Edit `manifest.json`, change description and add:
```
"start_url": "/public/index.html",
"script": "/public/worker.js"
```

## Start a local IPFS node

Out of scope, you can start a docker instance like [here](https://github.com/aragon/aragon-apps/blob/master/templates/beta/docker-compose.yml)

## Do the magic

```
aragon run
```

You can open a `truffle console` and interact with your just deployed contract (just replace the app address by yours):

```
> App.at("0x7ceB61328BD062D3534C6529823d0990653A9aC6").add("test 5").then(function(r){console.log(r.logs[0].args)})
```

## Start your Aragon dApp locally

Get the repo and install deps

```
git clone https://github.com/aragon/aragon.git
yarn install
```

Then edit `src/environment.js` and replace the infura node section by:

```
  rpc: {
    host: 'localhost',
    port: '5001',
    protocol: 'http',
  },
```

And start it, using ENS address by the one generated by `aragon run`:

```
REACT_APP_DEFAULT_ETH_NODE=ws://localhost:8545 REACT_APP_IPFS_GATEWAY=http://localhost:8080/ipfs REACT_APP_ETH_NETWORK_TYPE=local REACT_APP_ENS_REGISTRY_ADDRESS=0xB9462EF3441346dBc6E49236Edbb0dF207db09B7 yarn start
```

Now you can go to:

```
https://localhost:3000/#/<your-DAO-address-generated-before>
```

## Upgrading

Make your changes, update version in `arapp.json` and run (replace ENS address by your previous one):

```
aragon publish aragon publish --apm.ipfs.rpc.host localhost --apm.ens-registry 0xB9462EF3441346dBc6E49236Edbb0dF207db09B7 --key <the-first-private-key-that-aragon-run-gave-you>
```