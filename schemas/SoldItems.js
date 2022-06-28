const mongoose = require("mongoose");

const SoldItemsScheme = mongoose.Schema({
    price: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        require: true
    },
    clientName: {
        type: String,
        required: true,
    },
    clientAddres: {
        type: String,
        required: true,
    },
    clientPhone: {
        type: String,
        required: true,
    },
    finishedOrder:{
        type: Boolean,
        default: false,
    },
    date: {
        type: Date,
        default: Date.now(),
    },
});

module.exports = mongoose.model("soldItems", SoldItemsScheme);