const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose');

const acceptorSchema = new Schema({
    a_name: {type: String},
    a_email: {type: String},
    a_blood_group: {type : String},
    a_dob:{type: Date},
    a_address: {type : String},
    a_city: {type : String},
    a_province: {type: String},
    a_country: {type: String},
    a_phone_number:{type: String}
},{timestamps:true})

acceptorSchema.plugin(passportLocalMongoose);
const acceptor = mongoose.model('acceptorSchema', acceptorSchema);
module.exports = acceptor