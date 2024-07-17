require('dotenv').config();
const moment = require('moment');

const requiredEnvVars = ['AIRTABLE_API_KEY', 'AIRTABLE_BASE_ID', 'BACKUP_FOLDER_PATH'];

// Validate required environment variables
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`Environment variable ${varName} is not set`);
  }
});

module.exports = {
  AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY,
  AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID,
  BACKUP_FOLDER_PATH: process.env.BACKUP_FOLDER_PATH,
  CONCURRENT_DOWNLOADS: 20,
  BACKUP_FOLDER_NAME: moment().format('YYYYMMDD HH-mm-ss')
};