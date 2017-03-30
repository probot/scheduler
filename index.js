const paginate = require('./paginate');

const defaults = {
  interval: 60 * 60 * 1000 // 1 hour
};

module.exports = (robot, options, visit) => {
  if (typeof options === 'function') {
    visit = options;
    options = {};
  }

  options = Object.assign({}, defaults, options);

  setup();

  function setup() {
    eachInstallation(installation => {
      eachRepository(installation, repository => {
        // Wait a random interval to more evently distribute requests
        const delay = options.interval * Math.random();
        setTimeout(() => {
          // Schedule visit to this repository on an interval
          setInterval(() => visit(installation, repository), options.interval);
          // Make the virst visit now
          visit(installation, repository);
        }, delay);
      });
    });
  }

  async function eachInstallation(callback) {
    const github = await robot.integration.asIntegration();

    return await paginate(github, github.integrations.getInstallations({}), installations => {
      installations.forEach(callback);
    });
  }

  async function eachRepository(installation, callback) {
    const github = await robot.auth(installation.id);

    return await paginate(github, github.integrations.getInstallationRepositories({}), data => {
      data.repositories.forEach(repository => callback(repository, github));
    });
  }
};
