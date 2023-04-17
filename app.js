const http = require("http");
const PORT = 8080;

// a function which handles requests and sends response
const requestHandler = function (request, response) {
  console.log("In requestHandler");
  const responseText = `Requested Path: ${request.url}\nRequest Method: ${request.method}`
  if (request.url === "/") {//for home page
    response.end("Welcome");
  } else if (request.url === "/urls") {//url handling
    response.end("www.lighthouselabs.ca\nwww.google.com");
  } else {
    response.statusCode = 404;//unsupported path error code
    response.end("404 Page Not Found")
  }
  //response.end(responseText);
};

const server = http.createServer(requestHandler);
console.log("Server created");

server.listen(PORT, () => {
  console.log(`Server listening on: http://localhost:${PORT}`);
});

console.log("Last line (after .listen call)");
