
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiService, Question, QuestionSummary } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UpdateQuestionFormProps {
  question: QuestionSummary;
  onBack: () => void;
  onSuccess: () => void;
}

const UpdateQuestionForm: React.FC<UpdateQuestionFormProps> = ({ question, onBack, onSuccess }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    questionId: question.questionId,
    questionName: question.questionName,
    questionDifficulty: question.questionDifficulty,
    topics: question.topics.join(', '),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.jwt) return;

    setIsLoading(true);
    try {
      // For demonstration, we'll create a minimal update request
      // In a real app, you'd want to fetch the full question data first
      const updateData: Partial<Question> = {
        id: formData.id || undefined,
        questionId: formData.questionId,
        questionName: formData.questionName,
        questionDifficulty: formData.questionDifficulty,
        topics: formData.topics.split(',').map(t => t.trim()).filter(t => t !== ''),
        // Add other required fields with default values
        questionDescription: "Updated description", // This should be fetched from existing data
        constraints: [],
        sampleTestCases: [],
        actualTestCases: [],
        questionSource: 'LeetCode',
        questionSolutions: [],
      };

      await apiService.updateQuestion(user.jwt, updateData as Question);
      toast({
        title: "Success",
        description: "Question updated successfully!",
      });
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update question",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Button
                onClick={onBack}
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <CardTitle className="text-2xl font-bold text-white">Update Question</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="questionId" className="text-slate-200">Question ID</Label>
                <Input
                  id="questionId"
                  type="number"
                  value={formData.questionId}
                  onChange={(e) => setFormData(prev => ({ ...prev, questionId: parseInt(e.target.value) }))}
                  className="bg-slate-700/50 border-slate-600 text-white"
                  readOnly
                />
              </div>

              <div>
                <Label htmlFor="id" className="text-slate-200">MongoDB ID (Optional)</Label>
                <Input
                  id="id"
                  value={formData.id}
                  onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                  placeholder="Enter MongoDB ID if known"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="questionName" className="text-slate-200">Question Name</Label>
                <Input
                  id="questionName"
                  value={formData.questionName}
                  onChange={(e) => setFormData(prev => ({ ...prev, questionName: e.target.value }))}
                  required
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="topics" className="text-slate-200">Topics (comma-separated)</Label>
                <Input
                  id="topics"
                  value={formData.topics}
                  onChange={(e) => setFormData(prev => ({ ...prev, topics: e.target.value }))}
                  placeholder="e.g., HashMap, Sliding Window, String"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>

              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                <p className="text-blue-300 text-sm">
                  <strong>Note:</strong> This is a simplified update form. In a production environment, 
                  you would fetch the complete question data first and allow editing of all fields 
                  including description, test cases, constraints, and solutions.
                </p>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? 'Updating Question...' : 'Update Question'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UpdateQuestionForm;
