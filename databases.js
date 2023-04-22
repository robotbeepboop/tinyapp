//database constants to be called into express_server.js
//removed key value pairs in urldatabase so that the user can populate it with their own short urls
const urlDatabase = {};

const users = { 
  "4wN4kRt" : {
    userID: "4wN4kRt",
    email: "111@111",
    password: bcrypt.hashSync("coolguytime", 10)
  }
};

module.exports = { urlDatabase, users };
