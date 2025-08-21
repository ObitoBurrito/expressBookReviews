const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.filter(user => user.username === username).length === 0;
};

const authenticatedUser = (username, password) => {
  return users.filter(user => user.username === username && user.password === password).length > 0;
};

regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid Login. Check username and password" });
  }

  const accessToken = jwt.sign({ username: username }, "access", { expiresIn: "1h" });
  if (!req.session) {
    return res.status(500).json({ message: "Session not initialized" });
  }
  req.session.authorization = { accessToken, username };
  return res.status(200).json({ message: "User successfully logged in" });
});

regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;

  if (!isbn || !books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!review || typeof review !== "string") {
    return res.status(400).json({ message: "Review text is required" });
  }

  let username = null;
  if (req.user && req.user.username) {
    username = req.user.username;
  } else if (req.session && req.session.authorization && req.session.authorization.username) {
    username = req.session.authorization.username;
  }

  if (!username) {
    return res.status(403).json({ message: "User not authenticated" });
  }

  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review added/updated successfully",
    reviews: books[isbn].reviews
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  if (!isbn || !books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  let username = null;
  if (req.user && req.user.username) {
    username = req.user.username;
  } else if (req.session && req.session.authorization && req.session.authorization.username) {
    username = req.session.authorization.username;
  }

  if (!username) {
    return res.status(403).json({ message: "User not authenticated" });
  }

  if (books[isbn].reviews && books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).json({
      message: "Review deleted successfully",
      reviews: books[isbn].reviews
    });
  } else {
    return res.status(404).json({ message: "No review by this user for the given ISBN" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
