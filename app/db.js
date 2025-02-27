const oracledb = require('oracledb');
const path = require('path');

// Set the directory for TNS_ADMIN (wallet files)
process.env.TNS_ADMIN = path.join(__dirname, 'wallet');
// Ensure we're using the Thin mode by not setting libDir
// oracledb.initOracleClient({ driverType: 'thin' });

const dbConfig = { 
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECTION_STRING,
};

module.exports = { oracledb, dbConfig };
