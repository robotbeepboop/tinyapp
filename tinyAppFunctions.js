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
  for (let key in userList) {
    if (emailAddress === database[key].email) {
      return email;
    }
  }
  return undefined;
};

const urlsForUser = (id, database) => {
  let userURLS = {}; //empty object to fill in
  for (let key of Object.keys(database)) {
    if (database[key].userID === id) {
      userURLS[key] = database[key];
    }
  }
  return userURLS;
};

module.exports = { generateRandomString, getUserByEmail, urlsForUser };
