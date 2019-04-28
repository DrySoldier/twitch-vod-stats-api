const mongoose = require('mongoose');
require('dotenv').config
mongoose.Promise = global.Promise;
let isConnected;

module.exports = connectToDatabase = () => {
  if (isConnected) {
    console.log('=> using existing database connection', process.env.MONGODB_URI);
    return Promise.resolve();
  }

  console.log('=> using new database connection', process.env.MONGODB_URI);
  return mongoose.connect(process.env.MONGODB_URI)
    .then(db => { 
      isConnected = db.connections[0].readyState;
    });
};