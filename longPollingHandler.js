const fs = require('fs');

let watcher = null;

module.exports = servingPath => (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' });

  const timeout = setTimeout(() => {
    watcher.close();
    response.end('heartbeat', 'utf-8');
  }, 1000);

  const handleChange = (evt, filename) => {
    console.log(`${filename} changed, reloading....`);
    clearTimeout(timeout);
    watcher.close();
    response.end('reload', 'utf-8');
  };

  watcher = fs.watch(servingPath, { recursive: true }, handleChange);
};
