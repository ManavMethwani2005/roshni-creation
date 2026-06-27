const dns = require('dns');
dns.setServers(['8.8.8.8']);

const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });