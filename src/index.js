const express = require("express");
const path = require("path");
const collection = require("./config");
const bcrypt = require('bcrypt');
const { SiswaModel, AdminModel, MenuModel, TransaksiModel, BoothModel } = require("./config");


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
        const { nisn, password } = req.body;
        if (!nisn || !password) {
            return res.status(400).send("NISN and password are required.");
        }

        const existingUser = await SiswaModel.findOne({ nisn }); // Menggunakan SiswaModel
        if (existingUser) {
            return res.status(400).send('User already exists. Please choose a different NISN.');
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new SiswaModel({ nisn, password: hashedPassword });
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
        const check = await SiswaModel.findOne({ nisn: req.body.nisn });
        if (!check) {
            res.send("User not found");
        } else {
            const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
            if (!isPasswordMatch) {
                res.send("Wrong password");
            } else {
                // Assuming isAdmin is determined based on some criteria, adjust this according to your logic
                const isAdmin = false;

                res.render("home", { isAdmin }); // Pass isAdmin to the template
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

//Login admin
app.post("/admin/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await AdminModel.findOne({ email });

        if (!admin) {
            return res.send("Admin not found");
        }

        const isPasswordMatch = await bcrypt.compare(password, admin.password);

        if (!isPasswordMatch) {
            return res.send("Wrong password");
        }

        res.render("admin_dashboard"); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

// Define a GET route for displaying the profile of a siswa
app.get("/profile/siswa/:nisn", async (req, res) => {
    try {
        // Retrieve the NISN parameter from the URL
        const nisn = req.params.nisn;

        // Find the siswa in the database based on the NISN
        const siswa = await SiswaModel.findOne({ nisn });

        // If siswa is not found, send a 404 Not Found response
        if (!siswa) {
            return res.status(404).send("Siswa not found");
        }

        // Render the profileSiswa.ejs template and pass the siswa data to it
        res.render("profileSiswa", { siswa });
    } catch (error) {
        // If an error occurs, send a 500 Internal Server Error response
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

// Define Port for Application
const port = 5000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
});