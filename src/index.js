const express = require("express");
const path = require("path");
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const session = require('express-session');
const { SiswaModel, AdminModel, MenuModel, TransaksiModel, BoothModel } = require("./config");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

app.set("view engine", "ejs");

// Konfigurasi sesi
app.use(session({
    secret: 'your-secret-key', // Ganti dengan secret key yang lebih aman
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));

app.get("/", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.post("/signup", async (req, res) => {
    try {
        const { nisn, password } = req.body;
        if (!nisn || !password) {
            return res.status(400).send("NISN dan password diperlukan.");
        }

        const existingUser = await SiswaModel.findOne({ nisn });
        if (existingUser) {
            return res.status(400).send('Pengguna sudah ada. Silakan pilih NISN yang berbeda.');
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new SiswaModel({ nisn, password: hashedPassword });
        await newUser.save();

        res.status(201).send("Pengguna berhasil dibuat.");
    } catch (error) {
        console.error(error);
        res.status(500).send("Kesalahan Server Internal");
    }
});

app.post("/login", async (req, res) => {
    try {
        const { nisn, password } = req.body;
        const siswa = await SiswaModel.findOne({ nisn });

        if (!siswa) {
            return res.status(400).send("Pengguna tidak ditemukan");
        }

        const isPasswordMatch = await bcrypt.compare(password, siswa.password);
        if (!isPasswordMatch) {
            return res.status(400).send("Password salah");
        }

        // Simpan informasi pengguna dalam sesi
        req.session.siswa = siswa;

        res.render("home", { siswa });
    } catch (error) {
        console.error(error);
        res.status(500).send("Kesalahan Server Internal");
    }
});

app.post("/admin/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await AdminModel.findOne({ email });

        if (!admin) {
            return res.status(400).send("Admin tidak ditemukan");
        }

        const isPasswordMatch = await bcrypt.compare(password, admin.password);

        if (!isPasswordMatch) {
            return res.status(400).send("Password salah");
        }

        res.render("admin_dashboard");
    } catch (error) {
        console.error(error);
        res.status(500).send("Kesalahan Server Internal");
    }
});

app.get("/profile/siswa/:nisn", async (req, res) => {
    try {
        const nisn = req.params.nisn;

        const siswa = await SiswaModel.findOne({ nisn });

        if (!siswa) {
            return res.status(404).send("Siswa tidak ditemukan");
        }

        res.render("profileSiswa", { siswa });
    } catch (error) {
        console.error(error);
        res.status(500).send("Kesalahan Server Internal");
    }
});

app.get("/home", (req, res) => {
    // Tampilkan halaman home.ejs
    res.render("home", { siswa: req.session.siswa });
});

app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Gagal logout.");
        }
        res.redirect('/');
    });
});

app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Gagal logout.");
        }
        res.redirect('/');
    });
});

app.get("/profile/edit/:nisn", async (req, res) => {
    try {
        const nisn = req.params.nisn;
        const siswa = await SiswaModel.findOne({ nisn });

        if (!siswa) {
            return res.status(404).send("Siswa tidak ditemukan");
        }

        res.render("editProfile", { siswa });
    } catch (error) {
        console.error(error);
        res.status(500).send("Kesalahan Server Internal");
    }
});

app.post("/profile/update/:nisn", async (req, res) => {
    try {
        const nisn = req.params.nisn;
        const { nama, gender, tempat_lahir, tanggal_lahir, angkatan, kelas } = req.body;

        const siswa = await SiswaModel.findOneAndUpdate(
            { nisn },
            { nama, gender, tempat_lahir, tanggal_lahir, angkatan, kelas },
            { new: true }
        );

        if (!siswa) {
            return res.status(404).send("Siswa tidak ditemukan");
        }
        req.session.siswa = siswa;

        res.redirect(`/profile/siswa/${nisn}`);
    } catch (error) {
        console.error(error);
        res.status(500).send("Kesalahan Server Internal");
    }
});

const port = 5000;
app.listen(port, () => {
    console.log(`Server mendengarkan di port ${port}`);
});
