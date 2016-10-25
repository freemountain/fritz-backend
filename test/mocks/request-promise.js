module.exports = function mock(urls) {
  const calls = [];
  const request = url => new Promise((resolve, reject) => {
    calls.push(url);
    setTimeout(() => {
      if (urls[url]) return resolve(urls[url]);
      return reject({
        url,
        msg: 'not mocked',
      });
    });
  });

  request.calls = calls;

  return request;
};
