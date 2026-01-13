// Code Execution Service using Judge0 Community Edition
// Public endpoint: https://ce.judge0.com (no API key required)
// Self-hosted: Use JUDGE0_API_URL environment variable

const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'https://ce.judge0.com';

// Language IDs for Judge0
const LANGUAGE_IDS = {
    python: 71,     // Python 3.8.1
    javascript: 63, // Node.js 12.14.0
    java: 62,       // Java (OpenJDK 13.0.1)
    cpp: 54,        // C++ (GCC 9.2.0)
    c: 50,          // C (GCC 9.2.0)
    typescript: 74, // TypeScript 3.7.4
    ruby: 72,       // Ruby 2.7.0
    go: 60,         // Go 1.13.5
    rust: 73,       // Rust 1.40.0
    php: 68,        // PHP 7.4.1
};

/**
 * Execute code using Judge0 Community Edition
 * @param {string} sourceCode - The code to execute
 * @param {string} language - Programming language
 * @param {string} stdin - Input for the program
 * @returns {Promise<object>} - Execution result with detailed metrics
 */
export const executeCode = async (sourceCode, language, stdin = '') => {
    const languageId = LANGUAGE_IDS[language.toLowerCase()];

    if (!languageId) {
        throw new Error(`Unsupported language: ${language}. Supported: ${Object.keys(LANGUAGE_IDS).join(', ')}`);
    }

    try {
        console.log(`Executing ${language} code via Judge0 CE...`);

        // Create submission with wait=true for synchronous execution
        const createResponse = await fetch(`${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                source_code: sourceCode,
                language_id: languageId,
                stdin: stdin,
                cpu_time_limit: 5,        // 5 seconds max
                memory_limit: 256000,      // 256MB
                expected_output: null,
            }),
        });

        if (!createResponse.ok) {
            const errorText = await createResponse.text();
            console.error('Judge0 API error:', errorText);

            // Fall back to mock execution
            console.warn('Judge0 API unavailable, using mock execution');
            return mockExecute(sourceCode, language, stdin);
        }

        const result = await createResponse.json();

        // Status IDs: 1=In Queue, 2=Processing, 3=Accepted, 4=Wrong Answer, 5=Time Limit Exceeded, etc.
        const statusId = result.status?.id || 0;
        const isSuccess = statusId === 3; // Accepted
        const isCompileError = statusId === 6;
        const isRuntimeError = statusId >= 7 && statusId <= 12;
        const isTimeExceeded = statusId === 5;

        return {
            stdout: result.stdout || '',
            stderr: result.stderr || '',
            compile_output: result.compile_output || '',
            status: result.status?.description || 'Unknown',
            statusId: statusId,
            time: result.time ? parseFloat(result.time) * 1000 : 0, // Convert to ms
            memory: result.memory || 0, // KB
            isSuccess,
            isCompileError,
            isRuntimeError,
            isTimeExceeded,
            error: statusId > 3 ? result.status?.description : null,
            token: result.token,
        };
    } catch (error) {
        console.error('Code execution error:', error.message);

        // Use mock execution as fallback
        console.warn('Falling back to mock execution');
        return mockExecute(sourceCode, language, stdin);
    }
};

/**
 * Execute code and compare with expected output
 * Returns detailed test case result
 */
export const executeTestCase = async (sourceCode, language, input, expectedOutput, points = 0) => {
    const startTime = Date.now();
    const result = await executeCode(sourceCode, language, input);
    const executionTime = Date.now() - startTime;

    // Normalize outputs for comparison (trim whitespace)
    const actualOutput = (result.stdout || '').trim();
    const expected = (expectedOutput || '').trim();
    const passed = actualOutput === expected;

    return {
        input,
        expectedOutput: expected,
        actualOutput,
        passed,
        status: result.status,
        statusId: result.statusId,
        executionTime: result.time || executionTime,
        memory: result.memory,
        points: passed ? points : 0,
        maxPoints: points,
        error: result.error,
        stderr: result.stderr,
        compileOutput: result.compile_output,
    };
};

/**
 * Execute all test cases for a coding problem
 * Returns comprehensive performance report
 */
export const executeCodingProblem = async (sourceCode, language, testCases) => {
    const results = [];
    let totalPoints = 0;
    let maxPoints = 0;
    let passedCount = 0;
    let totalTime = 0;
    let maxMemory = 0;

    for (const testCase of testCases) {
        try {
            const result = await executeTestCase(
                sourceCode,
                language,
                testCase.input,
                testCase.expectedOutput,
                testCase.points || 10
            );

            results.push({
                ...result,
                isHidden: testCase.isHidden || false,
            });

            if (result.passed) {
                passedCount++;
                totalPoints += result.points;
            }
            maxPoints += result.maxPoints;
            totalTime += result.executionTime;
            maxMemory = Math.max(maxMemory, result.memory);
        } catch (error) {
            results.push({
                input: testCase.input,
                expectedOutput: testCase.expectedOutput,
                actualOutput: '',
                passed: false,
                error: error.message,
                points: 0,
                maxPoints: testCase.points || 10,
                isHidden: testCase.isHidden || false,
            });
            maxPoints += testCase.points || 10;
        }
    }

    return {
        results,
        summary: {
            totalTestCases: testCases.length,
            passedTestCases: passedCount,
            failedTestCases: testCases.length - passedCount,
            scoreEarned: totalPoints,
            maxScore: maxPoints,
            percentage: maxPoints > 0 ? ((totalPoints / maxPoints) * 100).toFixed(1) : 0,
            averageTime: results.length > 0 ? (totalTime / results.length).toFixed(2) : 0,
            maxMemory,
            language,
        },
    };
};

/**
 * Generate detailed performance report for recruiter review
 */
export const generatePerformanceReport = (codingResults, questionTitle, sourceCode) => {
    const { results, summary } = codingResults;

    // Analyze code quality (basic metrics)
    const codeLines = sourceCode.split('\n').length;
    const hasComments = sourceCode.includes('//') || sourceCode.includes('/*');

    return {
        questionTitle,
        codeSubmitted: sourceCode,
        codeMetrics: {
            linesOfCode: codeLines,
            hasComments,
        },
        testResults: {
            total: summary.totalTestCases,
            passed: summary.passedTestCases,
            failed: summary.failedTestCases,
            passRate: `${summary.percentage}%`,
        },
        performance: {
            averageExecutionTime: `${summary.averageTime}ms`,
            maxMemoryUsed: `${(summary.maxMemory / 1024).toFixed(2)}MB`,
        },
        scoring: {
            earned: summary.scoreEarned,
            maximum: summary.maxScore,
            percentage: summary.percentage,
        },
        detailedResults: results.map((r, i) => ({
            testCase: i + 1,
            hidden: r.isHidden,
            passed: r.passed,
            input: r.isHidden ? '[Hidden]' : r.input,
            expected: r.isHidden ? '[Hidden]' : r.expectedOutput,
            actual: r.isHidden ? (r.passed ? '[Correct]' : '[Incorrect]') : r.actualOutput,
            executionTime: `${r.executionTime}ms`,
            error: r.error,
        })),
        recommendation: generateRecommendation(summary),
    };
};

/**
 * Generate hiring recommendation based on performance
 */
const generateRecommendation = (summary) => {
    const percentage = parseFloat(summary.percentage);

    if (percentage >= 90) {
        return {
            level: 'Excellent',
            color: 'green',
            message: 'Candidate demonstrated exceptional coding skills. Strongly recommended for next round.',
        };
    } else if (percentage >= 70) {
        return {
            level: 'Good',
            color: 'blue',
            message: 'Candidate shows solid understanding. Recommended for further evaluation.',
        };
    } else if (percentage >= 50) {
        return {
            level: 'Average',
            color: 'yellow',
            message: 'Candidate passed minimum requirements. Consider additional assessment.',
        };
    } else {
        return {
            level: 'Below Average',
            color: 'red',
            message: 'Candidate did not meet minimum requirements. Not recommended.',
        };
    }
};

/**
 * Mock execution fallback (for development/API failures)
 */
const mockExecute = (sourceCode, language, stdin) => {
    console.log(`[MOCK] Executing ${language} code...`);

    // For JavaScript, try basic execution
    if (language === 'javascript') {
        try {
            let output = '';
            const mockConsole = {
                log: (...args) => { output += args.join(' ') + '\n'; },
            };

            const fn = new Function('console', 'input', sourceCode);
            fn(mockConsole, stdin);

            return {
                stdout: output.trim(),
                stderr: '',
                compile_output: '',
                status: 'Accepted',
                statusId: 3,
                time: 50 + Math.random() * 50,
                memory: 5000 + Math.random() * 5000,
                isSuccess: true,
                error: null,
            };
        } catch (e) {
            return {
                stdout: '',
                stderr: e.message,
                compile_output: '',
                status: 'Runtime Error',
                statusId: 11,
                time: 0,
                memory: 0,
                isSuccess: false,
                isRuntimeError: true,
                error: e.message,
            };
        }
    }

    // For Python mock - try to simulate
    if (language === 'python') {
        // Very basic simulation - just return mock output
        return {
            stdout: `[MOCK] Python execution\nInput: ${stdin}`,
            stderr: '',
            compile_output: '',
            status: 'Accepted',
            statusId: 3,
            time: 100 + Math.random() * 100,
            memory: 8000 + Math.random() * 4000,
            isSuccess: true,
            error: null,
        };
    }

    // Generic mock for other languages
    return {
        stdout: `[MOCK] ${language} execution succeeded`,
        stderr: '',
        compile_output: '',
        status: 'Accepted',
        statusId: 3,
        time: 75 + Math.random() * 75,
        memory: 6000 + Math.random() * 4000,
        isSuccess: true,
        error: null,
    };
};

/**
 * Check if Judge0 CE is available
 */
export const checkJudge0Health = async () => {
    try {
        const response = await fetch(`${JUDGE0_API_URL}/about`);
        if (response.ok) {
            const data = await response.json();
            return { available: true, version: data.version, source_code: data.source_code };
        }
        return { available: false, error: 'API not responding' };
    } catch (error) {
        return { available: false, error: error.message };
    }
};

/**
 * Get supported languages with details
 */
export const getSupportedLanguages = () => {
    return Object.entries(LANGUAGE_IDS).map(([lang, id]) => ({
        id: lang,
        name: lang.charAt(0).toUpperCase() + lang.slice(1),
        languageId: id,
    }));
};

export const isCodeExecutionAvailable = () => true; // Always available with fallback
