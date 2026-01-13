// Seed script to schedule the test for a student
// Run with: node src/seeds/scheduleTestForStudent.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Test from '../models/Test.js';
import TestSubmission from '../models/TestSubmission.js';
import Student from '../models/Student.js';
import Recruiter from '../models/Recruiter.js';

dotenv.config();

const scheduleTestForStudent = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find the test
        const test = await Test.findOne({ status: 'published' });
        if (!test) {
            console.log('No published test found. Run seedTests.js first.');
            process.exit(1);
        }

        // Find a student
        const student = await Student.findOne();
        if (!student) {
            console.log('No student found. Please create a student first.');
            process.exit(1);
        }

        // Find a recruiter
        const recruiter = await Recruiter.findOne();
        if (!recruiter) {
            console.log('No recruiter found.');
            process.exit(1);
        }

        console.log(`Test: ${test.title}`);
        console.log(`Student: ${student.firstName} ${student.lastName}`);
        console.log(`Recruiter: ${recruiter.companyName}`);

        // Check if already scheduled
        const existing = await TestSubmission.findOne({
            testId: test._id,
            studentId: student._id,
        });

        if (existing) {
            console.log('\nTest already scheduled for this student.');
            console.log(`Status: ${existing.status}`);
            console.log(`Submission ID: ${existing._id}`);
            process.exit(0);
        }

        // Schedule the test (available now, expires in 7 days)
        const scheduledAt = new Date();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const submission = await TestSubmission.create({
            testId: test._id,
            studentId: student._id,
            scheduledBy: recruiter._id,
            scheduledAt,
            expiresAt,
            status: 'scheduled',
            scores: {
                maxScore: test.totalMarks,
            },
        });

        console.log('\n=== Test Scheduled Successfully ===');
        console.log(`Submission ID: ${submission._id}`);
        console.log(`Scheduled At: ${scheduledAt.toLocaleString()}`);
        console.log(`Expires At: ${expiresAt.toLocaleString()}`);
        console.log('\nThe student can now see and start this test from "My Tests" page!');

        process.exit(0);
    } catch (error) {
        console.error('Error scheduling test:', error);
        process.exit(1);
    }
};

scheduleTestForStudent();
