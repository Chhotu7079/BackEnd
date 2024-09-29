const mongoose = require("mongoose");

require("dotenv").config();

const connectDb = () => {
    mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(console.log("DB Connected Successfuly"))
    .catch( (e) => {
      console.log("DB Facing connection Isuues");
      console.og(e);
      process.exit(1);
    })
};

module.exports = connectDb;

