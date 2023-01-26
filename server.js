var http = require('http');
var express = require('express');
// var reload = require('reload');

var app = express();

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(express.static(__dirname + '/config'));
app.use(express.static(__dirname + '/dist'));
app.use('/', express.static(__dirname + '/demos'));

var server = http.createServer(app);

server.listen(process.env.port, function () {
  console.log(`listening ${process.env.baseURL} on port: ${process.env.port}`);
});

// <script src="/reload/reload.js"></script> on page
// reload(app).then(function () {
//   server.listen(process.env.port, function () {
//     console.log(`listening ${process.env.baseURL} on port: ${process.env.port}`);
//   });
// }).catch(function (err) {
//   console.error('Reload could not start, could not start server', err)
// });