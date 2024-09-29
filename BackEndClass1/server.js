const express = require("express");
const app = express();
// app server ka ek instance hai

const bodyParser = require("body-parser");
app.use(bodyParser.json());
//local host 3000 pe run ho raha hai
app.listen(3000, () => {
  console.log("server starterd at port no. 3000");
});

//local host server pe home page pe get request maar rahe hai
app.get("/", (req,res) =>{
  res.send("hello ji kaise ho sab");
})

app.post("/api/cars", (req,res) => {
  const {name, brand} = req.body;
  console.log(name);
  console.log(brand);
  res.send("Car submitted successfy");
})

const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/myDatabase",{
  useNewUrlParser:true,
  useUnifiedTopology:true
})
.then( () => {console.log("connection succesfull")})
.catch( (e) => {console.log("Received an error")});