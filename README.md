## Probot: Scheduler

A helper for [probot](https://github.com/probot/probot) to trigger events on a periodic schedule.

## Usage

```js
const createScheduler = require('probot-scheduler');

module.exports = robot => {
  scheduler = createScheduler(robot);

  robot.on('schedule.repository', context => {
    // this event is triggered on an interval, which is 1 hr by default;
  });
};
```

## TODO:

- [x] Get it working
- [x] Move `paginate.js` into probot core
- [x] Ability to manually stop visiting a repository (e.g. like when there is not configuration for the plugin)
- [ ] Stop visiting uninstalled integrations
    - [ ] and repositories removed from an integration
- [x] Start visiting newly installed integrations
    - [x] and repositories added to an existing installation
