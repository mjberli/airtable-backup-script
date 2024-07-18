# Airtable Backup Script

This project is a Node.js tool designed to create a comprehensive backup of an Airtable base. It backs up table structures (JSON), data (JSON), and file attachments, ensuring you have a complete snapshot of your Airtable base.

Due to Airtable API restrictions, automation scripts are not backed up.

Airtable currently does not support the re-creation of bases from backup files in JSON format. At our company we use this tool as "last resort", to have all data secured in case we lose access to Airtable for whatever reason.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- Node.js (version 14 or later)
- npm (usually comes with Node.js)

## Installation

1. Clone this repository to your local machine:
   ```
   git clone git@github.com:mjberli/airtable-backup-script.git
   ```

2. Navigate to the project directory:
   ```
   cd airtable-backup-script
   ```

3. Install the required dependencies:
   ```
   npm install
   ```

## Configuration

The project uses environment variables for configuration. You need to create a `.env` file in the root directory of the project with the following variables:

```
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_BASE_ID=your_airtable_base_id
BACKUP_FOLDER_PATH=/path/to/your/backup/folder
```

Here's how to find each of these values:

### AIRTABLE_API_KEY

1. Log in to your Airtable account.
2. Go to your the [Developer Hub](https://airtable.com/create/tokens).
3. Create a new Personal Access Token

   You need to create a new Personal Access Token with the following scopes:

   - `schema.bases:read`
   - `data.records:read`

   Store this token in `AIRTABLE_API_KEY`

### AIRTABLE_BASE_ID

1. Open the Airtable base you want to back up.
2. Look at the URL in your browser. It will look something like this:
   ```
   https://airtable.com/appXXXXXXXXXXXXXX/tblYYYYYYYYYYYYYY/viwZZZZZZZZZZZZZZ
   ```
3. The `appXXXXXXXXXXXXXX` part is your Base ID.

### BACKUP_FOLDER_PATH

This is the local path where you want to store your backups. For example:
- On Windows: `C:\Users\YourUsername\Documents\AirtableBackups`
- On macOS/Linux: `/Users/YourUsername/Documents/AirtableBackups`

Make sure the specified folder exists and that you have write permissions for it.

## Running the Backup

To run the backup process, use the following command in the project root directory:

```
npm start
```

This will start the backup process. The tool will create a new folder in your specified backup directory, named with the current date and time.

## Backup Process

The backup process consists of several steps:

1. **Initialization**: A new backup folder is created with the current date and time.
2. **Fetching Table Metadata**: The tool retrieves information about all tables in your Airtable base.
3. **Backing Up Table Structures**: For each table, the structure (fields, views, etc.) is saved as a JSON file.
4. **Backing Up Table Data**: All records from each table are saved as JSON files.
5. **Downloading Attachments**: If any fields contain file attachments, these are downloaded and saved in the backup folder.

Progress is logged to the console, so you can monitor the backup as it progresses.

## Error Handling

If an error occurs during the backup process, the tool will:

1. Log the error to the console.
2. Attempt to delete the partially created backup folder.
3. Exit the process with a non-zero status code.

This ensures that incomplete or corrupted backups are not left on your system.

## Best Practices for Backup Management

After creating your backup, consider the following best practices:

1. **Compression**: Compress the backup folder to save space and make it easier to transfer. You can use tools like `tar` (on Unix-based systems) or `7-Zip` (on Windows).

   Example (Unix):
   ```
   tar -czf compressed.tar.gz /path/to/your/backup/folder
   ```

2. **Offsite Storage**: Store a copy of your backup in a different physical location or cloud storage service (e.g., AWS S3, Google Cloud Storage, Dropbox).

3. **Rotation**: Implement a backup rotation strategy to maintain a history of backups while managing storage space. For example, you might keep:
   - Daily backups for the past week
   - Weekly backups for the past month
   - Monthly backups for the past year

4. **Automation**: Set up a cron job (on Unix-based systems) or a scheduled task (on Windows) to run the backup process automatically at regular intervals.

## No Warranty
This software is provided for use at your own risk, without any warranty of any kind. The authors or copyright holders are not liable for any claims, damages, or other liabilities that may arise from the use or inability to use this software.