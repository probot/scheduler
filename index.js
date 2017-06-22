const defaults = {
  delay: !process.env.DISABLE_DELAY, // Should the first run be put on a random delay?
  interval: 60 * 60 * 1000 // 1 hour
};

module.exports = (robot, options) => {
  options = Object.assign({}, defaults, options || {});
  const intervals = {};

  // https://developer.github.com/early-access/integrations/webhooks/#integrationinstallationrepositoriesevent
  robot.on('integration_installation.created', async event => {
    const installation = event.payload.installation;

    eachRepository(installation, repository => {
      schedule(installation, repository);
    });
  });

  // https://developer.github.com/early-access/integrations/webhooks/#integrationinstallationrepositoriesevent
  robot.on('integration_installation_repositories.added', async event => {
    const installation = event.payload.installation;

    // FIXME: get added repositories from webhook
    eachRepository(installation, repository => {
      if (!intervals[repository.id]) {
        schedule(installation, repository);
      }
    });
  });

  setup();

  function setup() {
    eachInstallation(installation => {
      eachRepository(installation, repository => {
        schedule(installation, repository);
      });
    });
  }

  // Trigger the event
  function trigger(event) {
    robot.webhook.emit(event.event, event);
  }

  function schedule(installation, repository) {
    // Wait a random delay to more evenly distribute requests
    const delay = options.delay ? options.interval * Math.random() : 0;

    robot.log.debug({repository, delay, interval: options.interval}, `Scheduling interval`)

    setTimeout(() => {
      const event = {
        event: 'schedule',
        payload: {
          action: 'repository',
          installation: installation,
          repository: repository
        }
      }

      // Trigger events on this repository on an interval
      intervals[repository.id] = setInterval(() => trigger(event) }, options.interval);

      // Trigger the first event now
      trigger(event);
    }, delay);
  }

  async function eachInstallation(callback) {
    robot.log.trace('Fetching installations');
    const github = await robot.auth();

    await github.paginate(github.integrations.getInstallations({}), res => {
      res.data.forEach(callback);
    });
  }

  async function eachRepository(installation, callback) {
    robot.log.trace(installation, 'Fetching repositories for installation');
    const github = await robot.auth(installation.id);

    return await github.paginate(github.integrations.getInstallationRepositories({}), res => {
      res.data.repositories.forEach(async repository => await callback(repository, github));
    });
  }

  function stop(repository) {
    robot.log.debug({repository}, `Canceling interval`);

    clearInterval(intervals[repository.id]);
  }

  return {stop};
};
