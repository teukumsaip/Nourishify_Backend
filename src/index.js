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

app.get("/loginAdmin", (req, res) => {
    res.render("loginAdmin");
});

// Tambahkan rute untuk login siswa
app.get("/login", (req, res) => {
    res.render("login");
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

app.get('/signup/admin', (req, res) => {
  res.render('signupAdmin');
});

app.post("/signup/admin", async (req, res) => {
    try {
        const { nama, username, password } = req.body;
        if (!nama || !username || !password) {
            return res.status(400).send("Nama, username, dan password diperlukan.");
        }

        const existingAdmin = await AdminModel.findOne({ username });
        if (existingAdmin) {
            return res.status(400).send('Admin sudah ada. Silakan gunakan username yang berbeda.');
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newAdmin = new AdminModel({ nama, username, password: hashedPassword });
        await newAdmin.save();

        res.status(201).send("Admin berhasil ditambahkan.");
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
        const { username, password } = req.body;

        const admin = await AdminModel.findOne({ username });

        if (!admin) {
            return res.status(400).send("Admin tidak ditemukan");
        }

        const isPasswordMatch = await bcrypt.compare(password, admin.password);

        if (!isPasswordMatch) {
            return res.status(400).send("Password salah");
        }

        // Simpan informasi admin dalam sesi
        req.session.admin = admin;

        res.render("homeAdmin", { admin });
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
        const { nama, gender, tempat_lahir, tanggal_lahir, angkatan, kelas, current_password, new_password, confirm_password } = req.body;

        const siswa = await SiswaModel.findOne({ nisn });

        if (!siswa) {
            return res.status(404).send("Siswa tidak ditemukan");
        }

        const isPasswordMatch = await bcrypt.compare(current_password, siswa.password);
        if (!isPasswordMatch) {
            return res.status(400).send("Sandi saat ini salah");
        }

        siswa.nama = nama;
        siswa.gender = gender;
        siswa.tempat_lahir = tempat_lahir;
        siswa.tanggal_lahir = tanggal_lahir;
        siswa.angkatan = angkatan;
        siswa.kelas = kelas;

        if (new_password && new_password === confirm_password) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(new_password, saltRounds);
            siswa.password = hashedPassword;
        }

        await siswa.save();

        res.status(200).send("Informasi siswa berhasil diperbarui");
    } catch (error) {
        console.error(error);
        res.status(500).send("Kesalahan Server Internal");
    }
});

// Halaman Edit Profil Admin
app.get("/edit-profile", (req, res) => {
    // Periksa apakah ada admin dalam sesi sebelum merender halaman edit
    if (!req.session.admin) {
        return res.status(403).send("Anda tidak memiliki izin untuk mengakses halaman ini");
    }
    res.render("editProfileAdmin", { admin: req.session.admin });
});

// Rute untuk mengupdate profil admin
app.post("/edit-profile", async (req, res) => {
    try {
        // Periksa apakah ada admin dalam sesi sebelum mencoba mengakses properti _id
        if (!req.session.admin) {
            return res.status(403).send("Anda tidak memiliki izin untuk mengakses halaman ini");
        }
        
        const adminId = req.session.admin._id; // Mengambil ID admin dari sesi
        const { nama, username, current_password, new_password, confirm_password } = req.body;

        const admin = await AdminModel.findById(adminId);

        if (!admin) {
            return res.status(404).send("Admin tidak ditemukan");
        }

        // Periksa apakah password saat ini cocok sebelum mengubahnya
        const isPasswordMatch = await bcrypt.compare(current_password, admin.password);
        if (!isPasswordMatch) {
            return res.status(400).send("Sandi saat ini salah");
        }

        admin.nama = nama;
        admin.username = username;

        // Jika password baru dimasukkan dan cocok dengan konfirmasi
        if (new_password && new_password === confirm_password) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(new_password, saltRounds);
            admin.password = hashedPassword;
        }

        await admin.save();

        res.status(200).send("Informasi admin berhasil diperbarui");
    } catch (error) {
        console.error(error);
        res.status(500).send("Terjadi kesalahan saat memperbarui informasi admin");
    }
});

// Halaman Dashboard Admin
app.get("/admin/dashboard", checkAdminAuth, (req, res) => {
    res.render("homeAdmin", { admin: req.session.admin });
});

// Route untuk menampilkan profil admin
app.get("/profile", checkAdminAuth, (req, res) => {
    res.render("profileAdmin", { admin: req.session.admin });
});


// Proteksi rute-rute admin
function checkAdminAuth(req, res, next) {
    if (req.session.admin) {
        return next();
    }
    res.redirect('/loginAdmin');
};

const port = 5000;
app.listen(port, () => {
    console.log(`Server mendengarkan di port ${port}`);
});
