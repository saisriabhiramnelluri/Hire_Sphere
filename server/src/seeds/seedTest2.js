// Seed script for a second sample test
// Run with: node src/seeds/seedTest2.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Test from '../models/Test.js';
import Recruiter from '../models/Recruiter.js';

dotenv.config();

const sampleTest2 = {
    title: 'Frontend Developer Skills Test',
    description: 'Evaluate your frontend development knowledge including HTML, CSS, JavaScript, and React.',
    instructions: `
1. This test contains multiple choice questions.
2. You have 30 minutes to complete all questions.
3. Each question carries equal marks.
4. Tab switching is monitored.
  `.trim(),
    type: 'aptitude',
    duration: 30,
    totalMarks: 50,
    passingPercentage: 60,
    inlineQuestions: [
        {
            type: 'mcq',
            title: 'HTML Basics',
            question: 'Which HTML tag is used to define an internal style sheet?',
            options: [
                { text: '<css>', isCorrect: false },
                { text: '<style>', isCorrect: true },
                { text: '<script>', isCorrect: false },
                { text: '<link>', isCorrect: false },
            ],
            points: 10,
            order: 0,
        },
        {
            type: 'mcq',
            title: 'CSS Flexbox',
            question: 'Which CSS property is used to center items horizontally in a flex container?',
            options: [
                { text: 'align-items', isCorrect: false },
                { text: 'justify-content', isCorrect: true },
                { text: 'flex-direction', isCorrect: false },
                { text: 'flex-wrap', isCorrect: false },
            ],
            points: 10,
            order: 1,
        },
        {
            type: 'mcq',
            title: 'JavaScript',
            question: 'What is the output of: console.log(typeof [])?',
            options: [
                { text: 'array', isCorrect: false },
                { text: 'object', isCorrect: true },
                { text: 'undefined', isCorrect: false },
                { text: 'null', isCorrect: false },
            ],
            points: 10,
            order: 2,
        },
        {
            type: 'mcq',
            title: 'React Hooks',
            question: 'Which React hook is used for side effects like API calls?',
            options: [
                { text: 'useState', isCorrect: false },
                { text: 'useContext', isCorrect: false },
                { text: 'useEffect', isCorrect: true },
                { text: 'useReducer', isCorrect: false },
            ],
            points: 10,
            order: 3,
        },
        {
            type: 'mcq',
            title: 'React State',
            question: 'What does useState() return?',
            options: [
                { text: 'Just the state value', isCorrect: false },
                { text: 'An array with state and setter function', isCorrect: true },
                { text: 'An object with state', isCorrect: false },
                { text: 'A callback function', isCorrect: false },
            ],
            points: 10,
            order: 4,
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

const seedTest2 = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        let recruiter = await Recruiter.findOne();

        if (!recruiter) {
            console.log('No recruiter found. Please create a recruiter first.');
            process.exit(1);
        }

        console.log(`Using recruiter: ${recruiter.companyName}`);

        // Create a new test (always create fresh)
        const test = await Test.create({
            ...sampleTest2,
            recruiterId: recruiter._id,
        });

        console.log('\n✅ New Test Created Successfully!');
        console.log(`Test ID: ${test._id}`);
        console.log(`Title: ${sampleTest2.title}`);
        console.log(`Type: ${sampleTest2.type}`);
        console.log(`Duration: ${sampleTest2.duration} minutes`);
        console.log(`Questions: ${sampleTest2.inlineQuestions.length}`);
        console.log(`Total Marks: ${sampleTest2.totalMarks}`);
        console.log(`Status: ${sampleTest2.status}`);
        console.log('\n🎯 Now go to My Tests and click "Assign" on this test!');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding test:', error);
        process.exit(1);
    }
};

seedTest2();
