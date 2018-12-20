const http = require('http');
const path = require('path');
const fs = require('fs');

const inject = require('./inject.js')

const COLOR_GREEN = "\x1b[32m";
const COLOR_RED = "\x1b[31m";
const COLOR_RESET = "\x1b[0m";

const DEFAULT_HOST = 'localhost';
const DEFAULT_PORT = 3000;
const DEFAULT_LONG_POLLING_HOST = 'localhost';
const DEFAULT_LONG_POLLING_PORT = 3001;

function getContentType(ext) {
    return ({
        'js': 'text/javascript',
        'css': 'text/css',
        'json': 'application/json',
        'png': 'image/png',
        'jpeg': 'image/jpg'
    })[ext] || 'text/html'
}

function log(request, code, color) {
    console.log(color, `[${request.method}] ${request.url} - ${code}`, COLOR_RESET)
}

const mainHandler = (servingPath, lpHost, lpPort) => (request, response) => {
    const filePath = './' + servingPath +  (request.url === '/'? '/index.html' : request.url);
    const ext = path.extname(filePath).slice(1);
    const contentType = getContentType(ext);
    response.writeHead(200, { 'Content-Type': contentType });

    const readStream = fs.createReadStream(filePath);
    readStream
        .on('data', data =>  {
            const str = data.toString('utf-8').replace(/(<\/body>)/, inject(lpHost, lpPort) + '$1')
            response.write(str)
        })
        .on('error', error => {
            if(error.code == 'ENOENT'){
                response.writeHead(404);
                response.end('404', 'utf-8');
                log(request, 404, COLOR_RED)
            }
            else {
                response.writeHead(500);
                response.end('500'); 
                log(request, 500, COLOR_RED);
            }
        })
        .on('end', () => {
            response.end();
            log(request, 200, COLOR_GREEN);
        })
}

const longPollingHandler = (servingPath) => (request, response) => {

    response.writeHead(200, { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' });
    const timeout = setTimeout(() => {
        response.end('heartbeat', 'utf-8');
    }, 100000)

    const watcher = fs.watch(servingPath, handleChange)

    function handleChange(evt, filename) {
        console.log(`${filename} changed, reloading....`);
        clearTimeout(timeout);
        watcher.close();
        response.end('reload', 'utf-8');
    }
}

function parseArguments(args) {
    return {
        servingPath: args[0],
        host: args[1] || DEFAULT_HOST,
        port: args[2] || DEFAULT_PORT,
        lpHost: args[3] || DEFAULT_LONG_POLLING_HOST,
        lpPort: args[3] || DEFAULT_LONG_POLLING_PORT,
    }
}


(function () {
    const args = process.argv.slice(2);
    
    if (!args.length) {
        console.log("Arguments: <serving path (required)> <host> <port> <long polling host> <long polling port>");
        process.exit();
    }

    const {servingPath, host, port, lpHost, lpPort} = parseArguments(args)

    http.createServer(mainHandler(servingPath, lpHost, lpPort)).listen(port, host);
    console.log(`Serving directory ${servingPath} at http://${host}:${port}`);
    http.createServer(longPollingHandler(servingPath)).listen(lpPort, lpHost);
})()

