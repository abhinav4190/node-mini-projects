const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const users = [];
const JWT_SECRET = "science"; 

function auth(req, res, next) {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: "Token is missing!" });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorized. Invalid token." });
        }

        const user = users.find(u => u.username === decoded.username);

        if (!user) {
            return res.status(401).json({ message: "User not found. Invalid token." });
        }

        req.user = user;
        next();
    });
}

app.post("/signup", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required!" });
    }

    if (username.length < 5) {
        return res.status(400).json({ message: "Username must be at least 5 characters long." });
    }

    const userExists = users.find(u => u.username === username);

    if (userExists) {
        return res.status(409).json({ message: "User already exists!" });
    }

    users.push({ username, password });

    return res.status(201).json({ message: "Signup successful!" });
});

app.post("/signin", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required!" });
    }

    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        return res.status(401).json({ message: "Invalid username or password!" });
    }

    const token = jwt.sign({ username: user.username }, JWT_SECRET);

    return res.status(200).json({
        message: "Signin successful!",
        token,
    });
});

app.get("/mystuff", auth, (req, res) => {
    res.send(`Your password is: ${req.user.password}`);
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
