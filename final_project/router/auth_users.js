const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

// Task 7 / Question 8: Login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({ data: username }, 'access', { expiresIn: 60 * 60 });
        req.session.authorization = {
            accessToken,
            username
        };
        return res.status(200).send("Customer successfully logged in");
    } else {
        return res.status(401).json({ message: "Invalid Login. Check username and password" });
    }
});

// Task 8 / Question 9: Add/Modify Review (Returns confirmation AND reviews object)
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.authorization ? req.session.authorization.username : null;

    if (!review) {
        return res.status(400).json({ message: "Review text is required" });
    }

    if (books[isbn]) {
        if (!books[isbn].reviews) {
            books[isbn].reviews = {};
        }
        books[isbn].reviews[username] = review;
        return res.status(200).send(`The review for the book with ISBN ${isbn} has been added/updated.\n` + JSON.stringify(books[isbn].reviews, null, 2));
    } else {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }
});

// Task 9 / Question 10: Delete Review (Exact message: "Review for ISBN 1 deleted.")
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization ? req.session.authorization.username : null;

    if (books[isbn]) {
        if (books[isbn].reviews && books[isbn].reviews[username]) {
            delete books[isbn].reviews[username];
            return res.status(200).send(`Review for ISBN ${isbn} deleted.`);
        } else {
            return res.status(404).json({ message: `No review found under username ${username} for ISBN ${isbn}` });
        }
    } else {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;