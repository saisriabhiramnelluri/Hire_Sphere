import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate test questions using AI based on job description and difficulty
 * @param {string} jobDescription - The job description to base questions on
 * @param {string} difficultyLevel - 'easy', 'medium', or 'hard'
 * @param {number} questionCount - Number of questions to generate
 * @param {string} questionType - 'mcq' or 'coding'
 * @returns {Promise<Array>} Array of generated questions
 */
export const generateQuestions = async (jobDescription, difficultyLevel, questionCount, questionType) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  let prompt;

  if (questionType === 'mcq') {
    prompt = `You are an expert technical interviewer. Generate ${questionCount} multiple choice questions for a technical assessment.

Job Description:
${jobDescription}

Difficulty Level: ${difficultyLevel}

Requirements:
- Questions should be relevant to the skills mentioned in the job description
- Each question should have exactly 4 options
- Only one option should be correct
- For ${difficultyLevel} difficulty:
  ${difficultyLevel === 'easy' ? '- Focus on basic concepts and fundamentals' : ''}
  ${difficultyLevel === 'medium' ? '- Include practical application scenarios and moderate complexity' : ''}
  ${difficultyLevel === 'hard' ? '- Include advanced concepts, edge cases, and complex problem-solving' : ''}

IMPORTANT: Respond ONLY with a valid JSON array, no additional text. The format must be exactly:
[
  {
    "type": "mcq",
    "title": "Brief title of the question",
    "question": "The full question text",
    "options": [
      { "text": "Option A text", "isCorrect": true },
      { "text": "Option B text", "isCorrect": false },
      { "text": "Option C text", "isCorrect": false },
      { "text": "Option D text", "isCorrect": false }
    ],
    "points": ${difficultyLevel === 'easy' ? 1 : difficultyLevel === 'medium' ? 2 : 3}
  }
]`;
  } else {
    prompt = `You are an expert technical interviewer. Generate ${questionCount} coding challenge questions for a technical assessment.

Job Description:
${jobDescription}

Difficulty Level: ${difficultyLevel}

Requirements:
- Questions should be relevant to the skills mentioned in the job description
- Each question should have a clear problem statement
- Include sample input and output
- Include 3 test cases (1 visible, 2 hidden)
- For ${difficultyLevel} difficulty:
  ${difficultyLevel === 'easy' ? '- Focus on basic algorithms like loops, conditionals, and simple data structures' : ''}
  ${difficultyLevel === 'medium' ? '- Include moderate algorithms, recursion, and common data structures' : ''}
  ${difficultyLevel === 'hard' ? '- Include advanced algorithms, optimization, and complex data structures' : ''}

IMPORTANT: Respond ONLY with a valid JSON array, no additional text. The format must be exactly:
[
  {
    "type": "coding",
    "title": "Brief title of the problem",
    "problemStatement": "Detailed problem description explaining what needs to be solved",
    "sampleInput": "Example input",
    "sampleOutput": "Expected output for the example",
    "testCases": [
      { "input": "test input 1", "expectedOutput": "expected output 1", "isHidden": false, "points": ${difficultyLevel === 'easy' ? 5 : difficultyLevel === 'medium' ? 8 : 10} },
      { "input": "test input 2", "expectedOutput": "expected output 2", "isHidden": true, "points": ${difficultyLevel === 'easy' ? 5 : difficultyLevel === 'medium' ? 8 : 10} },
      { "input": "test input 3", "expectedOutput": "expected output 3", "isHidden": true, "points": ${difficultyLevel === 'easy' ? 5 : difficultyLevel === 'medium' ? 8 : 10} }
    ],
    "points": ${difficultyLevel === 'easy' ? 15 : difficultyLevel === 'medium' ? 24 : 30}
  }
]`;
  }

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up the response - remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse the JSON response
    const questions = JSON.parse(text);

    // Add order to each question
    return questions.map((q, index) => ({
      ...q,
      order: index,
    }));
  } catch (error) {
    console.error('AI Question Generation Error:', error);
    throw new Error('Failed to generate questions. Please try again.');
  }
};

/**
 * Analyze student test performance and provide improvement recommendations
 * @param {Object} testData - The test details including questions
 * @param {Object} submissionData - The student's submission with answers
 * @returns {Promise<Object>} Analysis with weak areas, focus topics, and recommendations
 */
export const analyzeTestPerformance = async (testData, submissionData) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  // Build analysis context from incorrect answers
  const incorrectQuestions = [];
  const allQuestions = testData.inlineQuestions || [];

  allQuestions.forEach((question, index) => {
    if (question.type === 'mcq') {
      const answer = submissionData.mcqAnswers?.find(a => a.questionIndex === index);
      if (answer && !answer.isCorrect) {
        incorrectQuestions.push({
          type: 'mcq',
          title: question.title || `Question ${index + 1}`,
          question: question.question,
          correctAnswer: question.options?.find(o => o.isCorrect)?.text,
          studentAnswer: question.options?.[answer.selectedOption]?.text,
        });
      }
    } else if (question.type === 'coding') {
      const submission = submissionData.codeSubmissions?.find(c => c.questionIndex === index);
      if (submission && submission.totalPassed < submission.totalTestCases) {
        incorrectQuestions.push({
          type: 'coding',
          title: question.title || `Problem ${index + 1}`,
          problemStatement: question.problemStatement,
          passedTests: submission.totalPassed,
          totalTests: submission.totalTestCases,
        });
      }
    }
  });

  const prompt = `You are an expert technical mentor helping a student improve their skills. Analyze their test performance and provide actionable feedback.

Test Title: ${testData.title}
Test Type: ${testData.type}
Student Score: ${submissionData.scores?.percentage}%
Passed: ${submissionData.scores?.passed ? 'Yes' : 'No'}

Incorrect/Partially Correct Questions:
${JSON.stringify(incorrectQuestions, null, 2)}

Based on the questions the student got wrong or partially correct, provide a comprehensive analysis.

IMPORTANT: Respond ONLY with a valid JSON object, no additional text. The format must be exactly:
{
  "overallAssessment": "A 2-3 sentence encouraging summary of the student's performance",
  "weakAreas": [
    {
      "topic": "Topic name (e.g., Arrays, SQL Joins, Recursion)",
      "severity": "high" | "medium" | "low",
      "description": "Brief explanation of what concepts need improvement"
    }
  ],
  "focusTopics": [
    {
      "topic": "Specific topic to study",
      "reason": "Why this topic needs attention",
      "estimatedTime": "Estimated study time (e.g., 2-3 hours)"
    }
  ],
  "practiceRecommendations": [
    {
      "title": "Practice activity title",
      "description": "Detailed description of what to practice",
      "resources": ["Resource or platform suggestion"]
    }
  ],
  "nextSteps": ["Step 1", "Step 2", "Step 3"]
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up the response
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const analysis = JSON.parse(text);
    return analysis;
  } catch (error) {
    console.error('AI Test Analysis Error:', error);
    throw new Error('Failed to analyze test performance. Please try again.');
  }
};

/**
 * Score a resume against job requirements
 * @param {Object} studentData - Student profile data including skills, education, resume
 * @param {Object} driveData - Drive/job data including description, required skills
 * @returns {Promise<Object>} Scoring results with match percentage and analysis
 */
export const scoreResume = async (studentData, driveData) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `You are an expert HR analyst and resume screener. Analyze how well this candidate matches the job requirements and provide a detailed scoring.

## Job Details
- **Title:** ${driveData.jobTitle}
- **Company:** ${driveData.companyName}
- **Description:** ${driveData.jobDescription}
- **Required Skills:** ${driveData.skillsRequired?.join(', ') || 'Not specified'}
- **Job Type:** ${driveData.jobType}
- **Location:** ${driveData.jobLocation}

## Eligibility Criteria
- Minimum CGPA: ${driveData.eligibilityCriteria?.minCGPA || 'Not specified'}
- Allowed Branches: ${driveData.eligibilityCriteria?.branches?.join(', ') || 'All'}
- Max Backlogs: ${driveData.eligibilityCriteria?.maxBacklogs || 0}

## Candidate Profile
- **Name:** ${studentData.firstName} ${studentData.lastName}
- **Branch:** ${studentData.branch}
- **CGPA:** ${studentData.cgpa}
- **Batch:** ${studentData.batch}
- **Skills:** ${studentData.skills?.join(', ') || 'Not listed'}
- **10th Marks:** ${studentData.tenthMarks}%
- **12th Marks:** ${studentData.twelfthMarks}%
- **Active Backlogs:** ${studentData.activeBacklogs || 0}
- **LinkedIn:** ${studentData.linkedIn || 'Not provided'}
- **GitHub:** ${studentData.github || 'Not provided'}
- **Portfolio:** ${studentData.portfolio || 'Not provided'}

Analyze the candidate's fit for this role and provide a comprehensive assessment.

IMPORTANT: Respond ONLY with a valid JSON object, no additional text. The format must be exactly:
{
  "overallScore": 75,
  "recommendation": "strong" | "moderate" | "weak",
  "summary": "2-3 sentence executive summary of the candidate's fit",
  "skillsMatch": {
    "score": 80,
    "matched": ["skill1", "skill2"],
    "missing": ["skill3"],
    "additional": ["skill4"]
  },
  "academicsMatch": {
    "score": 90,
    "meetsMinCGPA": true,
    "meetsBacklogCriteria": true,
    "notes": "Brief note about academic standing"
  },
  "strengths": [
    "Strength 1",
    "Strength 2"
  ],
  "gaps": [
    "Gap or area of concern 1"
  ],
  "interviewFocus": [
    "Topic to explore in interview 1",
    "Topic to explore in interview 2"
  ]
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up the response
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const scoring = JSON.parse(text);
    return scoring;
  } catch (error) {
    console.error('AI Resume Scoring Error:', error);
    throw new Error('Failed to score resume. Please try again.');
  }
};

/**
 * Analyze a resume for ATS compatibility and provide suggestions
 * @param {string} resumeText - Extracted text from the resume PDF
 * @returns {Promise<Object>} ATS analysis with score and suggestions
 */
export const analyzeResumeForATS = async (resumeText) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `You are an expert resume coach and ATS (Applicant Tracking System) specialist. Analyze the following resume content and provide detailed feedback on how to improve it for better ATS compatibility and recruiter appeal.

## RESUME CONTENT
---
${resumeText}
---

Analyze ONLY the resume content above. Provide:
1. ATS compatibility score and specific issues
2. Section-by-section feedback for all sections found in the resume
3. Missing keywords commonly expected for similar roles
4. Format and structure issues that may affect ATS parsing
5. Actionable improvements

IMPORTANT: Respond ONLY with a valid JSON object, no additional text. The format must be exactly:
{
  "atsScore": 75,
  "atsVerdict": "Good" | "Needs Improvement" | "Poor",
  "overallFeedback": "2-3 sentence summary of the resume's strengths and main areas to improve",
  "sectionAnalysis": [
    {
      "section": "Contact Information",
      "score": 80,
      "feedback": "Analysis of this section",
      "suggestions": ["Suggestion 1", "Suggestion 2"]
    },
    {
      "section": "Summary/Objective",
      "score": 70,
      "feedback": "Analysis of summary section",
      "suggestions": ["Add quantifiable achievements"]
    },
    {
      "section": "Skills",
      "score": 85,
      "feedback": "Analysis of skills",
      "suggestions": ["Add more relevant keywords"]
    },
    {
      "section": "Experience/Projects",
      "score": 60,
      "feedback": "Analysis of experience or projects",
      "suggestions": ["Use action verbs", "Add metrics"]
    },
    {
      "section": "Education",
      "score": 90,
      "feedback": "Analysis of education section",
      "suggestions": []
    },
    {
      "section": "Format & Structure",
      "score": 75,
      "feedback": "Analysis of overall format",
      "suggestions": ["Use consistent formatting"]
    }
  ],
  "missingKeywords": ["keyword1", "keyword2", "keyword3"],
  "suggestedSkillsToAdd": ["skill1", "skill2", "skill3"],
  "quickWins": [
    "Quick improvement 1",
    "Quick improvement 2",
    "Quick improvement 3"
  ],
  "advancedTips": [
    "Advanced tip 1",
    "Advanced tip 2"
  ],
  "formatIssues": [
    "Any ATS format issues found"
  ]
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up the response
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const analysis = JSON.parse(text);
    return analysis;
  } catch (error) {
    console.error('AI Resume Analysis Error:', error);
    throw new Error('Failed to analyze resume. Please try again.');
  }
};

export default {
  generateQuestions,
  analyzeTestPerformance,
  scoreResume,
  analyzeResumeForATS,
};

