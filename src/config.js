

const mongoose = require('mongoose');
const connect = mongoose.connect("mongodb+srv://nourishify:ppl12345@cluster0.zqahjjk.mongodb.net/nourishify");

// Check database connected or not
connect.then(() => {
    console.log("Database Connected Successfully");
})
.catch(() => {
    console.log("Database cannot be Connected");
})

// Create Schema
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

// collection part
const collection = new mongoose.model("siswas", Loginschema);

module.exports = collection;