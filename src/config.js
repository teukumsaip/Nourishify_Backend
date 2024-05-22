const mongoose = require('mongoose');
const connect = mongoose.connect("mongodb+srv://nourishify:ppl12345@cluster0.zqahjjk.mongodb.net/nourishify");

// Check koneksi database
connect.then(() => {
    console.log("Database Connected Successfully");
})
.catch(() => {
    console.log("Database cannot be Connected");
})

const Siswaschema = new mongoose.Schema({
    nisn: {
        type: Number,
        required: true,
        unique: true,
        immutable: true
    },
    password: {
        type: String,
        required: true
    },
    nama: {
        type: String,
        required: false,
        immutable: true
    },
    tempat_lahir: {
        type: String,
        required: false
    },
    tanggal_lahir: {
        type: Date,
        required: false 
    },
    gender: {
        type: String,
        enum: ['Laki-laki', 'Perempuan'], 
        required: false,
        immutable: true
    },
    angkatan: {
        type: Number,
        required: false
    },
    kelas: {
        type: String,
        required: false
    }
});

const SiswaModel = mongoose.model("siswas", Siswaschema);

const AdminSchema = new mongoose.Schema({
    nama: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

const AdminModel = mongoose.model("admins", AdminSchema);

const MenuSchema = new mongoose.Schema({
    nama_menu: {
        type: String,
        required: true
    },
    detail_menu: {
        type: String,
        required: true
    },
    stok: {
        type: Number,
        required: true
    }
});

const MenuModel = mongoose.model("Menu", MenuSchema);

const TransaksiSchema = new mongoose.Schema({
    tanggal: {
        type: Date,
        default: Date.now
    },
    siswa_nisn: {
        type: Number,
        required: true
    },
    menu_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Menu',
        required: true
    }
});

const TransaksiModel = mongoose.model("Transaksi", TransaksiSchema);

const BoothSchema = new mongoose.Schema({
    nama: {
        type: String,
        required: true
    },
    alamat: {
        type: String,
        required: true
    }
});

const BoothModel = mongoose.model("Booth", BoothSchema);

module.exports = {
    SiswaModel,
    AdminModel,
    MenuModel,
    TransaksiModel,
    BoothModel
};