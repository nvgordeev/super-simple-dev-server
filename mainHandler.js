const fs = require('fs');
const path = require('path');

const inject = require('./inject.js');

const { logResult } = require('./helpers');

function getContentType(filePath) {
  const ext = path.extname(filePath).slice(1);
  return ({
    js: 'text/javascript',
    css: 'text/css',
    json: 'application/json',
    png: 'image/png',
    jpeg: 'image/jpg',
  })[ext] || 'text/html';
}

function isHtml(filePath) {
  const ext = path.extname(filePath).slice(1);
  return ext === 'html' || ext === 'htm';
}

module.exports = (servingPath, lpHost, lpPort) => (request, response) => {
  const filePath = `${servingPath}${request.url === '/' ? '/index.html' : request.url}`;
  const contentType = getContentType(filePath);
  const isHtmlPage = isHtml(filePath);
  response.writeHead(200, { 'Content-Type': contentType });

  const readStream = fs.createReadStream(filePath);
  readStream
    .on('data', (data) => {
      response.write(isHtmlPage ? data.toString('utf-8').replace(/(<\/body>)/, `${inject(lpHost, lpPort)}$1`) : data);
    })
    .on('error', (error) => {
      if (error.code === 'ENOENT') {
        response.writeHead(404);
        response.end('404', 'utf-8');
        logResult(request, 404);
      } else {
        response.writeHead(500);
        response.end('500');
        console.log(response);
        logResult(request, 500);
      }
    })
    .on('end', () => {
      response.end();
      logResult(request, 200);
    });
};
