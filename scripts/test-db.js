// eslint-disable-next-line @typescript-eslint/no-require-imports
const mongoose = require('mongoose');

async function testConnection() {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        console.error('\x1b[31m%s\x1b[0m', 'Error: MONGODB_URI is not defined in your environment variables.');
        console.log('Please check your .env file.');
        process.exit(1);
    }

    console.log('Attempting to connect to MongoDB...');
    
    try {
        await mongoose.connect(uri);
        console.log('\x1b[32m%s\x1b[0m', 'Successfully connected to MongoDB!');
        
        const dbName = mongoose.connection.name;
        console.log(`Connected to database: ${dbName}`);
        
        await mongoose.connection.close();
        console.log('Connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', 'Failed to connect to MongoDB:');
        console.error(error.message);
        process.exit(1);
    }
}

testConnection();
