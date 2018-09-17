## Probot: Scheduler

[![npm](https://img.shields.io/npm/v/probot-scheduler.svg)](https://www.npmjs.com/package/probot-scheduler)

A [Probot](https://github.com/probot/probot) extension to trigger events on an hourly schedule.

## Usage

```shell
$ npm install probot-scheduler
```

```js
const createScheduler = require('probot-scheduler')

module.exports = (app) => {
  createScheduler(app)
  app.on('schedule.repository', context => {
    // this event is triggered on an interval, which is 1 hr by default
  })
}
```

## Configuration

There are a few environment variables that can change the behavior of the scheduler:

- `DISABLE_DELAY=true` - Perform the schedule immediately on startup, instead of waiting for the random delay between 0 and 59:59 for each repository, which exists to avoid all schedules being performed at the same time.

- `IGNORED_ACCOUNTS=comma,separated,list` - GitHub usernames to ignore when scheduling. These are typically spammy or abusive accounts.


## Options

There are a few runtime options you can pass that can change the behavior of the scheduler:

* `delay` - when `false`, the schedule will be performed immediately on startup. When `true`, there will be a random delay between 0 and `interval` for each repository to avoid all schedules being performed at the same time. Default: `true` unless the `DISABLE_DELAY` environment variable is set.

* `interval` - the number of milliseconds to schedule each repository. Default: 1 hour (`60 * 60 * 1000`)

For example, if you want your app to be triggered *once every day* with *delay enabled on first run*:

```js
const createScheduler = require('probot-scheduler')

module.exports = (app) => {
  createScheduler(app, {
    delay: !!process.env.DISABLE_DELAY, // delay is enabled on first run
    interval: 24 * 60 * 60 * 1000 // 1 day
  })

  app.on('schedule.repository', context => {
    // this event is triggered once every day, with a random delay
  })
}
```
