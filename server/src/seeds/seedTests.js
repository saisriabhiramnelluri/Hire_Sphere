// Seed script for sample test data
// Run with: node src/seeds/seedTests.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Test from '../models/Test.js';
import Recruiter from '../models/Recruiter.js';

dotenv.config();

const sampleMixedTest = {
    title: 'Software Developer Assessment - Round 1',
    description: 'This assessment evaluates your aptitude and coding skills. Complete all questions within the time limit.',
    instructions: `
1. This is a mixed assessment with MCQs and Coding problems.
2. You have 60 minutes to complete all questions.
3. MCQs have single correct answers.
4. For coding problems, your code will be evaluated against test cases.
5. Tab switching will be monitored.
6. Submit before the timer ends.
  `.trim(),
    type: 'mixed',
    duration: 60,
    totalMarks: 100,
    passingPercentage: 50,
    inlineQuestions: [
        // MCQ Questions (Aptitude)
        {
            type: 'mcq',
            title: 'Time and Work',
            question: 'A can complete a work in 12 days and B can complete the same work in 18 days. If they work together, in how many days will they complete the work?',
            options: [
                { text: '6 days', isCorrect: false },
                { text: '7.2 days', isCorrect: true },
                { text: '8 days', isCorrect: false },
                { text: '9 days', isCorrect: false },
            ],
            points: 5,
            order: 0,
        },
        {
            type: 'mcq',
            title: 'Percentage',
            question: 'If the price of an item is increased by 20% and then decreased by 20%, what is the net change in price?',
            options: [
                { text: 'No change', isCorrect: false },
                { text: '4% increase', isCorrect: false },
                { text: '4% decrease', isCorrect: true },
                { text: '2% decrease', isCorrect: false },
            ],
            points: 5,
            order: 1,
        },
        {
            type: 'mcq',
            title: 'Logical Reasoning',
            question: 'If all roses are flowers and some flowers fade quickly, which statement must be true?',
            options: [
                { text: 'All roses fade quickly', isCorrect: false },
                { text: 'Some roses fade quickly', isCorrect: false },
                { text: 'No roses fade quickly', isCorrect: false },
                { text: 'None of the above can be concluded', isCorrect: true },
            ],
            points: 5,
            order: 2,
        },
        {
            type: 'mcq',
            title: 'Number Series',
            question: 'What is the next number in the series: 2, 6, 12, 20, 30, ?',
            options: [
                { text: '40', isCorrect: false },
                { text: '42', isCorrect: true },
                { text: '44', isCorrect: false },
                { text: '38', isCorrect: false },
            ],
            points: 5,
            order: 3,
        },
        {
            type: 'mcq',
            title: 'Data Structures',
            question: 'What is the time complexity of searching an element in a balanced Binary Search Tree?',
            options: [
                { text: 'O(n)', isCorrect: false },
                { text: 'O(log n)', isCorrect: true },
                { text: 'O(n²)', isCorrect: false },
                { text: 'O(1)', isCorrect: false },
            ],
            points: 5,
            order: 4,
        },
        {
            type: 'mcq',
            title: 'SQL Query',
            question: 'Which SQL clause is used to filter grouped results?',
            options: [
                { text: 'WHERE', isCorrect: false },
                { text: 'GROUP BY', isCorrect: false },
                { text: 'HAVING', isCorrect: true },
                { text: 'ORDER BY', isCorrect: false },
            ],
            points: 5,
            order: 5,
        },
        {
            type: 'mcq',
            title: 'OOP Concepts',
            question: 'Which OOP principle allows a child class to provide a specific implementation of a method already provided by its parent class?',
            options: [
                { text: 'Encapsulation', isCorrect: false },
                { text: 'Abstraction', isCorrect: false },
                { text: 'Polymorphism (Method Overriding)', isCorrect: true },
                { text: 'Inheritance', isCorrect: false },
            ],
            points: 5,
            order: 6,
        },
        {
            type: 'mcq',
            title: 'Networking',
            question: 'Which protocol is used for secure web communication?',
            options: [
                { text: 'HTTP', isCorrect: false },
                { text: 'FTP', isCorrect: false },
                { text: 'HTTPS', isCorrect: true },
                { text: 'SMTP', isCorrect: false },
            ],
            points: 5,
            order: 7,
        },
        // Coding Questions
        {
            type: 'coding',
            title: 'Two Sum',
            problemStatement: `Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

Example 1:
Input: nums = [2, 7, 11, 15], target = 9
Output: 0 1
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

Example 2:
Input: nums = [3, 2, 4], target = 6
Output: 1 2

Constraints:
- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- Only one valid answer exists.

Input Format:
- First line contains the array elements space-separated
- Second line contains the target

Output Format:
- Print two indices space-separated`,
            sampleInput: '2 7 11 15\n9',
            sampleOutput: '0 1',
            testCases: [
                { input: '2 7 11 15\n9', expectedOutput: '0 1', isHidden: false, points: 10 },
                { input: '3 2 4\n6', expectedOutput: '1 2', isHidden: false, points: 10 },
                { input: '3 3\n6', expectedOutput: '0 1', isHidden: true, points: 10 },
            ],
            points: 30,
            order: 8,
        },
        {
            type: 'coding',
            title: 'Palindrome Check',
            problemStatement: `Write a program to check if a given string is a palindrome. Ignore case and non-alphanumeric characters.

A palindrome is a string that reads the same forwards and backwards.

Example 1:
Input: "A man, a plan, a canal: Panama"
Output: true

Example 2:
Input: "race a car"
Output: false

Example 3:
Input: "hello"
Output: false

Input Format:
- A single line containing the string

Output Format:
- Print "true" if palindrome, "false" otherwise`,
            sampleInput: 'A man, a plan, a canal: Panama',
            sampleOutput: 'true',
            testCases: [
                { input: 'A man, a plan, a canal: Panama', expectedOutput: 'true', isHidden: false, points: 10 },
                { input: 'race a car', expectedOutput: 'false', isHidden: false, points: 5 },
                { input: 'hello', expectedOutput: 'false', isHidden: true, points: 5 },
                { input: 'Was it a car or a cat I saw', expectedOutput: 'true', isHidden: true, points: 10 },
            ],
            points: 30,
            order: 9,
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

const seedTests = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find first recruiter or create one
        let recruiter = await Recruiter.findOne();

        if (!recruiter) {
            console.log('No recruiter found. Please create a recruiter first.');
            process.exit(1);
        }

        console.log(`Using recruiter: ${recruiter.companyName}`);

        // Check if test already exists
        const existingTest = await Test.findOne({ title: sampleMixedTest.title });
        if (existingTest) {
            console.log('Sample test already exists. Updating...');
            await Test.findByIdAndUpdate(existingTest._id, {
                ...sampleMixedTest,
                recruiterId: recruiter._id,
            });
            console.log('Test updated successfully!');
        } else {
            // Create the test
            const test = await Test.create({
                ...sampleMixedTest,
                recruiterId: recruiter._id,
            });
            console.log('Test created successfully!');
            console.log(`Test ID: ${test._id}`);
        }

        console.log('\n=== Test Summary ===');
        console.log(`Title: ${sampleMixedTest.title}`);
        console.log(`Type: ${sampleMixedTest.type}`);
        console.log(`Duration: ${sampleMixedTest.duration} minutes`);
        console.log(`Total Questions: ${sampleMixedTest.inlineQuestions.length}`);
        console.log(`MCQ Questions: ${sampleMixedTest.inlineQuestions.filter(q => q.type === 'mcq').length}`);
        console.log(`Coding Questions: ${sampleMixedTest.inlineQuestions.filter(q => q.type === 'coding').length}`);
        console.log(`Total Marks: 100 (40 MCQ + 60 Coding)`);
        console.log(`Status: ${sampleMixedTest.status}`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding tests:', error);
        process.exit(1);
    }
};

seedTests();
