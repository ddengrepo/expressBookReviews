const express = require('express');
let books = require("./booksdb.js");
const { JsonWebTokenError } = require('jsonwebtoken');
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// Check if a user with the given username already exists
const doesExist = (username) => {
  let userwithsamename = users.filter((user) => {
    return user.username === username;
  });
  // Return true if any user with the same username is found, otherwise, false
  if (userwithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
}


// Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (username && password) {
    // Check if the user does not already exist
    if (!doesExist(username)) {
      users.push({
        "username": username,
        "password": password
      });
      return res.status(200).json({ message: 'User successfully registered. Now you can login' })
    } else {
      return res.status(404).json({ message: 'User already exists' })
    }
  } else {
    return res.status(404).json({ message: 'Please provide both username and password' })
  }
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.send(JSON.stringify(books[isbn], null, 4));
  } else {
    return res.status(404).json({ message: "Book not found." });
  }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const booksByAuthor = Object.values(books).filter(book => book.author === author);

  const enumeratedBooks = booksByAuthor.map((book, index) => {
    return {
      id: index + 1, // Start index from 1
      ...book, // Spread the original book properties
    };
  });

  return res.send(JSON.stringify(enumeratedBooks, null, 4));
});


// Get book details based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  const booksByTitle = Object.values(books).filter(book => book.title === title);

  const enumeratedBooks = booksByTitle.map((book, index) => {
    return {
      id: index + 1, // Start index from 1
      ...book, // Spread the original book properties
    };
  });

  return res.send(JSON.stringify(enumeratedBooks, null, 4));
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    if (Object.values(books[isbn].reviews).length == 0) {
      return res.send({ message: 'No reviews for this book' })
    } else {
      return res.send(JSON.stringify(books[isbn].reviews, null, 4));
    }
  }
});


module.exports.general = public_users;
