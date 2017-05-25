const defaults = {
  delay: true, // Should the first run be put on a random delay?
  interval: 60 * 60 * 1000 // 1 hour
};

module.exports = (robot, options, visit) => {
  if (typeof options === 'function') {
    visit = options;
    options = {};
  }

  options = Object.assign({}, defaults, options);
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

  function schedule(installation, repository) {
    // Wait a random delay to more evenly distribute requests
    const delay = options.delay ? options.interval * Math.random() : 0;

    if (delay > 0) {
      robot.log.info(repository, `Delay by ${delay}ms before starting regular interval of ${options.interval}ms`)
    } else {
      robot.log.info(repository, `Start regular interval of ${options.interval}ms`)
    }

    setTimeout(() => {
      // Schedule visit to this repository on an interval
      intervals[repository.id] = setInterval(() => visit(installation, repository), options.interval);
      // Make the first visit now
      visit(installation, repository);
    }, delay);
  }

  async function eachInstallation(callback) {
    const github = await robot.auth();

    await github.paginate(github.integrations.getInstallations({}), installations => {
      installations.forEach(callback);
    });
  }

  async function eachRepository(installation, callback) {
    const github = await robot.auth(installation.id);

    return await github.paginate(github.integrations.getInstallationRepositories({}), data => {
      data.repositories.forEach(async repository => await callback(repository, github));
    });
  }

  function stop(repository) {
    robot.log.info(repository, `Cancel interval schedule`);

    clearInterval(intervals[repository.id]);
  }

  return {stop};
};
