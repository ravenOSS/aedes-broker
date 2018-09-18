'use strict';
// from the aedes docs
// mqtt and ws broker without persistence

let aedes = require('aedes')();
let server = require('net').createServer(aedes.handle);
let httpServer = require('http').createServer();
let ws = require('websocket-stream');
let port = 1883;
let wsPort = 8888;

server.listen(port, function () {
  console.log('server listening on port', port);
});

ws.createServer({
  server: httpServer
}, aedes.handle);

httpServer.listen(wsPort, function () {
  console.log('websocket server listening on port', wsPort);
});

aedes.on('client', function (client) {
  console.log('new client', client.id);
});

aedes.on('clientError', function (client, err) {
  console.log('client error', client.id, err.message, err.stack);
});

aedes.on('connectionError', function (client, err) {
  console.log('client error: client: %s, error: %s', client.id, err.message);
});

aedes.on('publish', function (packet, client) {
  if (client) {
    console.log('%s : topic %s : %s', client.id, packet.topic, packet.payload);
  }
});

aedes.on('subscribe', function (subscriptions, client) {
  if (client) {
    console.log('subscribe from client', subscriptions, client.id);
  }
});

aedes.on('clientDisconnect', function (client) {
  console.log('disconnect client %s', client.id);
});
