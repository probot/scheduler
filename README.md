## Probot: Scheduler

A [Probot](https://github.com/probot/probot) extension to trigger events on an hourly schedule.

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

## Configuration

There are a few environment variables that can change the behavior of the scheduler:

- `DISABLE_DELAY=true` - Perform the schedule immediately on startup, instead of waiting for the random delay between 0 and 59:59 for each repository, which exists to avoid all schedules being performed at the same time.

- `IGNORED_ACCOUNTS=comma,separated,list` - GitHub usernames to ignore when scheduling. These are typically spammy or abusive accounts.


## Options

You can also configure the default configurations of the `probot-scheduler`. You can do this by utilising the `options` param of the `probot-scheduler`.
The `options` is a configuration object with two keys, `delay` and `interval`. The default configuration of the object is:
```js
const defaults = {
  delay: !process.env.DISABLE_DELAY, // Should the first run be put on a random delay?
  interval: 60 * 60 * 1000 // 1 hour
}
```
For example, if you want your app to be triggered *once every day* with *delay enabled on first run* by using `probot-scheduler`, you can write:
```js
const createScheduler = require('probot-scheduler')

module.exports = (robot) => {
  createScheduler(robot, {
    delay: process.env.DISABLE_DELAY, // delay is enabled on first run
    interval: 24 * 60 * 60 * 1000 // 1 day
    }) 
  robot.on('schedule.repository', context => {
    // this event is triggered once every day, with a random delay
  })
}
```
