var mongoose=require("mongoose"),
    passportLocalMongoose=require("passport-local-mongoose");

var userSchema=new mongoose.Schema({
    fname:String,
    lname:String,
    email:String,
    password:String
})
userSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model("User",userSchema);