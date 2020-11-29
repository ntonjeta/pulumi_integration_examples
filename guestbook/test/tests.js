var chai = require('chai')
var chaiHttp = require('chai-http')
var chaiJson = require('chai-json')
var should = chai.should()
var expect = chai.expect
var assert = chai.assert
chai.use(chaiHttp)
chai.use(chaiJson)

const message = 'a message'
const serverPath = '../src/server.js'

const setRedisReplica = require(serverPath)
const setRedisMaster = require(serverPath)

var Redis = require('ioredis-mock')
var redis = new Redis({
  data: {
    'messages': [message]
  }
})

var bodyParser = require('body-parser')

before(function () {
  server = require(serverPath)
  server.setRedisReplica(redis)
  server.setRedisMaster(redis)
})

describe('/GET ', () => {
  afterEach(function (done) {
    restartServer(done)
  })

  it('should return index.html', (done) => {
    chai.request(server.app)
      .get('/')
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        expect(res).to.be.html
        done()
      })
  })
})

describe('/GET messages', () => {
  afterEach(function (done) {
    restartServer(done)
  })

  it('should return messages', (done) => {
    chai.request(server.app)
      .get('/messages')
      .end((_err, res) => {
        res.should.have.status(200)
        expect(res).to.be.json
        res.body.should.exist
        res.body.should.have.property('messages')
        assert.equal(1, res.body.messages.length, 'hasn\'t a message')
        assert.equal(message, res.body.messages[0], 'message not correspond to previous stored')
        done()
      })
  })
});

describe('/POST messages', () => {
  afterEach(function (done) {
    restartServer(done)
  })

  it('should store messages', (done) => {
    chai.request(server.app)
      .post('/messages')
      .set('content-type', 'application/json')
      .send({ 'value': message })
      .end((_err, res) => {
        res.should.have.status(200)
      })

    chai.request(server.app)
      .get('/messages')
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        expect(res).to.be.json;
        expect(res.body).to.exist
        expect(res.body).to.have.property('messages')
        assert.equal(2, res.body.messages.length, 'hasn\'t a message')
        assert.equal(message, res.body.messages[0], 'message not correspond to previous stored')
        assert.equal(message, res.body.messages[1], 'message not correspond to previous stored')
        done()
      })
  })
})

function restartServer(done) {
  delete require.cache[require.resolve(serverPath)]
  done()
}

