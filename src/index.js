const express = require("express")
const path = require("path")
const bcrypt = require("bcrypt")
const collection = require("./config")
const multer = require("multer")

const app = express()
//converting data into json
app.use(express.json());
app.use(express.urlencoded({extended: false}))

app.set('view engine', 'ejs')
app.use(express.static("public"))
app.use(express.static('uploads'));
app.get("/", (req,res)=>{
    res.render("home");
})
app.get("/loginadmin", (req,res)=>{
    res.render("loginadmin");
})
app.get("/loginuser", (req,res)=>{
    res.render("loginuser");
})
app.get("/adminview",(req,res)=>{
    res.render("adminview")
})
app.get("/admin",(req,res)=>{
    res.render("admin")
})

const Storage = multer.diskStorage({
    destination: 'uploads',
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({
    storage: Storage,
}).single('userPhoto');

app.post('/upload/:userID', upload, async (req, res) => {
    try {
        const userID = req.params.userID;
        const newName = req.body.userName;

        if (!userID) {
            return res.status(400).send('User ID is required');
        }

        const existingUser = await collection.findOne({ userID });

        if (!existingUser) {
            return res.status(404).send('User not found');
        }

        // Update user details with the new name and/or photo
        existingUser.name = newName || existingUser.name;

        if (req.file) {
            existingUser.pic = {
                data: req.file.filename,
                contentType: req.file.mimetype,
            };
        }

        await existingUser.save();
        res.send('Successfully updated user details');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post("/createuser", async(req,res)=>{
    const data = {
        userID: req.body.userID,
        password: req.body.password
    }

    const existingUser = await collection.findOne({userID: data.userID});
    if(existingUser){
        res.send("User already exists. Please use a different ID")//will modify using inbuilt message
    }
    else{

        //hashing
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);
        data.password = hashedPassword;
        const userdata = await collection.insertMany(data);
        console.log(userdata);
        res.redirect("/admin")
    }    
})

app.post("/loginuser", async(req,res)=>{
    try {
        console.log(req.body);
        const check = await collection.findOne({userID: req.body.userID})
        console.log(check);
        if(!check){
            res.send("ID cannot be found!")//can be modified as an inbuilt message
        }
        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if (!isPasswordMatch) {
            return res.send('Invalid Password!');//modify
        }
        else{
            res.render("usercreate", {check});
        }

    } catch (error) {
        res.send("incorrect details")
    } 
}) 


app.post("/viewuser", async(req,res)=>{
    try {
        const id1 = req.body.userID1;
        const id2 =req.body.userID2;
        if (!id1 && !id2) {
            return res.send("Please enter either one or both of the User IDs");
        }

        let result = [];

        if (id1) {
            const check1 = await collection.findOne({ userID: id1 });
            if (check1) {
                result.push(check1);
            } else {
                return res.send(`No user found with the User ID ${id1}`);
            }
        }

        if (id2) {
            const check2 = await collection.findOne({ userID: id2 });
            if (check2) {
                result.push(check2);
            } else {
                return res.send(`No user found with the User ID ${id2}`);
            }
        }
        console.log(result)
        res.render("adminview", { result });
        
    } 
    catch (error) {
        res.send("Cannot fetch details!");
    }
})

// for admin password, keeping admin userID = 987654, and admin password = 987654,
app.post("/loginadmin", async (req,res)=>{
    try {
        console.log(req.body);
        var userID = req.body.userID;
        var password = req.body.password;
        if (userID!="987654"){
            res.send("THis is not an admin, you cannot log in !");
        }
        if(password != "987654"){
            res.send("Incorrect Password!");
        }
        else{
            res.render("admin");
        }
    } catch (error) {
        
    }
})


app.post("/approve", async (req, res) => {
    try {
        const userID = req.body.userID;

        // Update the approval status in the MongoDB collection
        await collection.updateOne({ userID: userID }, { $set: { approvalStatus: true } });

        // Redirect back to the adminview page or send a success message
        res.redirect("/admin");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error approving user");
    }
});

app.post("/delete", async(req,res)=>{
    try {
        const userID = req.body.userID;
        await collection.deleteOne({userID : userID});
        res.redirect("/admin");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error deleting user");
    }
})

const port = 5000;

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`)
});