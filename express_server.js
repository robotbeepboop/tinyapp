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

//url page
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//urls/new above urls/id
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//redirect
app.get("/u/:id", (req, res) => {
  const shortURL = req.body.shorURL;
  res.redirect(urlDatabase[shortURL].longURL);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: req.body.longURL };
  res.render("urls_show", templateVars);
});

//new shorturl
app.post("/urls", (req, res) => {
  //put the random string generator in here?
  const shorURL = generateRandomString();
  console.log(req.body); // log post request body to console for now
  res.send("Ok"); // will change later, placeholder
  urlDatabase[shortURL] = {
    longURL: req.body.longURL
  };
  //use built-in redirect function
  //substitute :id with shortURL
  res.redirect(`/urls/${shorURL}`);
});

//delete url
app.post("/urls", (req, res) => {
  const linkToDelete = req.params.shorURL;
  delete urlDatabase[linkToDelete];
});

//edit url
app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  urlDatabase[req.params.id].longURL = longURL;
});

//login
app.post("/login", (req, res) => {
  res.cookie('username');
  //redirect after login
  res.redirect(`/urls/`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
