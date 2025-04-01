const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
  if (users.filter(u => u.username === username).length > 0) {
    return true;
  }
  return false;
}

const authenticatedUser = (username, password) => { //returns boolean
  //write code to check if username and password match the one we have in records.
  if (users.filter(u => u.username === username && u.password === password).length > 0) {
    return true;
  }
  return false;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res.status(404).json({ message: 'Error logging in' });
  }
  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });
    req.session.authorization = {
      accessToken, username
    };
    return res.status(200).json({ message: 'Logged in Successfully' });
  }
  return res.status(404).json({ message: 'Wrong username or password' });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  return res.status(300).json({ message: "Yet to be implemented" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
