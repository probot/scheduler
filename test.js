process.env.PRIVATE_KEY = 'testkey'

const nock = require('nock')
const createScheduler = require('./')
const { Probot } = require('probot')

const payload = require('./fixtures/installation-created.json')
const pageOfRepositories = require('./fixtures/page-of-repositories.json')

nock.disableNetConnect()

const testApp = (robot) => {
  createScheduler(robot)

  robot.on('schedule.repository', () => {})
}

describe('Schedules intervals for a repository', () => {
  let probot

  beforeEach(() => {
    probot = new Probot({})
    const app = probot.load(testApp)

    app.app = () => 'test'
  })

  test('gets a page of repositories', async () => {
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

    await probot.receive({ name: 'installation', payload })
  })
})
