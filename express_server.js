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

const { generateRandomString, getUserByEmail, urlsForUser } = require('./helpers');
const { users, urlDatabase } = require('./databases');

//++++GET++++


app.get('/', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  }
  res.redirect('/login');
});


app.get("/login", (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: users[req.session.user_id]
  };
  console.log(templateVars);
  res.render('urls_login', templateVars);
});


app.get("/register", (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: users[req.session.user_id]
  };
  console.log(templateVars);
  res.render("urls_registration", templateVars);
});


app.get("/urls", (req, res) => { 
  const userID = req.session.user_id;
  const userURLS = urlsForUser(userID, urlDatabase);
  const templateVars = { urls: userURLS, user: users[userID]};
  console.log(templateVars);
  if (userID) {
    res.render('urls_index', templateVars);
  } else {
    return res.status(401).send('Log in to view this page.');
  }
});


app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  console.log(templateVars);
  if (req.session.user_id) {
    res.render("urls_new", templateVars);
  } else{
    res.redirect('/login');
  }
});


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


app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!shortURL) {
    return res.status(404).send('This URL does not exist.');
  }
  if (shortURL in urlDatabase) {//check if that particular key exists in the database
    const templateVars = {
      user: users[req.session.user_id],
      shortURL,
      urls: urlDatabase
    }
    console.log(templateVars);
    urlDatabase[shortURL].longURL = req.body.newURL;
    res.render('/urls/show', templateVars);
  }
  return res.status(400).send("URL does not exist in URL Database.");
});

//++++POST++++


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


app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (shortURL in urlDatabase) {//if that url is in the database, continue
    if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
      delete urlDatabase[req.params.shortURL];
      return res.redirect('/urls');
    }
    return res.status(401).send("You must be logged in to perform this action.");
  }
  return res.status(400).send("Invalid request. Try again.");
});


app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  if (shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === req.session.user_id) {
      urlDatabase[shortURL].longURL = longURL;
      res.redirect(`/urls/${shortURL}`);
    }
    return res.status(401).send("You must be logged in to view this page.");
  }
  return res.status(400).send("Invalid request. Try again.");
});


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


app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});
