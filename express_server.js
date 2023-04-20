//configuration
const express = require("express");
const app = express();
const PORT = 8080;
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true })); //populates req.body
app.use(cookieSession({ name: 'session', 
keys: ['gfhvytbgfhgrvytfg'] }));
//res.cookie('userID', templateVars);

const { generateRandomString, getUserByEmail, urlsForUser } = require('./helpers');

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {};

//++++GET++++

//"home page"
app.get('/', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  }
  res.redirect('/login');
});

//login page to start
app.get("/login", (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  res.render('urls_login', templateVars);
});

//registration (if not logged in)
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_registration", templateVars);
});

//url home page
app.get("/urls", (req, res) => { 
  const userID = req.session.user_id;
  const userURLS = urlsForUser(userID, urlDatabase);
  const templateVars = { urls: userURLS, user: users[userID]};
  if (userID) {
    res.render('urls_index', templateVars);
  } else {
    return res.status(401).send('Log in to view this page.');
  }
});

//urls/new above urls/id
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  if (req.session.user_id) {
    res.render("urls_new", templateVars);
  } else{
    res.redirect('/login');
  }
});

//redirect
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  if (!urlDatabase[shortURL] || !req.session.user_id) {
    return res.status(404).send('Cannot display page.');
  }
  if (!longURL.startsWith('http://')) {
    return res.redirect(`http://${longURL}`);
  }
  return res.redirect(longURL);
});

//show urls page
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!shortURL) {
    return res.status(404).send('This URL does not exist.');
  }
  const templateVars = {
    user: users[req.session.user_id],
    shortURL,
    urls: urlDatabase
  }
  if (!req.session.user_id || req.session.user_id !== urlDatabase[shortURL].userID) {
    return res.status(400).send('You must be logged in to view/edit this page.');
  } else {
    urlDatabase[shortURL].longURL = req.body.newURL;
    res.redirect('/urls/show', templateVars);
  }
});

//++++POST++++

//new shorturl
app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };
    res.redirect(`/urls/${shortURL}`);
  } else{
    return res.status(401).send('You must be logged in to create a new URL.');
  }
});

//delete url
app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    delete urlDatabase[req.params.shortURL];
    return res.redirect('/urls');
  }
  return res.status(400).send("Invalid request. Try again.");
});

//edit url
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  if (!urlDatabase[shortURL].userID === req.session.user_id) {
    return res.status(401).send("You must be logged in to view this page.");
  }
  urlDatabase[shortURL].longURL = longURL;
  res.redirect(`/urls/${shortURL}`);
});

//login method
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const currentUser = getUserByEmail
  if (!currentUser) {
    return res.status(400).send('Please provide a valid email and password.');
  }
  if (!bcrypt.compareSync(password, currentUser.password)) {
    return res.status(400).send('Please provide a valid email and password.');
  }
  req.session.user_id = currentUser.id;
  res.redirect('/urls');
});

//register method
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const userEmail = req.body.email;
  const userPsswd = req.body.password;
  const newUser = { id: userID,
    email: userEmail,
    password: bcrypt.hashSync(userPsswd, 10)};
  if (userEmail === '' || userPsswd === '') {
    return res.status(400).send('Provide a valid username and password.');
  }
  if (getUserByEmail(userEmail, users)) {
    return res.status(400).send('Account with email already exists.')
  }
  users[userID] = newUser;
  req.session.user_id = userID;
  res.redirect(`/login`);
});

//logout method
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});
