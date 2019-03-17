#!/usr/bin/env node

const http = require('http');
const fs = require('fs');

const mainHandler = require('./mainHandler');
const longPollingHandler = require('./longPollingHandler');

const DEFAULT_HOST = 'localhost';
const DEFAULT_PORT = 3000;
const DEFAULT_LONG_POLLING_HOST = 'localhost';
const DEFAULT_LONG_POLLING_PORT = 3001;


function parseArguments(args) {
  return {
    servingPath: args[0],
    host: args[1] || DEFAULT_HOST,
    port: args[2] || DEFAULT_PORT,
    lpHost: args[3] || DEFAULT_LONG_POLLING_HOST,
    lpPort: args[3] || DEFAULT_LONG_POLLING_PORT,
  };
}

(function main() {
  const args = process.argv.slice(2);

  if (!args.length) {
    console.log('Arguments: <serving path (required)> <host> <port> <long polling host> <long polling port>');
    process.exit();
  }

  const {
    servingPath, host, port, lpHost, lpPort,
  } = parseArguments(args);

  if (!fs.existsSync(servingPath)) {
    console.error('Specified path does not exist');
    process.exit();
  }

  http.createServer(mainHandler(servingPath, lpHost, lpPort)).listen(port, host);

  console.log(`Serving directory ${servingPath} at http://${host}:${port}`);

  http.createServer(longPollingHandler(servingPath)).listen(lpPort, lpHost);
}());
