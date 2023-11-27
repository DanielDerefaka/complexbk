const mongoose = require('mongoose');
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config({ path: ".env" });

const Dbconnect = process.env.DB_URL;

const connectToDatabase = async () => {
  try {
    await mongoose.connect(Dbconnect, {
    
    });
    console.log("Connected to the database");
  } catch (err) {
    console.error("Error connecting to the database: " + err);
  }
};

module.exports = connectToDatabase;
