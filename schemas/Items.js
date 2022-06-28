const mongoose = require("mongoose");

const Items = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    img: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model("items", Items);