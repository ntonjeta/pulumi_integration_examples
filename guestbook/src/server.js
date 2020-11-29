const path = require('path')
const bodyParser = require('body-parser');

const express = require('express');
const app = express();
const frontEndPath = './view';
app.use(bodyParser.json()); app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, frontEndPath)));

app.get('/', (req, res) => {
  res.status(200).sendFile('index.html')
})

app.get('/messages', async (req, res) => {
  redisReplica.lrange('messages', 0, -1, function (err, reply) {
    if (err) {
      console.error(err)
      res.status(500).send()
    }
    res.status(200).send({ 'messages': reply ?? [] })
  })
});

app.post('/messages', (req, res) => {
  redisMaster.rpush(['messages', req.body.value], function (err) {
    if (err) {
      console.error(err)
      res.status(500).send()
    }
  });
  res.status(200).send();
})

function setRedisMaster(client) {
  redisMaster = client
  redisReplica = client
}

function setRedisReplica(client) {
  redisReplica = client
}

exports.setRedisMaster = setRedisMaster
exports.setRedisReplica = setRedisReplica
exports.app = app
