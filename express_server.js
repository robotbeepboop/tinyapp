//configuration
const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
const cookieParser = require('cookie-parser');
app.use(express.urlencoded({ extended: true })); //populates req.body
app.use(cookieParser());
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

const users = {
  abd: {
    id: "abc",
    email: "a@a.com",
    password: "1234",
  },
  user2RandomID: {
    id: "def",
    email: "d@d.com",
    password: "5678",
  },
};

//++++GET++++

//"home page"
app.get('/', (req, res) => {
  if (req.cookies.userID) {
    res.redirect('/urls');
  }
  res.redirect('/login');
});

//login page to start
app.get("/login", (req, res) => {
  const currentUser = req.cookies.userID;
  if (currentUser) {
    return res.render("urls_login", templateVars);
  }
  const templateVars = { user: users[currentUser]};
  res.render('urls_login', templateVars);
});

//registration (if not logged in)
app.get("/register", (req, res) => {
  if (req.cookies.userID) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: users[req.cookies.userID]
  };
  res.render("urls_registration", templateVars);
});

//url home page
app.get("/urls", (req, res) => { 
  const userID = req.cookies.userID;
  const userURLS = urlsForUser(userID, urlDatabase);
  const templateVars = { urls: userURLS, user: users[userID]};
  res.render("urls_index", templateVars);
  if (userID) {
    res.render('urls_index', templateVars);
  } else {
    return res.status(401).send('Log in to view this page.');
  }
});

//urls/new above urls/id
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies.userID] };
  if (req.cookies.userID) {
    res.render("urls_new", templateVars);
  } else{
    res.redirect('/login');
  }
});

//redirect
app.get("/urls/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  console.log("longURL: ", longURL);
  res.redirect(longURL);
});

//show urls page
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const user = req.cookies.userID;
  const userURLS = urlsForUser(user, urlDatabase);
  const templateVars = { user: users[user], shortURL, urlDatabase, userURLS };
  if (urlDatabase[shortURL]) {
    res.render("urls_show", templateVars);
  } else{
    return res.status(401).send('You must be logged in to view this page.');
  }
});

app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies.userID
  };
  res.render("urls_index", templateVars);
})

//++++POST++++

//new shorturl
app.post("/urls", (req, res) => {
  if (req.cookies.userID) {
    const shorURL = generateRandomString();
    urlDatabase[shorURL] = {
      longURL: req.body.longURL,
      userID: req.cookies.userID
    };
    res.redirect(`/urls/${shorURL}`);
  } else{
    return res.status(401).send('You must be logged in to create a new URL.');
  }
});

//delete url, edit later
app.post("/urls", (req, res) => {
  const linkToDelete = req.params.shortURL;
  delete urlDatabase[linkToDelete];
  console.log("Link deleted.");
  res.redirect('/urls');
});

//edit url
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!req.cookies.userID || req.cookies.userID !== urlDatabase[shortURL].userID) {
    return res.status(400).send('You must be logged in to view/edit this page.');
  } else {
    urlDatabase[shortURL].longURL = req.body.newURL;
    res.redirect('/urls');
  }
});

//login method
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send('Please provide a valid email and password.');
  }
  let found = null;
  for (let key in users) {
    const user = users[key];
    if (user.email === email) {
      found = user;
    }
  }
  if (!found) {
    return res.status(400).send('No user with email found.');
  }
  if (found.password !== password) {
    return res.status(400).send('Password incorrect. Try again.');
  }
  //redirect (happy path yay)
  res.cookie('userID', found.id);
  return res.redirect(`/urls`);
});

//register method
app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPsswd = req.body.password;
  if (userEmail === '' || userPsswd === '') {
    return res.status(400).send('Provide a valid username and password.');
  }
  if (getUserByEmail(userEmail, users)) {
    return res.status(400).send('Account with email already exists.')
  }
  const user = { userEmail, userPsswd };
  res.redirect(`/urls/`);
});

//logout method
app.post("/logout", (req, res) => {
  res.clearCookie("userID");
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});
