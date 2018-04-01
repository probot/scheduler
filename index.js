const Bottleneck = require('bottleneck')

const limiter = new Bottleneck({ maxConcurrent: 1, minTime: 0 })

const defaults = {
  delay: !process.env.DISABLE_DELAY, // Should the first run be put on a random delay?
  // Set interval duration, default is 1 hour (uncomment to set them as default scheduler.)
  interval: 60 * 60 * 1000 // 1 hour
  // interval: 60 * 1000 // 1 minute
  // interval: 24 * 60 * 60 * 1000 // 1 day
  // interval: 7 * 24 * 60 * 60 * 1000 // 1 week
  // interval: 30 * 7 * 24 * 60 * 60 * 1000 // 1 month
}

module.exports = (robot, options) => {
  options = Object.assign({}, defaults, options || {})
  const intervals = {}

  // https://developer.github.com/v3/activity/events/types/#installationrepositoriesevent
  robot.on('installation.created', async event => {
    const installation = event.payload.installation

    eachRepository(installation, repository => {
      schedule(installation, repository)
    })
  })

  // https://developer.github.com/v3/activity/events/types/#installationrepositoriesevent
  robot.on('installation_repositories.added', async event => {
    const installation = event.payload.installation

    // FIXME: get added repositories from webhook
    eachRepository(installation, repository => {
      if (!intervals[repository.id]) {
        schedule(installation, repository)
      }
    })
  })

  setup()

  function setup () {
    eachInstallation(installation => {
      limiter.schedule(eachRepository, installation, repository => {
        schedule(installation, repository)
      })
    })
  }

  function schedule (installation, repository) {
    // Wait a random delay to more evenly distribute requests
    const delay = options.delay ? options.interval * Math.random() : 0

    robot.log.debug({repository, delay, interval: options.interval}, `Scheduling interval`)

    setTimeout(() => {
      const event = {
        event: 'schedule',
        payload: {action: 'repository', installation, repository}
      }

      // Trigger events on this repository on an interval
      intervals[repository.id] = setInterval(() => robot.receive(event), options.interval)

      // Trigger the first event now
      robot.receive(event)
    }, delay)
  }

  async function eachInstallation (callback) {
    robot.log.trace('Fetching installations')
    const github = await robot.auth()

    const req = github.apps.getInstallations({per_page: 100})
    await github.paginate(req, res => {
      res.data.forEach(callback)
    })
  }

  async function eachRepository (installation, callback) {
    robot.log.trace({installation}, 'Fetching repositories for installation')
    const github = await robot.auth(installation.id)

    const req = github.apps.getInstallationRepositories({per_page: 100})
    return github.paginate(req, res => {
      res.data.repositories.forEach(async repository => callback(repository, github))
    })
  }

  function stop (repository) {
    robot.log.debug({repository}, `Canceling interval`)

    clearInterval(intervals[repository.id])
  }

  return {stop}
}
