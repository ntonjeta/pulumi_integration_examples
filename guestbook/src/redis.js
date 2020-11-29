const Redis = require('ioredis')

function getClient(host, port = 6379) {
    var client = new Redis(port, host);
    client.on("connect", () => console.log('redis connection established.'))
    client.on("error", (err) => console.error('redis connection failed with error \n' + err))
    return client
}

module.exports = getClient