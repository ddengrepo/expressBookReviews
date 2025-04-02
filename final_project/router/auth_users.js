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
      username: username // Include the username in the JWT payload
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
  const isbn = req.params.isbn;
  const username = req.user.username; // Assuming req.user is populated by your auth middleware
  const review = req.query.review; // Review is in the query string

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  if (!review || typeof review !== "string") {
    return res.status(400).json({ message: "Invalid review provided." });
  }

  try {
    if (books[isbn].reviews && books[isbn].reviews[username]) {
      // User has already posted a review, so modify it
      books[isbn].reviews[username] = review;
      console.log(`Review for ISBN ${isbn} modified by ${username}`);
      return res.status(200).json({ message: "Review modified successfully." });
    } else {
      // User has not posted a review, so add a new one
      if (!books[isbn].reviews) {
        books[isbn].reviews = {}; // Initialize reviews object if it doesn't exist
      }
      books[isbn].reviews[username] = review;
      console.log(`Review for ISBN ${isbn} added by ${username}`);
      return res.status(200).json({ message: "Review added successfully." });
    }
  } catch (error) {
    console.error("Error adding/modifying review:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  console.log("Delete request received");

  const isbn = req.params.isbn;
  const username = req.user.username; // Get username from req.user (set by auth middleware)

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  if (!books[isbn].reviews) {
    return res.status(404).json({ message: "No reviews found for this book." });
  }

  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "You have not reviewed this book." });
  }

  try {
    delete books[isbn].reviews[username]; // Delete the user's review

    return res.status(200).json({ message: "Review deleted successfully." });
  } catch (error) {
    console.error("Error deleting review:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
