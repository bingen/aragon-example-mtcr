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
