const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    carInfo:{
        type: String,
        trim: true,
        default:""
    },
    licensenumber:{
        type: String,
        trim: true,
        default:""
    },
    isAvailable:{
        type: Boolean,
        default: true
    }
},{
    timestamps: true
});


module.exports = mongoose.model('Driver', driverSchema);