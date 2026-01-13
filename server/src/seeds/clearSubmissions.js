// Quick script to clear test submissions for fresh testing
// Run with: node src/seeds/clearSubmissions.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import TestSubmission from '../models/TestSubmission.js';

dotenv.config();

const clearSubmissions = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const count = await TestSubmission.countDocuments();
        console.log(`Found ${count} test submissions`);

        await TestSubmission.deleteMany({});
        console.log('✅ All test submissions cleared!');
        console.log('Now you can assign tests fresh.');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

clearSubmissions();
