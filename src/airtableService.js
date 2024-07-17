const Airtable = require('airtable');
const axios = require('./axiosConfig');
const config = require('./config');

class AirtableService {
  constructor() {
    this.base = new Airtable({ apiKey: config.AIRTABLE_API_KEY }).base(config.AIRTABLE_BASE_ID);
  }

  /**
   * Fetch table metadata for the Airtable base
   * @returns {Promise<Array>} Array of table metadata objects
   * @throws {Error} If there's an issue fetching the metadata
   */
  async fetchTableMetadata() {
    try {
      const response = await axios.get(`https://api.airtable.com/v0/meta/bases/${config.AIRTABLE_BASE_ID}/tables`, {
        headers: { Authorization: `Bearer ${config.AIRTABLE_API_KEY}` }
      });
      return response.data.tables;
    } catch (error) {
      throw new Error(`Failed to fetch table metadata: ${error.message}`);
    }
  }

  /**
   * Fetch all records from a specific table
   * @param {string} tableName - Name of the table to fetch records from
   * @returns {Promise<Array>} Array of records from the table
   * @throws {Error} If there's an issue fetching the records
   */
  async fetchTableRecords(tableName) {
    try {
      return await this.base(tableName).select().all();
    } catch (error) {
      throw new Error(`Failed to fetch records from table ${tableName}: ${error.message}`);
    }
  }
}

module.exports = new AirtableService();