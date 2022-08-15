'use strict'
const config = require('./redisConfig')

const mq = require('mqemitter-redis')({
	port: config.redis_port,
	host: config.redis_host,
	// password: config.redis_pass,
	db: config.redis_dbA,
	family: 4,
})

const persistence = require('aedes-persistence-redis')({
	port: config.redis_port,
	host: config.redis_host,
	family: 4, // 4 (IPv4) or 6 (IPv6)
	// password: config.redis_pass,
	db: config.redis_dbB,

	maxSessionDelivery: 1000, // maximum offline messages deliverable on client CONNECT, default is 1000
	// packetTTL: function (packet) { // offline message TTL, default is disabled
	//  return 10; // seconds
})

const aedesOptions = { mq, persistence, concurrency: 200 }

const aedes = require('aedes')(aedesOptions)
const server = require('net').createServer(aedes.handle)
const httpServer = require('http').createServer()
const ws = require('websocket-stream')
ws.createServer({ server: httpServer }, aedes.handle)

server.listen(config.mqtt_port, function () {
	console.log(`MQTT server listening on port: ${config.mqtt_port}`)
})

httpServer.listen(config.ws_port, function () {
	console.log(`WS server listening on port: ${config.ws_port}`)
})

// logging({
//   aedes: aedes,
//   servers: servers
// });

aedes.on('client', (client) => {
	console.log(`Client [${client.id}] connected`)
})

aedes.on('clientDisconnect', (client) => {
	console.log(`Client [${client.id}] disconnected`)
})

aedes.on('clientError', (client, err) => {
	console.log(`Client [${client.id}] encountered error: ${JSON.stringify(err)}`)
})

aedes.on('publish', (packet, client) => {
	client
		? console.log(
				`Client [${client.id}] published on ${packet.topic}: ${packet.payload}`
		  )
		: console.log(`aedes published on ${packet.topic}: ${packet.payload}`)
})

aedes.on('subscribe', (subscriptions, client) => {
	var subscriptionArr = subscriptions.map((subscription) => {
		return `${subscription['topic']} (${subscription['qos']})`
	})
	client
		? console.log(`Client [${client.id}] subscribed ${subscriptionArr}`)
		: console.log(
				`aedes subscribed ${subscriptionArr.topic}: ${subscriptionArr.payload}`
		  )
})

aedes.on('unsubscribe', (unsubscriptions, client) => {
	console.log(`Client [${client.id}] unsubscribe ${unsubscriptions}`)
})

aedes.on('ack', function (message, client) {
	console.log("%s ack'd message", client.id)
})

// aedes.on('subscribe', function (subscriptions, client) {
//   if (client) {
//     console.log('%s subscribe %s', subscriptions, client.id);
//   }
// });

aedes.on('clientDisconnect', function (client) {
	console.log('%s disconnected', client.id)
})
