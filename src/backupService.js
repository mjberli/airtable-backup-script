const fs = require('fs').promises;
const path = require('path');
const pLimit = require('p-limit');
const axios = require('./axiosConfig');
const config = require('./config');

class BackupService {
  constructor() {
    this.limit = pLimit(config.CONCURRENT_DOWNLOADS);
    this.currentBackupFolder = '';
  }

  /**
   * Initialize the backup process
   * @returns {Promise<string>} Path to the current backup folder
   */
  async initializeBackup() {
    const backupFolderName = config.BACKUP_FOLDER_NAME;
    this.currentBackupFolder = path.join(config.BACKUP_FOLDER_PATH, backupFolderName);
    await fs.mkdir(this.currentBackupFolder, { recursive: true });
    return this.currentBackupFolder;
  }

  /**
   * Save table structure to a JSON file
   * @param {Object} table - Table metadata object
   * @returns {Promise<void>}
   */
  async saveTableStructure(table) {
    const filePath = path.join(this.currentBackupFolder, `${table.name}_structure.json`);
    await fs.writeFile(filePath, JSON.stringify(table, null, 2));
  }

  /**
   * Save table data to a JSON file
   * @param {string} tableName - Name of the table
   * @param {Array} records - Array of records from the table
   * @returns {Promise<number>} Size of the saved data in bytes
   */
  async saveTableData(tableName, records) {
    const filePath = path.join(this.currentBackupFolder, `${tableName}_data.json`);
    const data = JSON.stringify(records, null, 2);
    await fs.writeFile(filePath, data);
    return Buffer.byteLength(data);
  }

  /**
   * Download file attachments for a table
   * @param {string} tableName - Name of the table
   * @param {Array} records - Array of records from the table
   * @returns {Promise<{fileCount: number, dataSize: number}>} Object containing the number of files downloaded and total data size
   */
  async downloadAttachments(tableName, records) {
    let fileCount = 0;
    let dataSize = 0;

    for (const [index, record] of records.entries()) {
      const downloadPromises = [];

      for (const [fieldName, field] of Object.entries(record.fields)) {
        if (Array.isArray(field) && field.length > 0 && field[0]?.url) {
          const recordFolderName = record.id;
          const attachmentFolder = path.join(this.currentBackupFolder, tableName, recordFolderName, fieldName);

          await fs.mkdir(attachmentFolder, { recursive: true });

          for (const attachment of field) {
            if (attachment?.url) {
              const downloadPromise = this.limit(async () => {
                try {
                  const response = await axios.get(attachment.url, { responseType: 'arraybuffer', timeout: 30000 });
                  const filePath = path.join(attachmentFolder, attachment.filename);
                  await fs.writeFile(filePath, Buffer.from(response.data));
                  fileCount++;
                  dataSize += response.data.byteLength;
                } catch (error) {
                  console.error(`Failed to download ${attachment.filename}: ${error.message}`);
                }
              });
              downloadPromises.push(downloadPromise);
            }
          }
        }
      }

      await Promise.all(downloadPromises);
      console.log(`Processed ${index + 1}/${records.length} records from ${tableName}`);
    }

    return { fileCount, dataSize };
  }

  /**
   * Sanitize folder name by removing invalid characters
   * @param {string} name - Folder name to sanitize
   * @returns {string|null} Sanitized folder name or null if input is falsy
   */
  sanitizeFolderName(name) {
    return name ? name.replace(/[<>:"\/\\|?*]+/g, '') : null;
  }

   /**
   * Delete the current backup folder and its contents
   * @returns {Promise<void>}
   */
   async deleteBackupFolder() {
    if (this.currentBackupFolder) {
      try {
        await fs.rm(this.currentBackupFolder, { recursive: true, force: true });
        console.log(`Deleted backup folder: ${this.currentBackupFolder}`);
      } catch (error) {
        console.error(`Failed to delete backup folder: ${error.message}`);
      }
    }
  }
}


module.exports = new BackupService();