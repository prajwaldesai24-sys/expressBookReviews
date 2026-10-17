const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password must be provided" });
    }
    const userExists = users.some(u => u.username === username);
    if (userExists) {
        return res.status(409).json({ message: "User already exists!" });
    }
    users.push({ username, password });
    return res.status(200).json({ message: "User successfully registred. Now you can login" });
});

// Task 1 & Task 10 Method 1: Get the book list available in the shop using Promise / Async-Await
public_users.get('/', function (req, res) {
    const getBooks = new Promise((resolve, reject) => {
        resolve(books);
    });
    getBooks.then((b) => {
        return res.status(200).send(JSON.stringify(b, null, 4));
    }).catch((err) => {
        return res.status(500).json({ message: "Error fetching books", error: err });
    });
});

// Task 2 & Task 10 Method 2: Get book details based on ISBN using Promise / Async-Await
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const getBook = new Promise((resolve, reject) => {
        if (books[isbn]) {
            resolve(books[isbn]);
        } else {
            reject("Book not found");
        }
    });
    getBook.then((book) => {
        return res.status(200).json(book);
    }).catch((err) => {
        return res.status(404).json({ message: err });
    });
});

// Task 3 & Task 10 Method 3: Get book details based on author using Promise / Async-Await
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author.toLowerCase();
    const getBooksByAuthor = new Promise((resolve, reject) => {
        const matched = [];
        Object.keys(books).forEach(isbn => {
            if (books[isbn].author.toLowerCase() === author) {
                matched.push({ isbn, ...books[isbn] });
            }
        });
        if (matched.length > 0) {
            resolve(matched);
        } else {
            reject("No books found by this author");
        }
    });
    getBooksByAuthor.then((result) => {
        return res.status(200).json(result);
    }).catch((err) => {
        return res.status(404).json({ message: err });
    });
});

// Task 4 & Task 10 Method 4: Get all books based on title using Promise / Async-Await
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title.toLowerCase();
    const getBooksByTitle = new Promise((resolve, reject) => {
        const matched = [];
        Object.keys(books).forEach(isbn => {
            if (books[isbn].title.toLowerCase() === title) {
                matched.push({ isbn, ...books[isbn] });
            }
        });
        if (matched.length > 0) {
            resolve(matched);
        } else {
            reject("No books found with this title");
        }
    });
    getBooksByTitle.then((result) => {
        return res.status(200).json(result);
    }).catch((err) => {
        return res.status(404).json({ message: err });
    });
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).json(books[isbn].reviews);
    }
    return res.status(404).json({ message: "Book not found" });
});

module.exports.general = public_users;