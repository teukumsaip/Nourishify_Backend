const mongoose = require('mongoose');
const connect = mongoose.connect("mongodb+srv://nourishify:ppl12345@cluster0.zqahjjk.mongodb.net/nourishify");

// Check koneksi database
connect.then(() => {
    console.log("Database Connected Successfully");
})
.catch(() => {
    console.log("Database cannot be Connected");
})

// Schema database
const Loginschema = new mongoose.Schema({
    nisn: {
        type:Number,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

// mengirim data ke colection
const collection = new mongoose.model("siswas", Loginschema);

module.exports = collection;