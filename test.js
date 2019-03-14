process.env.PRIVATE_KEY = 'testkey'

const nock = require('nock')
const createScheduler = require('./')
const { Probot } = require('probot')

const payload = require('./fixtures/installation-created.json')

nock.disableNetConnect()

const testApp = (app) => {
  createScheduler(app)

  app.on('schedule.repository', () => {})
}

describe('Schedules intervals for a repository', () => {
  let probot
  let app

  beforeEach(() => {
    probot = new Probot({})
    app = probot.load(testApp)

    app.app = () => 'test'
  })

  it('gets a page of repositories', async (done) => {
    nock('https://api.github.com')
      .get('/app/installations')
      .query({ per_page: 1 })
      .reply(200, [{ id: 1 }], {
        'Link': '<https://api.github.com.com/app/installations?page=2&per_page=1>; rel="next"',
        'X-GitHub-Media-Type': 'github.v3; format=json'
      })
      .get('/installation/repositories')
      .query({ page: 2, per_page: 1 })
      .reply(200, [{ id: 2 }])
      .persist()
    
    await app.receive({ name: 'installation', payload })
    await done()
  })
})
