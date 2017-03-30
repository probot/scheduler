## Probot: Visitor

A helper for [probot](https://github.com/probot/probot) to visiting installed repositories on an interval.

## Usage

```js
const visitor = require('probot-visitor');

module.exports = robot => {
  visitor(robot, (installation, repository) => {
    // this function is called on an interval, which is 1 hr by default;
  });
};
```

## TODO:

- [x] Get it working
- [ ] Move `paginate.js` into probot core
- [x] Ability to manually stop visiting a repository (e.g. like when there is not configuration for the plugin)
- [ ] Stop visiting uninstalled integrations
      - [ ] and repositories removed from an integration
- [ ] Start visiting newly installed integrations
      - [ ] and repositories added to an existing installation
