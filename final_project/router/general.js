const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (users.filter(user => user.username === username).length > 0) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username: username, password: password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

public_users.get('/',function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn], null, 4));
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});
  
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  let filtered_books = [];

  Object.keys(books).forEach(key => {
    if (books[key].author === author) {
      filtered_books.push(books[key]);
    }
  });

  if (filtered_books.length > 0) {
    return res.status(200).send(JSON.stringify(filtered_books, null, 4));
  } else {
    return res.status(404).json({ message: "No books found for this author" });
  }
});

public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  let filtered_books = [];

  Object.keys(books).forEach(key => {
    if (books[key].title === title) {
      filtered_books.push(books[key]);
    }
  });

  if (filtered_books.length > 0) {
    return res.status(200).send(JSON.stringify(filtered_books, null, 4));
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
