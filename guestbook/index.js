var server = require('./src/server.js')
var getClient = require('./src/redis')
const setRedisMaster = require('./src/server.js')

// constants
const port = 3000

server.setRedisMaster(getClient('redis-leader'))
server.setRedisReplica(getClient('redis-replica'))

server.app.listen(port, () => {
  console.log('guestbook listen at http://localhost:' + port)
})
