const mongoose = require("mongoose")

const connect = mongoose.connect("mongodb+srv://ramshiv590:Shivram1*@cluster0.bdhqioq.mongodb.net/")

connect.then(()=>{
    console.log("Database connected successfully")
})
.catch(()=>{
    console.log("Database cannot be connected");
});
// User Schema
const loginSchema= new mongoose.Schema({
    userID: {
        type: String,
        required: true,
    },
    password : {
        type:String ,
        required:true
    },
    pic: {
        data: {
            type: Buffer,
            default: Buffer.from([]) // Default to an empty buffer
        },
        contentType: {
            type: String,
            default: 'image.jpeg' // Default MIME type, adjust as needed
        }
    },
    name: {
        type: String,
    },
    approvalStatus: {
        type: Boolean, 
        default: false, // false means not approved yet and true is for the users who are
        
    }
})

const collection = new mongoose.model("Authentication_2nd.users", loginSchema);

module.exports = collection;