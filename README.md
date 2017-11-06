## Probot: Scheduler

A [Probot](https://github.com/probot/probot) extension to trigger events on a periodic schedule.

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
