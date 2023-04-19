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

function getUserByEmail(emailAddress, userList) {
  for (let key in userList) {
    if (emailAddress === userList[key].email) {
      return email;
    }
  }
  return undefined;
}

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
//const cookieParser = require('cookie-parser');
app.use(express.urlencoded({ extended: true }));
//cookie parser
//app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//++++GET++++

//login page to start
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user"]]
  };
  res.render("urls_login", templateVars);
});

//registration (if not logged in)
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user"]]
  };
  res.render("urls_registration", templateVars);
});

//url home page
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: users[req.cookies["user"]] };
  res.render("urls_index", templateVars);
});

//urls/new above urls/id
app.get("/urls/new", (req, res) => {
  const templateVars = { username: users[req.cookies["user"]] };
  res.render("urls_new", templateVars);
});

//redirect
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shorURL];
  console.log("longURL: ", longURL);
  res.redirect(longURL);
});

//edit urls page
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shorURL: req.params.shortURL, longURL: urlDatabase[req.params.shorURL].longURL, username: users[req.cookies["user"]] };
  res.render("urls_show", templateVars);
});

/*app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});*/

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
app.post("/urls/:shortURL", (req, res) => {
  let longURL = req.body.longURL;
  urlDatabase[req.params.id].longURL = longURL;
  res.redirect('/urls');
});

//login method
app.post("/login", (req, res) => {
  let newCookie = req.body.username;
  res.cookie("user", newCookie);
  //redirect
  res.redirect(`/urls/`);
});

//register method
app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPsswd = req.body.password;
  if (userEmail === '' || userPsswd === '') {
    res.status(400);
  }
  if (getUserByEmail(userEmail, users)) {
    res.status(400).send('Account with email already exists.')
  }
  const user = { userEmail, userPsswd };
  res.redirect(`/urls/`);
});

//logout method
app.post("/logout", (req, res) => {
  res.clearCookie("user");
  res.redirect('/urls/');
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});
