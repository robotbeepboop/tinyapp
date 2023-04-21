//generate random string for url shortener
//put it up here to keep it out of the way of the rest of the code
const generateRandomString = () => {
  const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  //changed while loop into for loop
  for (let i = 0; i < 7; i++) {
    randomString += possibleChars[Math.floor(Math.random() * possibleChars.length)];
  }
  return randomString;
};

const getUserByEmail = (emailAddress, database) => {
  const values = Object.values(database);
  
  for (let value of values) {
    const user = database[value];
    if (user.email === emailAddress) {
      return user;
    }
  }
  return undefined;
};

const urlsForUser = (id, database) => {
  let userURLS = {}; //empty object to fill in
  const keys = Object.keys(database)
  for (let key of keys) {
    const url = database[key];
    if (url.userID === id) {
      userURLS[key] = url;
    }
  }
  return userURLS;
};

module.exports = { generateRandomString, getUserByEmail, urlsForUser };
