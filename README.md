# aedes-broker
Look at the aedes docs for examples of aedes usage.

aedesWebsocketRedis implements websocket streaming with Redis persistence.

redisConfig.js simply pulls config data out of main broker file. Original is left in place for easy reference while reading code.

Since we use semi-standard as our coding style, the redis auth password is in single quotes in the config file. However, when editing the redis.conf file for auth, the password needs to be in double quotes.

Durability of clients (persistence) can be tested with websocket and mqtt clients. Both are provided in the ravenOSS repository "mqtt-clients".
