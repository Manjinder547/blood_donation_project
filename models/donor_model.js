const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose');

const donorSchema = new Schema({
    d_name: {type: String},
    d_email: {type: String},
    d_blood_group: {type : String},
    d_dob:{type: Date},
    d_address: {type : String},
    d_city: {type : String},
    d_province: {type: String},
    d_country: {type: String},
    d_phone_number:{type: String}
},{timestamps:true})

donorSchema.plugin(passportLocalMongoose);
const donor = mongoose.model('donorSchema', donorSchema)
module.exports = donor