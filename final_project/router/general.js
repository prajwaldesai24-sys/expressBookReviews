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

// Task 1 & Task 10: Get all books using async-await with Axios
public_users.get('/', async function (req, res) {
    try {
        const getBooks = () => Promise.resolve(books);
        const bookList = await getBooks();
        return res.status(200).send(JSON.stringify(bookList, null, 4));
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books" });
    }
});

// Task 2 & Task 10: Get book details based on ISBN using Promises with Axios
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const fetchBook = new Promise((resolve, reject) => {
        if (books[isbn]) {
            resolve(books[isbn]);
        } else {
            reject({ status: 404, message: "Book not found" });
        }
    });

    fetchBook
        .then((book) => res.status(200).json(book))
        .catch((err) => res.status(err.status || 500).json({ message: err.message }));
});

// Task 3 & Task 10: Get book details based on author using async-await with Axios
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author.toLowerCase();
    try {
        const findByAuthor = () => new Promise((resolve, reject) => {
            const matchedBooks = [];
            Object.keys(books).forEach(isbn => {
                if (books[isbn].author.toLowerCase() === author) {
                    matchedBooks.push({ isbn, ...books[isbn] });
                }
            });
            if (matchedBooks.length > 0) resolve(matchedBooks);
            else reject({ status: 404, message: "No books found by this author" });
        });

        const result = await findByAuthor();
        return res.status(200).json(result);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
});

// Task 4 & Task 10: Get all books based on title using Promises with Axios
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title.toLowerCase();
    const findByTitle = new Promise((resolve, reject) => {
        const matchedBooks = [];
        Object.keys(books).forEach(isbn => {
            if (books[isbn].title.toLowerCase() === title) {
                matchedBooks.push({ isbn, ...books[isbn] });
            }
        });
        if (matchedBooks.length > 0) resolve(matchedBooks);
        else reject({ status: 404, message: "No books found with this title" });
    });

    findByTitle
        .then((result) => res.status(200).json(result))
        .catch((err) => res.status(err.status || 500).json({ message: err.message }));
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).json(books[isbn].reviews);
    }
    return res.status(404).json({ message: "Book not found" });
});

// Dedicated Axios Async endpoints for Task 10
public_users.get('/axios/books', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:5000/');
        res.status(200).json(response.data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

public_users.get('/axios/isbn/:isbn', (req, res) => {
    axios.get(`http://localhost:5000/isbn/${req.params.isbn}`)
        .then(response => res.status(200).json(response.data))
        .catch(err => res.status(500).json({ message: err.message }));
});

public_users.get('/axios/author/:author', async (req, res) => {
    try {
        const response = await axios.get(`http://localhost:5000/author/${req.params.author}`);
        res.status(200).json(response.data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

public_users.get('/axios/title/:title', (req, res) => {
    axios.get(`http://localhost:5000/title/${req.params.title}`)
        .then(response => res.status(200).json(response.data))
        .catch(err => res.status(500).json({ message: err.message }));
});

module.exports.general = public_users;