const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
var cookieParser = require('cookie-parser');

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
//cookie parser
app.use(cookieParser());

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

//reorganized the code a bit to make the site not crash
//login page to start
app.get("/login", (req, res) => {
  const templateVars = {
    user: req.cookies["user_id"]
  };
  res.render("urls_login", templateVars);
});

//registration (if not logged in)
app.get("/register", (req, res) => {
  const templateVars = {
    user: req.cookies["user_id"]
  };
  res.render("urls_registration", templateVars);
});

//url home page
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//urls/new above urls/id
app.get("/urls/new", (req, res) => {
  //const templateVars = { urls: urlDatabase }; not sure if i should add this line or not
  res.render("urls_new");
});

//redirect
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.shorURL];
  res.redirect(longURL);
});

//edit urls page
app.get("/urls/:id", (req, res) => {
  const templateVars = { shorURL: req.params.shortURL, longURL: urlDatabase[req.params.shorURL] };
  res.render("urls_show", templateVars);
});

/*app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});*/

//new shorturl
app.post("/urls", (req, res) => {
  //put the random string generator in here?
  const shorURL = generateRandomString();
  const longURL = req.body.longURL;
  res.send("Ok"); // will change later, placeholder
  urlDatabase[shortURL] = longURL;
  //use built-in redirect function
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
  const email = req.body.email;
  const psswd = req.body.password;
  
  res.cookie("user_id");
  //redirect after login
  res.redirect(`/urls/`);
});

//logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect(`/urls/`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
