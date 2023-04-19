//generate random string for url shortener
//put it up here to keep it out of the way of the rest of the code
function generateRandomString() {
  const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  //changed while loop into for loop
  for (let i = 0; i < 7; i++) {
    randomString += possibleChars[Math.floor(Math.random() * possibleChars.length)];
  }

  return randomString;
};

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const cookieParser = require('cookie-parser');
app.use(express.urlencoded({ extended: true }));
//cookie parser
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//++++GET++++

//login page to start
app.get("/login", (req, res) => {
  const templateVars = {
    user: req.cookies["user_id"]
  };
  res.render("urls_login", templateVars);
});

//url home page
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

//urls/new above urls/id
app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

//redirect
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.shorURL];
  console.log("longURL: ", longURL);
  res.redirect(longURL);
});

//edit urls page
app.get("/urls/:id", (req, res) => {
  const templateVars = { shorURL: req.params.shortURL, longURL: urlDatabase[req.params.shorURL], username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

//++++POST++++

//new shorturl
app.post("/urls", (req, res) => {
  const shorURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shorURL}`);
});

//delete url, edit later
app.post("/urls", (req, res) => {
  const linkToDelete = req.params.shorURL;
  delete urlDatabase[linkToDelete];
  console.log("Link deleted.");
  res.redirect('/urls');
});

//edit url
app.post("/urls/:id", (req, res) => {
  let longURL = req.body.longURL;
  urlDatabase[req.params.id].longURL = longURL;
  res.redirect('/urls');
});

//login method
app.post("/login", (req, res) => {
  let newCookie = req.body.username;
  res.cookie("username", newCookie);
  //redirect
  res.redirect(`/urls/`);
});

//logout method
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect('/urls/');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
