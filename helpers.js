const generateRandomString = () => {
  const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  //changed while loop into for loop
  for (let i = 0; i < 6; i++) {
    randomString += possibleChars[Math.floor(Math.random() * possibleChars.length)];
  }
  return randomString;
};

const getUserByEmail = (emailAddress, database) => {
  for (let userObj in database) {
    if (database[userObj]['email'] === emailAddress) {
      return userObj;
    }
  }
  return undefined;
};

const urlsForUser = (id, database) => {
  let userURLS = {}; //empty object to fill in
  for (let key in database) {
    if (database[key].userID === id) {
      userURLS[key] = database[key];
    }
  }
  return userURLS;
};

module.exports = { generateRandomString, getUserByEmail, urlsForUser };
