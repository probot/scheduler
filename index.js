const Bottleneck = require('bottleneck')

const limiter = new Bottleneck({ maxConcurrent: 1, minTime: 0 })
const ignoredAccounts = (process.env.IGNORED_ACCOUNTS || '').toLowerCase().split(',')

const defaults = {
  delay: !process.env.DISABLE_DELAY, // Should the first run be put on a random delay?
  interval: 60 * 60 * 1000 // 1 hour
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
    return setupInstallation(event.payload.installation)
  })

  setup()

  function setup () {
    return eachInstallation(setupInstallation)
  }

  function setupInstallation (installation) {
    if (ignoredAccounts.includes(installation.account.login.toLowerCase())) {
      robot.log.debug({installation}, 'Installation is ignored')
      return
    }

    limiter.schedule(eachRepository, installation, repository => {
      schedule(installation, repository)
    })
  }

  function schedule (installation, repository) {
    if (intervals[repository.id]) {
      return
    }

    // Wait a random delay to more evenly distribute requests
    const delay = options.delay ? options.interval * Math.random() : 0

    robot.log.debug({repository, delay, interval: options.interval}, `Scheduling interval`)

    intervals[repository.id] = setTimeout(() => {
      const event = {
        name: 'schedule',
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

    for await (const response of github.paginate.iterator(
      github.apps.listInstallations.endpoint.merge({ per_page: 100 })
    )) {
        const installations = options.filter ? response.data.filter(inst => options.filter(inst)) : response.data
        return installations.forEach(callback)
      }
  }

  async function eachRepository (installation, callback) {
    robot.log.trace({installation}, 'Fetching repositories for installation')
    const github = await robot.auth(installation.id)

    for await (const response of github.paginate.iterator(
      github.apps.listRepos.endpoint.merge({ per_page: 100 }))
    ) {
        const repos = options.filter
        ? response.data.repositories.filter(repo => options.filter(installation, repo))
        : response.data.repositories
        return repos.forEach(repo => callback(repo, github))
    }
  }

  function stop (repository) {
    robot.log.debug({repository}, `Canceling interval`)

    clearInterval(intervals[repository.id])
  }

  return {stop}
}
