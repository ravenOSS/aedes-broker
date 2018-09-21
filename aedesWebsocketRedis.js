'use strict';
let redis = require('mqemitter-redis');
let config = require('./redisConfig');
/*
let config = {
  mqtt_port: 1883,
  ws_port: 8880,
  redis_port: 6379,
  redis_host: '192.168.0.101',
  redis_pass: 'carson',
  redis_dbA: 0,
  redis_dbB: 1
};
*/
let mq = redis({
  port: config.redis_port,
  host: config.redis_host,
  password: config.redis_pass,
  db: config.redis_dbA,
  family: 4
});

let persistence = require('aedes-persistence-redis')({
  port: config.redis_port,
  host: config.redis_host,
  family: 4, // 4 (IPv4) or 6 (IPv6)
  password: config.redis_pass,
  db: config.redis_dbA,

  maxSessionDelivery: 6000 // maximum offline messages deliverable on client CONNECT, default is 1000
  // packetTTL: function (packet) { // offline message TTL, default is disabled
  //  return 10; // seconds
});

let aedesOptions = {mq, persistence, concurrency: 200};

let aedes = require('aedes')(aedesOptions);
let server = require('net').createServer(aedes.handle);
let httpServer = require('http').createServer();
let ws = require('websocket-stream');

server.listen(config.mqtt_port, function () {
  console.log('MQTT server listening on port: [$config.mqtt_port]');
});

ws.createServer({ server: httpServer }, aedes.handle);

httpServer.listen(config.ws_port, function () {
  console.log('WS server listening on port', config.ws_port);
});

// logging({
//   aedes: aedes,
//   servers: servers
// });

aedes.on('client', client => {
  console.log(`Client [${client.id}] connected`);
});

aedes.on('clientDisconnect', client => {
  console.log(`Client [${client.id}] disconnected`);
});

aedes.on('clientError', (client, err) => {
  console.log(`Client [${client.id}] encountered error: ${JSON.stringify(err)}`);
});

aedes.on('publish', (packet, client) => {
  client ? console.log(`Client [${client.id}] published on ${packet.topic}: ${packet.payload}`)
    : console.log(`aedes published on ${packet.topic}: ${packet.payload}`);
});

aedes.on('subscribe', (subscriptions, client) => {
  var subscriptionArr = subscriptions.map(subscription => {
    return `${subscription['topic']} (${subscription['qos']})`;
  });
  client ? console.log(`Client [${client.id}] subscribed ${subscriptionArr}`)
    : console.log(`aedes subscribed ${subscriptionArr.topic}: ${subscriptionArr.payload}`);
});

aedes.on('unsubscribe', (unsubscriptions, client) => {
  console.log(`Client [${client.id}] unsubscribe ${unsubscriptions}`);
});

aedes.on('ack', function (message, client) {
  console.log('%s ack\'d message', client.id);
});

// aedes.on('subscribe', function (subscriptions, client) {
//   if (client) {
//     console.log('%s subscribe %s', subscriptions, client.id);
//   }
// });

aedes.on('clientDisconnect', function (client) {
  console.log('%s disconnected', client.id);
});
