
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

  async addNewQuestion(token: string, question: Question): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/addNewQuestion`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(question),
    });

    return response.ok;
  }

  async updateQuestion(token: string, question: Question): Promise<Question | null> {
    const response = await fetch(`${this.baseUrl}/updateQuestion`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(question),
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
