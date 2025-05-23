
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiService, Question, TestCase, Solution } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AddQuestionFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

const AddQuestionForm: React.FC<AddQuestionFormProps> = ({ onBack, onSuccess }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Question>>({
    questionName: '',
    questionDescription: '',
    constraints: [''],
    sampleTestCases: [{ input: '', output: '', explanation: '' }],
    actualTestCases: [{ input: '', output: '', explanation: '' }],
    topics: [''],
    questionDifficulty: 'EASY',
    questionSource: 'LeetCode',
    questionSolutions: [{ name: '', explanation: '', example: '', code: '' }],
  });

  const handleInputChange = (field: keyof Question, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: 'constraints' | 'topics', index: number, value: string) => {
    const array = [...(formData[field] || [])];
    array[index] = value;
    setFormData(prev => ({ ...prev, [field]: array }));
  };

  const addArrayItem = (field: 'constraints' | 'topics') => {
    const array = [...(formData[field] || []), ''];
    setFormData(prev => ({ ...prev, [field]: array }));
  };

  const removeArrayItem = (field: 'constraints' | 'topics', index: number) => {
    const array = (formData[field] || []).filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [field]: array }));
  };

  const handleTestCaseChange = (
    field: 'sampleTestCases' | 'actualTestCases',
    index: number,
    key: keyof TestCase,
    value: string
  ) => {
    const testCases = [...(formData[field] || [])];
    testCases[index] = { ...testCases[index], [key]: value };
    setFormData(prev => ({ ...prev, [field]: testCases }));
  };

  const addTestCase = (field: 'sampleTestCases' | 'actualTestCases') => {
    const testCases = [...(formData[field] || []), { input: '', output: '', explanation: '' }];
    setFormData(prev => ({ ...prev, [field]: testCases }));
  };

  const removeTestCase = (field: 'sampleTestCases' | 'actualTestCases', index: number) => {
    const testCases = (formData[field] || []).filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [field]: testCases }));
  };

  const handleSolutionChange = (index: number, key: keyof Solution, value: string) => {
    const solutions = [...(formData.questionSolutions || [])];
    solutions[index] = { ...solutions[index], [key]: value };
    setFormData(prev => ({ ...prev, questionSolutions: solutions }));
  };

  const addSolution = () => {
    const solutions = [...(formData.questionSolutions || []), { name: '', explanation: '', example: '', code: '' }];
    setFormData(prev => ({ ...prev, questionSolutions: solutions }));
  };

  const removeSolution = (index: number) => {
    const solutions = (formData.questionSolutions || []).filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, questionSolutions: solutions }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.jwt) return;

    setIsLoading(true);
    try {
      const questionData = {
        ...formData,
        constraints: (formData.constraints || []).filter(c => c.trim() !== ''),
        topics: (formData.topics || []).filter(t => t.trim() !== ''),
        sampleTestCases: (formData.sampleTestCases || []).filter(tc => tc.input.trim() !== '' || tc.output.trim() !== ''),
        actualTestCases: (formData.actualTestCases || []).filter(tc => tc.input.trim() !== '' || tc.output.trim() !== ''),
        questionSolutions: (formData.questionSolutions || []).filter(s => s.name.trim() !== ''),
      } as Question;

      const success = await apiService.addNewQuestion(user.jwt, questionData);
      if (success) {
        toast({
          title: "Success",
          description: "Question added successfully!",
        });
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add question. Please check your data and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
              <CardTitle className="text-2xl font-bold text-white">Add New Question</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="questionName" className="text-slate-200">Question Name</Label>
                  <Input
                    id="questionName"
                    value={formData.questionName || ''}
                    onChange={(e) => handleInputChange('questionName', e.target.value)}
                    required
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="questionDifficulty" className="text-slate-200">Difficulty</Label>
                  <Select 
                    value={formData.questionDifficulty} 
                    onValueChange={(value) => handleInputChange('questionDifficulty', value)}
                  >
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="EASY">Easy</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HARD">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="questionSource" className="text-slate-200">Source</Label>
                <Select 
                  value={formData.questionSource} 
                  onValueChange={(value) => handleInputChange('questionSource', value)}
                >
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="LeetCode">LeetCode</SelectItem>
                    <SelectItem value="CodeForces">CodeForces</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="questionDescription" className="text-slate-200">Description</Label>
                <Textarea
                  id="questionDescription"
                  value={formData.questionDescription || ''}
                  onChange={(e) => handleInputChange('questionDescription', e.target.value)}
                  required
                  rows={4}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>

              {/* Constraints */}
              <div>
                <Label className="text-slate-200">Constraints</Label>
                {(formData.constraints || []).map((constraint, index) => (
                  <div key={index} className="flex gap-2 mt-2">
                    <Input
                      value={constraint}
                      onChange={(e) => handleArrayChange('constraints', index, e.target.value)}
                      placeholder="Enter constraint"
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                    <Button
                      type="button"
                      onClick={() => removeArrayItem('constraints', index)}
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={() => addArrayItem('constraints')}
                  variant="outline"
                  size="sm"
                  className="mt-2 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Constraint
                </Button>
              </div>

              {/* Topics */}
              <div>
                <Label className="text-slate-200">Topics</Label>
                {(formData.topics || []).map((topic, index) => (
                  <div key={index} className="flex gap-2 mt-2">
                    <Input
                      value={topic}
                      onChange={(e) => handleArrayChange('topics', index, e.target.value)}
                      placeholder="Enter topic"
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                    <Button
                      type="button"
                      onClick={() => removeArrayItem('topics', index)}
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={() => addArrayItem('topics')}
                  variant="outline"
                  size="sm"
                  className="mt-2 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Topic
                </Button>
              </div>

              {/* Sample Test Cases */}
              <div>
                <Label className="text-slate-200">Sample Test Cases</Label>
                {(formData.sampleTestCases || []).map((testCase, index) => (
                  <div key={index} className="border border-slate-600 rounded-lg p-4 mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-slate-300">Input</Label>
                        <Textarea
                          value={testCase.input}
                          onChange={(e) => handleTestCaseChange('sampleTestCases', index, 'input', e.target.value)}
                          className="bg-slate-700/50 border-slate-600 text-white"
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Output</Label>
                        <Textarea
                          value={testCase.output}
                          onChange={(e) => handleTestCaseChange('sampleTestCases', index, 'output', e.target.value)}
                          className="bg-slate-700/50 border-slate-600 text-white"
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Explanation</Label>
                        <Textarea
                          value={testCase.explanation || ''}
                          onChange={(e) => handleTestCaseChange('sampleTestCases', index, 'explanation', e.target.value)}
                          className="bg-slate-700/50 border-slate-600 text-white"
                          rows={2}
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={() => removeTestCase('sampleTestCases', index)}
                      variant="outline"
                      size="sm"
                      className="mt-2 border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Test Case
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={() => addTestCase('sampleTestCases')}
                  variant="outline"
                  size="sm"
                  className="mt-2 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Sample Test Case
                </Button>
              </div>

              {/* Actual Test Cases */}
              <div>
                <Label className="text-slate-200">Actual Test Cases</Label>
                {(formData.actualTestCases || []).map((testCase, index) => (
                  <div key={index} className="border border-slate-600 rounded-lg p-4 mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-slate-300">Input</Label>
                        <Textarea
                          value={testCase.input}
                          onChange={(e) => handleTestCaseChange('actualTestCases', index, 'input', e.target.value)}
                          className="bg-slate-700/50 border-slate-600 text-white"
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Output</Label>
                        <Textarea
                          value={testCase.output}
                          onChange={(e) => handleTestCaseChange('actualTestCases', index, 'output', e.target.value)}
                          className="bg-slate-700/50 border-slate-600 text-white"
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Explanation</Label>
                        <Textarea
                          value={testCase.explanation || ''}
                          onChange={(e) => handleTestCaseChange('actualTestCases', index, 'explanation', e.target.value)}
                          className="bg-slate-700/50 border-slate-600 text-white"
                          rows={2}
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={() => removeTestCase('actualTestCases', index)}
                      variant="outline"
                      size="sm"
                      className="mt-2 border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Test Case
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={() => addTestCase('actualTestCases')}
                  variant="outline"
                  size="sm"
                  className="mt-2 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Actual Test Case
                </Button>
              </div>

              {/* Solutions */}
              <div>
                <Label className="text-slate-200">Solutions</Label>
                {(formData.questionSolutions || []).map((solution, index) => (
                  <div key={index} className="border border-slate-600 rounded-lg p-4 mt-2">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label className="text-slate-300">Solution Name</Label>
                        <Input
                          value={solution.name}
                          onChange={(e) => handleSolutionChange(index, 'name', e.target.value)}
                          className="bg-slate-700/50 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Explanation</Label>
                        <Textarea
                          value={solution.explanation}
                          onChange={(e) => handleSolutionChange(index, 'explanation', e.target.value)}
                          className="bg-slate-700/50 border-slate-600 text-white"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Example</Label>
                        <Textarea
                          value={solution.example}
                          onChange={(e) => handleSolutionChange(index, 'example', e.target.value)}
                          className="bg-slate-700/50 border-slate-600 text-white"
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Code</Label>
                        <Textarea
                          value={solution.code}
                          onChange={(e) => handleSolutionChange(index, 'code', e.target.value)}
                          className="bg-slate-700/50 border-slate-600 text-white font-mono"
                          rows={8}
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={() => removeSolution(index)}
                      variant="outline"
                      size="sm"
                      className="mt-2 border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Solution
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={addSolution}
                  variant="outline"
                  size="sm"
                  className="mt-2 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Solution
                </Button>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? 'Adding Question...' : 'Add Question'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddQuestionForm;
