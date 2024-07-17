const airtableService = require('./airtableService');
const backupService = require('./backupService');

async function main() {
  try {
    console.log('Starting Airtable backup process...');
    const backupFolder = await backupService.initializeBackup();
    
    console.log(`Backup folder created: ${backupFolder}`);

    const tables = await airtableService.fetchTableMetadata();
    console.log(`Found ${tables.length} tables`);

    let totalTableCount = 0;
    let totalFileCount = 0;
    let totalDataSize = 0;

    for (const table of tables) {
      console.log(`Backing up table: ${table.name}`);

      // Backup table structure
      await backupService.saveTableStructure(table);
      totalTableCount++;

      // Backup table data
      const records = await airtableService.fetchTableRecords(table.name);
      const dataSize = await backupService.saveTableData(table.name, records);
      totalDataSize += dataSize;

      // Download file attachments
      const { fileCount, dataSize: attachmentSize } = await backupService.downloadAttachments(table.name, records);
      totalFileCount += fileCount;
      totalDataSize += attachmentSize;
    }

    console.log('\nBackup completed successfully!');
    console.log(`Tables backed up: ${totalTableCount}`);
    console.log(`Files downloaded: ${totalFileCount}`);
    console.log(`Total data size: ${(totalDataSize / (1024 * 1024)).toFixed(2)} MB`);
  } catch (error) {
    console.error('An error occurred during the backup process:', error.message);
    
    console.log('Attempting to delete the backup folder...');
    await backupService.deleteBackupFolder();
    
    process.exit(1);
  }
}

// Handling unhandled rejections
process.on('unhandledRejection', async (error) => {
  console.error('Unhandled rejection:', error);
  console.log('Attempting to delete the backup folder...');
  await backupService.deleteBackupFolder();
  process.exit(1);
});

main();