const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');
const public_users = express.Router();

// Task 6: Register a new user
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

// Task 1: Get the book list available in the shop
public_users.get('/', function (req, res) {
    return res.status(200).send(JSON.stringify(books, null, 4));
});

// Task 2: Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).json(books[isbn]);
    }
    return res.status(404).json({ message: "Book not found" });
});

// Task 3: Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author.toLowerCase();
    const matchedBooks = [];

    Object.keys(books).forEach(isbn => {
        if (books[isbn].author.toLowerCase() === author) {
            matchedBooks.push({ isbn, ...books[isbn] });
        }
    });

    if (matchedBooks.length > 0) {
        return res.status(200).json(matchedBooks);
    }
    return res.status(404).json({ message: "No books found by this author" });
});

// Task 4: Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title.toLowerCase();
    const matchedBooks = [];

    Object.keys(books).forEach(isbn => {
        if (books[isbn].title.toLowerCase() === title) {
            matchedBooks.push({ isbn, ...books[isbn] });
        }
    });

    if (matchedBooks.length > 0) {
        return res.status(200).json(matchedBooks);
    }
    return res.status(404).json({ message: "No books found with this title" });
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).json(books[isbn].reviews);
    }
    return res.status(404).json({ message: "Book not found" });
});

// --------------------------------------------------------------------------
// Task 10: Asynchronous implementations using Async/Await & Promises with Axios
// --------------------------------------------------------------------------

// Task 10.1: Get all books using async/await with Axios
public_users.get('/async/books', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:5000/');
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({ message: "Error retrieving books", error: error.message });
    }
});

// Task 10.2: Get book by ISBN using Promises with Axios
public_users.get('/async/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    axios.get(`http://localhost:5000/isbn/${isbn}`)
        .then(response => res.status(200).json(response.data))
        .catch(error => res.status(error.response ? error.response.status : 500).json({ message: error.message }));
});

// Task 10.3: Get books by Author using async/await with Axios
public_users.get('/async/author/:author', async (req, res) => {
    const author = req.params.author;
    try {
        const response = await axios.get(`http://localhost:5000/author/${author}`);
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(error.response ? error.response.status : 500).json({ message: error.message });
    }
});

// Task 10.4: Get books by Title using Promises with Axios
public_users.get('/async/title/:title', (req, res) => {
    const title = req.params.title;
    axios.get(`http://localhost:5000/title/${title}`)
        .then(response => res.status(200).json(response.data))
        .catch(error => res.status(error.response ? error.response.status : 500).json({ message: error.message }));
});

module.exports.general = public_users;