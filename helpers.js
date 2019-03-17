const COLOR_GREEN = '\x1b[32m';
const COLOR_RED = '\x1b[31m';
const COLOR_RESET = '\x1b[0m';

module.exports.logResult = (request, code) => {
  console.log(code === 200 ? COLOR_GREEN : COLOR_RED, `[${request.method}] ${request.url} - ${code}`, COLOR_RESET);
}