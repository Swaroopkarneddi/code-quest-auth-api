
interface Question {
  id?: string;
  questionId?: number;
  questionName: string;
  questionDescription: string;
  constraints: string[];
  sampleTestCases: TestCase[];
  actualTestCases: TestCase[];
  topics: string[];
  questionDifficulty: 'EASY' | 'MEDIUM' | 'HARD';
  questionSource: 'LeetCode' | 'CodeForces';
  questionSolutions: Solution[];
}

interface TestCase {
  input: string;
  output: string;
  explanation?: string;
}

interface Solution {
  name: string;
  explanation: string;
  example: string;
  code: string;
}

interface QuestionSummary {
  questionId: number;
  questionName: string;
  questionDifficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topics: string[];
}

export class ApiService {
  private baseUrl = 'https://capstone-1-y2mc.onrender.com/api';

  private getAuthHeaders(token: string) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async getAllQuestionNames(token: string): Promise<QuestionSummary[]> {
    const response = await fetch(`${this.baseUrl}/allQuestionNames`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to fetch questions');
  }

  async getQuestionById(token: string, questionId: number): Promise<Question> {
    const response = await fetch(`${this.baseUrl}/getQuestionById/${questionId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    if (response.ok) {
      const data = await response.json();
      
      // Transform the data to match our internal format
      return {
        id: data.id,
        questionId: data.questionId,
        questionName: data.questionName,
        questionDescription: data["question### Description "] || "",
        constraints: data.constraints || [],
        sampleTestCases: data.sampleTestCases || [],
        actualTestCases: data.actualTestCases || [],
        topics: data.topics || [],
        questionDifficulty: data.questionDifficulty,
        questionSource: data.questionSource,
        questionSolutions: data.questionSolutions || []
      };
    }
    throw new Error(`Failed to fetch question with ID ${questionId}`);
  }

  async addNewQuestion(token: string, question: Question): Promise<boolean> {
    // Ensure question format matches the expected API format
    const formattedQuestion = {
      ...question,
      "question### Description ": question.questionDescription, // Adjust the field name to match API format
    };
    
    // Remove the questionDescription field as it's not in the API format
    delete formattedQuestion.questionDescription;
    
    const response = await fetch(`${this.baseUrl}/addNewQuestion`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(formattedQuestion),
    });

    return response.ok;
  }

  async updateQuestion(token: string, question: Question): Promise<Question | null> {
    // Ensure question format matches the expected API format
    const formattedQuestion = {
      ...question,
      "question### Description ": question.questionDescription, // Adjust the field name to match API format
    };
    
    // Remove the questionDescription field as it's not in the API format
    delete formattedQuestion.questionDescription;
    
    const response = await fetch(`${this.baseUrl}/updateQuestion`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(formattedQuestion),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.error) {
        throw new Error(data.message || data.error);
      }
      return data;
    }
    throw new Error('Failed to update question');
  }
}

export const apiService = new ApiService();
export type { Question, TestCase, Solution, QuestionSummary };
