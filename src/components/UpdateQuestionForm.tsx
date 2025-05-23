import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiService, Question, QuestionSummary, TestCase, Solution } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Trash, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UpdateQuestionFormProps {
  question: QuestionSummary;
  onBack: () => void;
  onSuccess: () => void;
}

const UpdateQuestionForm: React.FC<UpdateQuestionFormProps> = ({ question, onBack, onSuccess }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  
  const [formData, setFormData] = useState<Question>({
    id: '',
    questionId: question.questionId,
    questionName: question.questionName,
    questionDescription: '',
    constraints: [''],
    sampleTestCases: [{ input: '', output: '', explanation: '' }] as TestCase[],
    actualTestCases: [{ input: '', output: '', explanation: '' }] as TestCase[],
    topics: question.topics.length ? question.topics : [''],
    questionDifficulty: question.questionDifficulty,
    questionSource: 'LeetCode' as 'LeetCode' | 'CodeForces',
    questionSolutions: [{ name: '', explanation: '', example: '', code: '' }] as Solution[]
  });

  // Fetch complete question data when component mounts
  useEffect(() => {
    const fetchQuestionData = async () => {
      if (!user?.jwt) return;
      
      try {
        setIsFetching(true);
        const fullQuestion = await apiService.getQuestionById(user.jwt, question.questionId);
        
        // Update form data with the fetched question
        setFormData({
          id: fullQuestion.id || '',
          questionId: fullQuestion.questionId || question.questionId,
          questionName: fullQuestion.questionName,
          questionDescription: fullQuestion.questionDescription || '',
          constraints: fullQuestion.constraints.length ? fullQuestion.constraints : [''],
          sampleTestCases: fullQuestion.sampleTestCases.length ? 
            fullQuestion.sampleTestCases : 
            [{ input: '', output: '', explanation: '' }],
          actualTestCases: fullQuestion.actualTestCases.length ? 
            fullQuestion.actualTestCases : 
            [{ input: '', output: '', explanation: '' }],
          topics: fullQuestion.topics.length ? fullQuestion.topics : [''],
          questionDifficulty: fullQuestion.questionDifficulty,
          questionSource: fullQuestion.questionSource,
          questionSolutions: fullQuestion.questionSolutions.length ? 
            fullQuestion.questionSolutions : 
            [{ name: '', explanation: '', example: '', code: '' }]
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch question details. Using summary data instead.",
          variant: "destructive",
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchQuestionData();
  }, [question.questionId, user?.jwt]);

  // Helper functions for handling arrays of data
  const handleArrayChange = <T extends unknown>(
    field: keyof typeof formData, 
    index: number, 
    value: T
  ) => {
    setFormData(prev => {
      const newArray = [...prev[field] as T[]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const handleAddToArray = (field: keyof typeof formData, template: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field] as any[], template]
    }));
  };

  const handleRemoveFromArray = (field: keyof typeof formData, index: number) => {
    if ((formData[field] as any[]).length > 1) {
      setFormData(prev => {
        const newArray = [...prev[field] as any[]];
        newArray.splice(index, 1);
        return { ...prev, [field]: newArray };
      });
    }
  };

  // Helper functions for nested object changes
  const handleNestedChange = <T extends unknown>(
    field: keyof typeof formData,
    index: number,
    key: string,
    value: T
  ) => {
    setFormData(prev => {
      const newArray = [...prev[field] as any[]];
      newArray[index] = { ...newArray[index], [key]: value };
      return { ...prev, [field]: newArray };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.jwt) return;

    setIsLoading(true);

    try {
      // Filter out empty fields
      const filteredConstraints = formData.constraints.filter(c => c.trim() !== '');
      const filteredTopics = formData.topics.filter(t => t.trim() !== '');
      const filteredSampleTestCases = formData.sampleTestCases.filter(tc => tc.input.trim() !== '' && tc.output.trim() !== '');
      const filteredActualTestCases = formData.actualTestCases.filter(tc => tc.input.trim() !== '' && tc.output.trim() !== '');
      const filteredSolutions = formData.questionSolutions.filter(s => s.name.trim() !== '' && s.code.trim() !== '');

      const updateData: Question = {
        id: formData.id || undefined,
        questionId: formData.questionId,
        questionName: formData.questionName,
        questionDescription: formData.questionDescription,
        constraints: filteredConstraints.length ? filteredConstraints : [],
        sampleTestCases: filteredSampleTestCases.length ? filteredSampleTestCases : [],
        actualTestCases: filteredActualTestCases.length ? filteredActualTestCases : [],
        topics: filteredTopics.length ? filteredTopics : [],
        questionDifficulty: formData.questionDifficulty,
        questionSource: formData.questionSource,
        questionSolutions: filteredSolutions.length ? filteredSolutions : []
      };

      await apiService.updateQuestion(user.jwt, updateData);
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

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 flex items-center justify-center">
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm max-w-md w-full">
          <CardContent className="pt-6 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
            <p className="text-slate-300">Loading question data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
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
              <CardTitle className="text-2xl font-bold text-white">Update Question #{formData.questionId}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white">Basic Information</h2>
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
                  <Label htmlFor="questionDescription" className="text-slate-200">Question Description</Label>
                  <Textarea
                    id="questionDescription"
                    value={formData.questionDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, questionDescription: e.target.value }))}
                    required
                    className="bg-slate-700/50 border-slate-600 text-white min-h-[120px]"
                    placeholder="Enter the full question description here"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="difficulty" className="text-slate-200">Difficulty</Label>
                    <Select 
                      value={formData.questionDifficulty} 
                      onValueChange={(value: 'EASY' | 'MEDIUM' | 'HARD') => setFormData(prev => ({ ...prev, questionDifficulty: value }))}
                    >
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="EASY">Easy</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HARD">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="source" className="text-slate-200">Source</Label>
                    <Select 
                      value={formData.questionSource} 
                      onValueChange={(value: 'LeetCode' | 'CodeForces') => setFormData(prev => ({ ...prev, questionSource: value }))}
                    >
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="LeetCode">LeetCode</SelectItem>
                        <SelectItem value="CodeForces">CodeForces</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Constraints */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-white">Constraints</h2>
                  <Button 
                    type="button"
                    onClick={() => handleAddToArray('constraints', '')}
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Constraint
                  </Button>
                </div>
                
                {formData.constraints.map((constraint, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={constraint}
                      onChange={(e) => handleArrayChange('constraints', index, e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white flex-1"
                      placeholder="e.g., 0 <= s.length <= 5 * 10^4"
                    />
                    <Button
                      type="button"
                      onClick={() => handleRemoveFromArray('constraints', index)}
                      variant="outline"
                      size="icon"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Topics */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-white">Topics</h2>
                  <Button 
                    type="button"
                    onClick={() => handleAddToArray('topics', '')}
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Topic
                  </Button>
                </div>
                
                {formData.topics.map((topic, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={topic}
                      onChange={(e) => handleArrayChange('topics', index, e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white flex-1"
                      placeholder="e.g., HashMap, Sliding Window, String"
                    />
                    <Button
                      type="button"
                      onClick={() => handleRemoveFromArray('topics', index)}
                      variant="outline"
                      size="icon"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Sample Test Cases */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-white">Sample Test Cases</h2>
                  <Button 
                    type="button"
                    onClick={() => handleAddToArray('sampleTestCases', { input: '', output: '', explanation: '' })}
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Test Case
                  </Button>
                </div>
                
                {formData.sampleTestCases.map((testCase, index) => (
                  <div key={index} className="space-y-2 p-4 bg-slate-700/30 rounded-lg relative">
                    <Button
                      type="button"
                      onClick={() => handleRemoveFromArray('sampleTestCases', index)}
                      variant="outline"
                      size="icon"
                      className="absolute top-2 right-2 border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                    <div>
                      <Label htmlFor={`sample-input-${index}`} className="text-slate-200">Input</Label>
                      <Input
                        id={`sample-input-${index}`}
                        value={testCase.input}
                        onChange={(e) => handleNestedChange('sampleTestCases', index, 'input', e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        placeholder='e.g., s = "abcabcbb"'
                      />
                    </div>
                    <div>
                      <Label htmlFor={`sample-output-${index}`} className="text-slate-200">Output</Label>
                      <Input
                        id={`sample-output-${index}`}
                        value={testCase.output}
                        onChange={(e) => handleNestedChange('sampleTestCases', index, 'output', e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        placeholder="e.g., 3"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`sample-explanation-${index}`} className="text-slate-200">Explanation</Label>
                      <Textarea
                        id={`sample-explanation-${index}`}
                        value={testCase.explanation || ''}
                        onChange={(e) => handleNestedChange('sampleTestCases', index, 'explanation', e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        placeholder='e.g., The answer is "abc", with the length of 3.'
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Actual Test Cases */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-white">Actual Test Cases</h2>
                  <Button 
                    type="button"
                    onClick={() => handleAddToArray('actualTestCases', { input: '', output: '', explanation: '' })}
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Test Case
                  </Button>
                </div>
                
                {formData.actualTestCases.map((testCase, index) => (
                  <div key={index} className="space-y-2 p-4 bg-slate-700/30 rounded-lg relative">
                    <Button
                      type="button"
                      onClick={() => handleRemoveFromArray('actualTestCases', index)}
                      variant="outline"
                      size="icon"
                      className="absolute top-2 right-2 border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                    <div>
                      <Label htmlFor={`actual-input-${index}`} className="text-slate-200">Input</Label>
                      <Input
                        id={`actual-input-${index}`}
                        value={testCase.input}
                        onChange={(e) => handleNestedChange('actualTestCases', index, 'input', e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        placeholder="e.g., abcabcbb"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`actual-output-${index}`} className="text-slate-200">Output</Label>
                      <Input
                        id={`actual-output-${index}`}
                        value={testCase.output}
                        onChange={(e) => handleNestedChange('actualTestCases', index, 'output', e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        placeholder="e.g., 3"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`actual-explanation-${index}`} className="text-slate-200">Explanation</Label>
                      <Textarea
                        id={`actual-explanation-${index}`}
                        value={testCase.explanation || ''}
                        onChange={(e) => handleNestedChange('actualTestCases', index, 'explanation', e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        placeholder="e.g., abc is the longest substring."
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Solutions */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-white">Solutions</h2>
                  <Button 
                    type="button"
                    onClick={() => handleAddToArray('questionSolutions', { name: '', explanation: '', example: '', code: '' })}
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Solution
                  </Button>
                </div>
                
                {formData.questionSolutions.map((solution, index) => (
                  <div key={index} className="space-y-2 p-4 bg-slate-700/30 rounded-lg relative">
                    <Button
                      type="button"
                      onClick={() => handleRemoveFromArray('questionSolutions', index)}
                      variant="outline"
                      size="icon"
                      className="absolute top-2 right-2 border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                    <div>
                      <Label htmlFor={`solution-name-${index}`} className="text-slate-200">Solution Name</Label>
                      <Input
                        id={`solution-name-${index}`}
                        value={solution.name}
                        onChange={(e) => handleNestedChange('questionSolutions', index, 'name', e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        placeholder="e.g., Sliding Window with HashSet"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`solution-explanation-${index}`} className="text-slate-200">Explanation</Label>
                      <Textarea
                        id={`solution-explanation-${index}`}
                        value={solution.explanation}
                        onChange={(e) => handleNestedChange('questionSolutions', index, 'explanation', e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        placeholder="e.g., Use two pointers to represent the window and a set to store unique characters."
                      />
                    </div>
                    <div>
                      <Label htmlFor={`solution-example-${index}`} className="text-slate-200">Example</Label>
                      <Input
                        id={`solution-example-${index}`}
                        value={solution.example}
                        onChange={(e) => handleNestedChange('questionSolutions', index, 'example', e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        placeholder='e.g., Input: "abcabcbb" -> Max substring: "abc" -> length = 3'
                      />
                    </div>
                    <div>
                      <Label htmlFor={`solution-code-${index}`} className="text-slate-200">Solution Code</Label>
                      <Textarea
                        id={`solution-code-${index}`}
                        value={solution.code}
                        onChange={(e) => handleNestedChange('questionSolutions', index, 'code', e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white min-h-[200px] font-mono"
                        placeholder="Enter your solution code here..."
                      />
                    </div>
                  </div>
                ))}
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
