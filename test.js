const http = require('http');
const server = http.createServer((req, res) => {
  res.end('Hello');
});
server.listen(3000, () => {
  console.log('Minimal server running on port 3000');
}); 