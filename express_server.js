const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  //for loop? no, would have to be while
  while (randomString.length < 6) { //add random character to the string
    randomString += possibleChars[Math.floor(Math.random() * possibleChars.length)];
  }

  return randomString;
};

//refactored hello app.get
app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World" };
  res.render("urls_index", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//urls/new above urls/id
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  //put the random string generator in here?
  //const shorURL = generateRandomString();
  console.log(req.body); // log post request body to console for now
  res.send("Ok"); // will change later, placeholder
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: req.body.longURL };
  res.render("urls_show", templateVars);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
