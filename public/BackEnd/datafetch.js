const axios = require('axios');
const { MongoClient } = require('mongodb');
const fs = require('fs');

// MongoDB URI and database/collection names
const mongoUri = 'mongodb://localhost:27017'; 
const dbName = 'cvd';
const collectionName = 'cyberdata';

// Base URL for the CVE API
const baseUrl = 'https://services.nvd.nist.gov/rest/json/cves/2.0)';

// Path to the file to store last synchronization time
const lastSyncTimeFilePath = 'last_sync_time.json';

// Function to connect to MongoDB
async function connectToMongoDB() {
    const client = new MongoClient(mongoUri);
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    return { client, collection };
}

// Function to fetch data from the CVE API
async function fetchCveData(lastSyncTime) {
    try {
        const response = await axios.get(baseUrl, {
            params: {
                pubStartDate: lastSyncTime || '',
                resultsPerPage: 2000
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

// Function to clean and deduplicate data
function cleanAndDeduplicateData(data) {
    const cleanedData = [];

    data.resultCVEItems.forEach(entry => {
        cleanedData.push({
            cveId: entry.cve.CVE_data_meta.ID,
            descriptions: entry.cve.description.description_data.map(desc => desc.value)
        });
    });

    return cleanedData;
}

// Function to store data in MongoDB with cleaning and deduplication
async function storeDataInMongoDBWithCleaning(collection, data) {
    const result = await collection.insertMany(data);
    console.log(`${result.insertedCount} documents inserted`);
}

// Function to read last synchronization time from file
function readLastSyncTimeFromFile() {
    if (fs.existsSync(lastSyncTimeFilePath)) {
        return JSON.parse(fs.readFileSync(lastSyncTimeFilePath));
    } else {
        return null;
    }
}

// Function to write last synchronization time to file
function writeLastSyncTimeToFile(lastSyncTime) {
    fs.writeFileSync(lastSyncTimeFilePath, JSON.stringify(lastSyncTime));
}

// Main function for periodic synchronization
async function synchronizeCVEData() {
    try {
        // Connect to MongoDB
        const { client, collection } = await connectToMongoDB();

        // Read last synchronization time from file
        const lastSyncTime = readLastSyncTimeFromFile();

        // Fetch data from the CVE API
        const cveData = await fetchCveData(lastSyncTime);

        // Clean and deduplicate fetched data
        const cleanedData = cleanAndDeduplicateData(cveData);

        // Store cleaned data in MongoDB
        await storeDataInMongoDBWithCleaning(collection, cleanedData);

        // Update last synchronization time
        const newLastSyncTime = new Date().toISOString();
        writeLastSyncTimeToFile(newLastSyncTime);

        // Close the MongoDB connection
        client.close();
        console.log('CVE data synchronized successfully');
    } catch (error) {
        console.error('Error occurred during synchronization:', error);
    }
}

// Schedule job to run every 24 hours 
setInterval(synchronizeCVEData, 24 * 60 * 60 * 1000); // Interval in milliseconds
