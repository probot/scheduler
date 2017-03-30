module.exports = async function paginate(github, responsePromise, callback) {
  let response = await responsePromise;
  let collection = await callback(response);

  while (github.hasNextPage(response)) {
    response = await github.getNextPage(response);
    collection = collection.concat(await callback(response));
  }

  return collection;
}

module.exports = function paginate(github, callback, collector = []) {
  return function (response) {
    return Promise.resolve(callback(response)).then(result => {
      collector.push(result);
      if (github.hasNextPage(response)) {
        return github.getNextPage(response).then(paginate(github, callback, collector));
      } else {
        return collector;
      }
    });
  };
};


response = await github.issues.getAll({stuff});
allItems = paginate(github, response, processEachPage);

allItems = paginate(github, await github.issues.getAll({stuff}), processEachPage);

async function paginate(github, response, fn) {
  let collection = await fn(response);

  while (github.hasNextPage(response)) {
    response = await github.getNextPage(response);
    collection = collection.concat(await fn(response));
  }

  return collection;
}
