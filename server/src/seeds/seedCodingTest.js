// Seed a coding test for existing student
// Run with: node src/seeds/seedCodingTest.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Test from '../models/Test.js';
import TestSubmission from '../models/TestSubmission.js';
import Recruiter from '../models/Recruiter.js';
import Student from '../models/Student.js';

dotenv.config();

const codingTest = {
    title: 'Coding Skills Assessment',
    description: 'Test your problem-solving and coding skills with these programming challenges.',
    instructions: `
1. This test contains coding problems only.
2. You have 45 minutes to complete all questions.
3. Write clean, working code.
4. Your code will be tested against multiple test cases.
5. Use the "Run Code" button to test before submitting.
  `.trim(),
    type: 'technical',
    duration: 45,
    totalMarks: 100,
    passingPercentage: 40,
    inlineQuestions: [
        {
            type: 'coding',
            title: 'Sum of Two Numbers',
            problemStatement: `Write a program that takes two numbers as input and prints their sum.

Example:
Input:
5
3
Output:
8

Input Format:
- First line contains the first number
- Second line contains the second number

Output Format:
- Print the sum of the two numbers`,
            sampleInput: '5\n3',
            sampleOutput: '8',
            testCases: [
                { input: '5\n3', expectedOutput: '8', isHidden: false, points: 15 },
                { input: '10\n20', expectedOutput: '30', isHidden: false, points: 15 },
                { input: '-5\n5', expectedOutput: '0', isHidden: true, points: 10 },
                { input: '100\n200', expectedOutput: '300', isHidden: true, points: 10 },
            ],
            points: 50,
            order: 0,
        },
        {
            type: 'coding',
            title: 'Find Maximum',
            problemStatement: `Write a program that finds the maximum number from a list of space-separated integers.

Example:
Input:
3 7 2 9 1
Output:
9

Input Format:
- A single line with space-separated integers

Output Format:
- Print the maximum number`,
            sampleInput: '3 7 2 9 1',
            sampleOutput: '9',
            testCases: [
                { input: '3 7 2 9 1', expectedOutput: '9', isHidden: false, points: 15 },
                { input: '5 5 5', expectedOutput: '5', isHidden: false, points: 10 },
                { input: '-5 -2 -10', expectedOutput: '-2', isHidden: true, points: 15 },
                { input: '100', expectedOutput: '100', isHidden: true, points: 10 },
            ],
            points: 50,
            order: 1,
        },
    ],
    settings: {
        shuffleQuestions: false,
        shuffleOptions: false,
        showResults: true,
        preventTabSwitch: true,
    },
    status: 'published',
};

const seedCodingTest = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find recruiter and student
        const recruiter = await Recruiter.findOne();
        const student = await Student.findOne();

        if (!recruiter) {
            console.log('No recruiter found. Please create a recruiter first.');
            process.exit(1);
        }

        if (!student) {
            console.log('No student found. Please create a student first.');
            process.exit(1);
        }

        console.log(`Using recruiter: ${recruiter.companyName}`);
        console.log(`Using student: ${student.firstName} ${student.lastName}`);

        // Create the test
        const test = await Test.create({
            ...codingTest,
            recruiterId: recruiter._id,
        });
        console.log(`\n✅ Test created: ${test.title}`);
        console.log(`Test ID: ${test._id}`);

        // Create submission for student (scheduled)
        const scheduledAt = new Date();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

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

        console.log(`\n✅ Test assigned to student!`);
        console.log(`Submission ID: ${submission._id}`);

        console.log('\n=== Summary ===');
        console.log(`Test: ${codingTest.title}`);
        console.log(`Type: Coding Only`);
        console.log(`Duration: ${codingTest.duration} minutes`);
        console.log(`Questions: ${codingTest.inlineQuestions.length} coding problems`);
        console.log(`Total Marks: ${codingTest.totalMarks}`);
        console.log(`\nStudent: ${student.firstName} ${student.lastName}`);
        console.log(`Email: ${student.email || 'N/A'}`);

        console.log('\n🎯 Login as the student and go to "My Tests" to start the coding test!');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

seedCodingTest();
