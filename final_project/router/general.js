const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (users.find(u => u.username === username)) {
    return res.status(409).json({ message: "User already exists" });
  }
  if (typeof isValid === "function" && !isValid(username)) {
    return res.status(400).json({ message: "Invalid username" });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered" });
});

public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 2));
});

public_users.get('/isbn/:isbn', function (req, res) {
  const { isbn } = req.params;
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).send(JSON.stringify(book, null, 2));
});

public_users.get('/author/:author', function (req, res) {
  const author = String(req.params.author || "").toLowerCase();
  const result = Object.keys(books).reduce((acc, isbn) => {
    const book = books[isbn];
    if (book && typeof book.author === "string" && book.author.toLowerCase() === author) {
      acc[isbn] = book;
    }
    return acc;
  }, {});
  return res.status(200).send(JSON.stringify(result, null, 2));
});

public_users.get('/title/:title', function (req, res) {
  const title = String(req.params.title || "").toLowerCase();
  const result = Object.keys(books).reduce((acc, isbn) => {
    const book = books[isbn];
    if (book && typeof book.title === "string" && book.title.toLowerCase() === title) {
      acc[isbn] = book;
    }
    return acc;
  }, {});
  return res.status(200).send(JSON.stringify(result, null, 2));
});

public_users.get('/review/:isbn', function (req, res) {
  const { isbn } = req.params;
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  const reviews = book.reviews || {};
  return res.status(200).send(JSON.stringify(reviews, null, 2));
});

module.exports.general = public_users;