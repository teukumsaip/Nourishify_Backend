const express = require("express");
const path = require("path");
const collection = require("./config");
const bcrypt = require('bcrypt');

const app = express();
// convert data into json format
app.use(express.json());
// Static file
app.use(express.static("public"));

app.use(express.urlencoded({ extended: false }));
//use EJS as the view engine
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

// Register User
app.post("/signup", async (req, res) => {
    try {
        // Validasi data
        const { nisn, password } = req.body;
        if (!nisn || !password) {
            return res.status(400).send("NISN and password are required.");
        }

        // Check if the username already exists in the database
        const existingUser = await collection.findOne({ nisn });
        if (existingUser) {
            return res.status(400).send('User already exists. Please choose a different NISN.');
        }

        // Hash the password using bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Simpan data pengguna ke database
        const newUser = new collection({ nisn, password: hashedPassword });
        await newUser.save();

        res.status(201).send("User created successfully.");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

//Login user 
app.post("/login", async (req, res) => {
    try {
        const check = await collection.findOne({ nisn: req.body.nisn });
        if (!check) {
            res.send("User not found");
        } else {
            // Bandingkan password yang di-hash dari database dengan password yang diberikan
            const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
            if (!isPasswordMatch) {
                res.send("Wrong password");
            } else {
                res.render("home");
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});



// Define Port for Application
const port = 5000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
});