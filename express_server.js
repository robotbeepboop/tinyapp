const express = require('express');
const app = express();
const PORT = 8080;
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const { generateRandomString, getUserByEmail, urlsForUser } = require('./helpers');

//++++MIDDLEWARE++++

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['ilovemycat']
}));

//++++DATABASES++++
//move these back to server.js because they are small and part of the configuration
const urlDatabase = { g5Tx3q: { longURL: "https://www.google.ca", userID: 'exampleUser'}};

let users = {
  'exampleUser' : {
    id: 'exampleUser',
    email:'user@example.com',
    password: 'supersecretpassword1'
  }
};

//++++GET++++

app.get('/', (req, res) => {
  const userID = req.session.user_id;
  if (userID) {
    res.redirect('/urls');
  }
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  const userID = req.session.user_id;
  if (userID) {
    return res.redirect('/urls');
  }
  const user = users[userID];
  const templateVars = { user: user };
  res.render('urls_login', templateVars);
});

app.get('/register', (req, res) => {
  const userID = req.session.user_id;
  if (userID) {
    return res.redirect('/urls');
  }
  const user = users[userID];
  const templateVars = { user: user };
  res.render("urls_registration", templateVars);
});

app.get('/urls', (req, res) => {
  const userID = req.session.user_id;
  const userURLS = urlsForUser(userID, urlDatabase);
  const templateVars = { urls: userURLS, user: users[userID] };
  if (userID) {
    console.log(templateVars);
    res.render('urls_index', templateVars);
  } else {
    return res.status(401).send('Log in to view this page.');
  }
});

app.get('/urls/new', (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
    const templateVars = { user: users[req.session.user_id] };
    res.render('urls_new', templateVars);
  }
});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const userID = req.session.user_id;
  if (!urlDatabase[shortURL] || !userID) {
    return res.status(404).send('Cannot display page.');
  } else {
    return res.redirect(longURL);
  }
});

//revise urls/:shorturl
app.get('/urls/:shortURL', (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {//check if that particular key exists in the database
    const templateVars = {
      shortURL: shortURL,
      longURL: urlDatabase[shortURL].longURL,
      user: users[userID],
      urlUserID: urlDatabase[shortURL].userID
    };
    return res.render('urls_show', templateVars);
  }
  return res.status(400).send('URL does not exist in URL Database.');
});


//++++POST++++

app.post('/urls', (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(401).send('You must be logged in to create a new URL.');
  } else {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: userID
    };
    res.redirect(`/urls/${shortURL}`);
  }
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  const userURLS = urlsForUser(userID, urlDatabase);
  if (Object.keys(userURLS).includes(shortURL)) {//check if the URL is in the database
    delete urlDatabase[shortURL];
    return res.redirect('/urls');
  }
  return res.status(400).send('Invalid request. Try again.');
});

app.post('/urls/:shortURL', (req, res) => {
  const userID = req.session.user_id;
  const userURLS = urlsForUser(userID, urlDatabase);
  const shortURL = req.params.shortURL;
  if (Object.keys(userURLS).includes(shortURL)) {//check if the URL is in the database
    urlDatabase[shortURL].longURL = req.body.newURL;
    res.redirect('/urls');
  }
  return res.status(400).send('Invalid request. Try again.');
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = getUserByEmail(email, users);

  if (!userID || !bcrypt.compareSync(password, users[userID].password)) {
    return res.status(400).send('Please provide a valid email and password.');
  }
  req.session.user_id = userID;
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (email === '' || password === '') {
    return res.status(400).send('Provide a valid username and password.');
  }
  if (getUserByEmail(email, users)) {
    return res.status(400).send('Account already exists.');
  }
  users[userID] = {
    id: userID,
    email: email,
    password: bcrypt.hashSync(password, 10)
  };
  req.session.user_id = userID;
  res.redirect('/login');
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});
