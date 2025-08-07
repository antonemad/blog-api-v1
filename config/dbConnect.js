const mongoose = require("mongoose");

//function to connect

const dbConnect = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL);
    console.log(`MongodDb connected to ${conn.connection.host}`);
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

dbConnect();
module.exports = dbConnect;
