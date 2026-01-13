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

export default {
  generateQuestions,
};
