import TestSubmission from '../models/TestSubmission.js';
import Test from '../models/Test.js';
import Student from '../models/Student.js';
import Recruiter from '../models/Recruiter.js';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';
import { executeCode, generatePerformanceReport } from '../services/codeExecutionService.js';

// Get student's scheduled/active tests
export const getStudentTests = async (req, res) => {
    try {
        const student = await Student.findOne({ userId: req.user._id });
        if (!student) {
            return sendErrorResponse(res, 'Student profile not found', 404);
        }

        const { status } = req.query;
        const filter = { studentId: student._id };

        if (status) {
            filter.status = status;
        }

        const submissions = await TestSubmission.find(filter)
            .populate('testId', 'title type duration totalMarks description')
            .sort({ scheduledAt: -1 });

        sendSuccessResponse(res, 'Tests fetched', { submissions });
    } catch (error) {
        console.error('getStudentTests error:', error);
        sendErrorResponse(res, error.message, 500);
    }
};

// Start a test
export const startTest = async (req, res) => {
    try {
        const { submissionId } = req.params;

        const student = await Student.findOne({ userId: req.user._id });
        if (!student) {
            return sendErrorResponse(res, 'Student profile not found', 404);
        }

        const submission = await TestSubmission.findById(submissionId)
            .populate('testId');

        if (!submission) {
            return sendErrorResponse(res, 'Test submission not found', 404);
        }

        if (submission.studentId.toString() !== student._id.toString()) {
            return sendErrorResponse(res, 'Unauthorized', 403);
        }

        if (submission.status === 'submitted' || submission.status === 'evaluated') {
            return sendErrorResponse(res, 'Test already submitted', 400);
        }

        if (submission.status === 'expired') {
            return sendErrorResponse(res, 'Test has expired', 400);
        }

        // Mark as started if not already
        if (submission.status === 'scheduled') {
            submission.status = 'in_progress';
            submission.startedAt = new Date();
            await submission.save();
        }

        // Prepare test data (hide correct answers)
        const test = submission.testId;

        if (!test || !test.inlineQuestions) {
            return sendErrorResponse(res, 'Test data not found', 404);
        }

        const sanitizedQuestions = test.inlineQuestions.map((q, index) => {
            if (q.type === 'mcq') {
                return {
                    index,
                    type: q.type,
                    title: q.title,
                    question: q.question,
                    options: q.options ? q.options.map(opt => ({ text: opt.text })) : [],
                    points: q.points || 1,
                };
            } else {
                return {
                    index,
                    type: q.type,
                    title: q.title,
                    problemStatement: q.problemStatement,
                    sampleInput: q.sampleInput,
                    sampleOutput: q.sampleOutput,
                    points: q.points || 1,
                };
            }
        });

        const testData = {
            _id: test._id,
            title: test.title,
            description: test.description,
            instructions: test.instructions,
            type: test.type,
            duration: test.duration,
            totalMarks: test.totalMarks,
            questions: sanitizedQuestions,
            settings: test.settings,
        };

        sendSuccessResponse(res, 'Test started', {
            submission: {
                _id: submission._id,
                startedAt: submission.startedAt,
                status: submission.status,
                mcqAnswers: submission.mcqAnswers,
                codeSubmissions: submission.codeSubmissions,
            },
            test: testData,
        });
    } catch (error) {
        console.error('startTest error:', error);
        sendErrorResponse(res, error.message, 500);
    }
};

// Submit MCQ answer
export const submitMcqAnswer = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { questionIndex, selectedOption } = req.body;

        const student = await Student.findOne({ userId: req.user._id });
        const submission = await TestSubmission.findById(submissionId)
            .populate('testId');

        if (!submission || submission.studentId.toString() !== student._id.toString()) {
            return sendErrorResponse(res, 'Unauthorized', 403);
        }

        if (submission.status !== 'in_progress') {
            return sendErrorResponse(res, 'Test not in progress', 400);
        }

        const question = submission.testId.inlineQuestions[questionIndex];
        if (!question || question.type !== 'mcq') {
            return sendErrorResponse(res, 'Invalid question', 400);
        }

        const isCorrect = question.options[selectedOption]?.isCorrect || false;
        const pointsEarned = isCorrect ? question.points : 0;

        // Update or add answer
        const existingAnswerIndex = submission.mcqAnswers.findIndex(
            a => a.questionIndex === questionIndex
        );

        if (existingAnswerIndex >= 0) {
            submission.mcqAnswers[existingAnswerIndex] = {
                questionIndex,
                selectedOption,
                isCorrect,
                pointsEarned,
                answeredAt: new Date(),
            };
        } else {
            submission.mcqAnswers.push({
                questionIndex,
                selectedOption,
                isCorrect,
                pointsEarned,
                answeredAt: new Date(),
            });
        }

        await submission.save();

        sendSuccessResponse(res, 'Answer saved', {
            questionIndex,
            selectedOption,
            saved: true,
        });
    } catch (error) {
        sendErrorResponse(res, error.message, 500);
    }
};

// Run code (without submitting - for testing)
export const runCode = async (req, res) => {
    try {
        const { code, language, input } = req.body;

        const result = await executeCode(code, language, input);

        sendSuccessResponse(res, 'Code executed', { result });
    } catch (error) {
        sendErrorResponse(res, error.message, 500);
    }
};

// Submit code for a coding question
export const submitCode = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { questionIndex, code, language } = req.body;

        const student = await Student.findOne({ userId: req.user._id });
        const submission = await TestSubmission.findById(submissionId)
            .populate('testId');

        if (!submission || submission.studentId.toString() !== student._id.toString()) {
            return sendErrorResponse(res, 'Unauthorized', 403);
        }

        if (submission.status !== 'in_progress') {
            return sendErrorResponse(res, 'Test not in progress', 400);
        }

        const question = submission.testId.inlineQuestions[questionIndex];
        if (!question || question.type !== 'coding') {
            return sendErrorResponse(res, 'Invalid question', 400);
        }

        // Run code against all test cases
        const testCaseResults = [];
        let totalPassed = 0;
        let totalPoints = 0;

        for (let i = 0; i < question.testCases.length; i++) {
            const testCase = question.testCases[i];
            try {
                const result = await executeCode(code, language, testCase.input);
                const actualOutput = (result.stdout || '').trim();
                const expectedOutput = (testCase.expectedOutput || '').trim();
                const passed = actualOutput === expectedOutput;

                if (passed) {
                    totalPassed++;
                    totalPoints += testCase.points || 1;
                }

                testCaseResults.push({
                    testCaseIndex: i,
                    passed,
                    actualOutput: testCase.isHidden ? undefined : actualOutput,
                    expectedOutput: testCase.isHidden ? undefined : expectedOutput,
                    executionTime: result.time,
                    error: result.stderr || result.compile_output,
                });
            } catch (err) {
                testCaseResults.push({
                    testCaseIndex: i,
                    passed: false,
                    error: err.message,
                });
            }
        }

        // Update or add submission
        const existingIndex = submission.codeSubmissions.findIndex(
            s => s.questionIndex === questionIndex
        );

        const codeSubmissionData = {
            questionIndex,
            language,
            code,
            testCaseResults,
            totalPassed,
            totalTestCases: question.testCases.length,
            pointsEarned: totalPoints,
            submittedAt: new Date(),
        };

        if (existingIndex >= 0) {
            submission.codeSubmissions[existingIndex] = codeSubmissionData;
        } else {
            submission.codeSubmissions.push(codeSubmissionData);
        }

        await submission.save();

        sendSuccessResponse(res, 'Code submitted', {
            questionIndex,
            totalPassed,
            totalTestCases: question.testCases.length,
            testCaseResults: testCaseResults.map(r => ({
                ...r,
                // Hide actual/expected for hidden test cases
            })),
        });
    } catch (error) {
        sendErrorResponse(res, error.message, 500);
    }
};

// Finalize test submission
export const finalizeTest = async (req, res) => {
    try {
        const { submissionId } = req.params;

        const student = await Student.findOne({ userId: req.user._id });
        const submission = await TestSubmission.findById(submissionId)
            .populate('testId');

        if (!submission || submission.studentId.toString() !== student._id.toString()) {
            return sendErrorResponse(res, 'Unauthorized', 403);
        }

        if (submission.status !== 'in_progress') {
            return sendErrorResponse(res, 'Test not in progress', 400);
        }

        const test = submission.testId;

        // Calculate scores
        let mcqScore = 0;
        let mcqTotal = 0;
        let codingScore = 0;
        let codingTotal = 0;

        test.inlineQuestions.forEach((q, index) => {
            if (q.type === 'mcq') {
                mcqTotal += q.points;
                const answer = submission.mcqAnswers.find(a => a.questionIndex === index);
                if (answer) {
                    mcqScore += answer.pointsEarned;
                }
            } else if (q.type === 'coding') {
                codingTotal += q.points;
                const codeSubmission = submission.codeSubmissions.find(s => s.questionIndex === index);
                if (codeSubmission) {
                    codingScore += codeSubmission.pointsEarned;
                }
            }
        });

        const totalScore = mcqScore + codingScore;
        const maxScore = mcqTotal + codingTotal;
        const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
        const passed = percentage >= (test.passingPercentage || 50);

        // Calculate time spent
        const timeSpent = Math.floor((new Date() - new Date(submission.startedAt)) / 1000);

        submission.status = 'submitted';
        submission.submittedAt = new Date();
        submission.timeSpent = timeSpent;
        submission.scores = {
            mcqScore,
            mcqTotal,
            codingScore,
            codingTotal,
            totalScore,
            maxScore,
            percentage,
            passed,
        };

        await submission.save();

        // Update test statistics
        test.statistics.totalAttempts += 1;
        const allSubmissions = await TestSubmission.find({ testId: test._id, status: 'submitted' });
        const scores = allSubmissions.map(s => s.scores.percentage);
        test.statistics.averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        test.statistics.highestScore = Math.max(...scores);
        test.statistics.lowestScore = Math.min(...scores);
        await test.save();

        sendSuccessResponse(res, 'Test submitted successfully', {
            submission: {
                _id: submission._id,
                status: submission.status,
                scores: submission.scores,
                timeSpent: submission.timeSpent,
            },
        });
    } catch (error) {
        sendErrorResponse(res, error.message, 500);
    }
};

// Get submission report
export const getSubmissionReport = async (req, res) => {
    try {
        const { submissionId } = req.params;

        const submission = await TestSubmission.findById(submissionId)
            .populate('testId')
            .populate('studentId', 'firstName lastName email studentId');

        if (!submission) {
            return sendErrorResponse(res, 'Submission not found', 404);
        }

        sendSuccessResponse(res, 'Report fetched', { submission });
    } catch (error) {
        sendErrorResponse(res, error.message, 500);
    }
};

// Record proctoring event
export const recordProctoringEvent = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { eventType } = req.body;

        const submission = await TestSubmission.findById(submissionId);

        if (!submission || submission.status !== 'in_progress') {
            return sendErrorResponse(res, 'Invalid submission', 400);
        }

        if (eventType === 'tab_switch') {
            submission.proctoring.tabSwitchCount += 1;
            if (submission.proctoring.tabSwitchCount >= 3) {
                submission.proctoring.flagged = true;
                submission.proctoring.flagReason = 'Excessive tab switching';
            }
        }

        await submission.save();

        sendSuccessResponse(res, 'Event recorded', {
            tabSwitchCount: submission.proctoring.tabSwitchCount,
            flagged: submission.proctoring.flagged,
        });
    } catch (error) {
        sendErrorResponse(res, error.message, 500);
    }
};

// Get detailed coding performance report for recruiter
export const getDetailedPerformanceReport = async (req, res) => {
    try {
        const { submissionId } = req.params;

        // Verify recruiter access
        const recruiter = await Recruiter.findOne({ userId: req.user._id });
        if (!recruiter) {
            return sendErrorResponse(res, 'Recruiter access required', 403);
        }

        const submission = await TestSubmission.findById(submissionId)
            .populate('testId')
            .populate('studentId', 'firstName lastName email studentId branch batch cgpa');

        if (!submission) {
            return sendErrorResponse(res, 'Submission not found', 404);
        }

        const test = submission.testId;

        // Build detailed coding reports
        const codingReports = [];

        for (const codeSubmission of submission.codeSubmissions) {
            const question = test.inlineQuestions[codeSubmission.questionIndex];
            if (question && question.type === 'coding') {
                const report = generatePerformanceReport(
                    {
                        results: codeSubmission.testCaseResults.map((tc, i) => ({
                            input: question.testCases[i]?.input || '',
                            expectedOutput: question.testCases[i]?.expectedOutput || '',
                            actualOutput: tc.actualOutput || '',
                            passed: tc.passed,
                            executionTime: tc.executionTime || 0,
                            memory: 0,
                            points: tc.passed ? (question.testCases[i]?.points || 10) : 0,
                            maxPoints: question.testCases[i]?.points || 10,
                            isHidden: question.testCases[i]?.isHidden || false,
                            error: tc.error,
                        })),
                        summary: {
                            totalTestCases: codeSubmission.totalTestCases,
                            passedTestCases: codeSubmission.totalPassed,
                            failedTestCases: codeSubmission.totalTestCases - codeSubmission.totalPassed,
                            scoreEarned: codeSubmission.pointsEarned,
                            maxScore: question.points,
                            percentage: question.points > 0
                                ? ((codeSubmission.pointsEarned / question.points) * 100).toFixed(1)
                                : 0,
                            averageTime: 0,
                            maxMemory: 0,
                            language: codeSubmission.language,
                        },
                    },
                    question.title,
                    codeSubmission.code
                );
                codingReports.push(report);
            }
        }

        // Generate overall recommendation
        const totalCodingScore = submission.scores?.codingScore || 0;
        const totalCodingMax = submission.scores?.codingTotal || 0;
        const codingPercentage = totalCodingMax > 0
            ? ((totalCodingScore / totalCodingMax) * 100).toFixed(1)
            : 0;

        let overallRecommendation;
        if (codingPercentage >= 90) {
            overallRecommendation = { level: 'Excellent', color: 'green', message: 'Strongly recommended for interview.' };
        } else if (codingPercentage >= 70) {
            overallRecommendation = { level: 'Good', color: 'blue', message: 'Recommended for further evaluation.' };
        } else if (codingPercentage >= 50) {
            overallRecommendation = { level: 'Average', color: 'yellow', message: 'Consider additional assessment.' };
        } else {
            overallRecommendation = { level: 'Below Average', color: 'red', message: 'Not recommended.' };
        }

        const report = {
            student: {
                name: `${submission.studentId.firstName} ${submission.studentId.lastName}`,
                email: submission.studentId.email,
                studentId: submission.studentId.studentId,
                branch: submission.studentId.branch,
                batch: submission.studentId.batch,
                cgpa: submission.studentId.cgpa,
            },
            test: {
                title: test.title,
                type: test.type,
                duration: test.duration,
                passingPercentage: test.passingPercentage,
            },
            submission: {
                startedAt: submission.startedAt,
                submittedAt: submission.submittedAt,
                timeSpent: submission.timeSpent,
                status: submission.status,
            },
            scores: submission.scores,
            proctoring: {
                tabSwitchCount: submission.proctoring?.tabSwitchCount || 0,
                flagged: submission.proctoring?.flagged || false,
                flagReason: submission.proctoring?.flagReason,
            },
            codingPerformance: {
                totalScore: totalCodingScore,
                maxScore: totalCodingMax,
                percentage: codingPercentage,
                questionsAttempted: codingReports.length,
                reports: codingReports,
            },
            mcqPerformance: {
                totalScore: submission.scores?.mcqScore || 0,
                maxScore: submission.scores?.mcqTotal || 0,
                percentage: (submission.scores?.mcqTotal || 0) > 0
                    ? (((submission.scores?.mcqScore || 0) / submission.scores.mcqTotal) * 100).toFixed(1)
                    : 0,
            },
            recommendation: overallRecommendation,
        };

        sendSuccessResponse(res, 'Performance report generated', { report });
    } catch (error) {
        console.error('Error generating performance report:', error);
        sendErrorResponse(res, error.message, 500);
    }
};
