
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiService, Question, TestCase, Solution } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Trash } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddQuestionFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

const AddQuestionForm: React.FC<AddQuestionFormProps> = ({ onBack, onSuccess }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const [questionName, setQuestionName] = useState('');
  const [questionDescription, setQuestionDescription] = useState('');
  const [constraints, setConstraints] = useState<string[]>(['']);
  const [sampleTestCases, setSampleTestCases] = useState<TestCase[]>([{ input: '', output: '', explanation: '' }]);
  const [actualTestCases, setActualTestCases] = useState<TestCase[]>([{ input: '', output: '', explanation: '' }]);
  const [topics, setTopics] = useState<string[]>(['']);
  const [questionDifficulty, setQuestionDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('EASY');
  const [questionSource, setQuestionSource] = useState<'LeetCode' | 'CodeForces'>('LeetCode');
  const [questionSolutions, setQuestionSolutions] = useState<Solution[]>([
    { name: '', explanation: '', example: '', code: '' }
  ]);

  const handleAddConstraint = () => {
    setConstraints([...constraints, '']);
  };

  const handleConstraintChange = (index: number, value: string) => {
    const updatedConstraints = [...constraints];
    updatedConstraints[index] = value;
    setConstraints(updatedConstraints);
  };

  const handleRemoveConstraint = (index: number) => {
    if (constraints.length > 1) {
      const updatedConstraints = [...constraints];
      updatedConstraints.splice(index, 1);
      setConstraints(updatedConstraints);
    }
  };

  // Sample Test Cases
  const handleAddSampleTestCase = () => {
    setSampleTestCases([...sampleTestCases, { input: '', output: '', explanation: '' }]);
  };

  const handleSampleTestCaseChange = (index: number, field: keyof TestCase, value: string) => {
    const updatedTestCases = [...sampleTestCases];
    updatedTestCases[index] = { ...updatedTestCases[index], [field]: value };
    setSampleTestCases(updatedTestCases);
  };

  const handleRemoveSampleTestCase = (index: number) => {
    if (sampleTestCases.length > 1) {
      const updatedTestCases = [...sampleTestCases];
      updatedTestCases.splice(index, 1);
      setSampleTestCases(updatedTestCases);
    }
  };

  // Actual Test Cases
  const handleAddActualTestCase = () => {
    setActualTestCases([...actualTestCases, { input: '', output: '', explanation: '' }]);
  };

  const handleActualTestCaseChange = (index: number, field: keyof TestCase, value: string) => {
    const updatedTestCases = [...actualTestCases];
    updatedTestCases[index] = { ...updatedTestCases[index], [field]: value };
    setActualTestCases(updatedTestCases);
  };

  const handleRemoveActualTestCase = (index: number) => {
    if (actualTestCases.length > 1) {
      const updatedTestCases = [...actualTestCases];
      updatedTestCases.splice(index, 1);
      setActualTestCases(updatedTestCases);
    }
  };

  // Topics
  const handleAddTopic = () => {
    setTopics([...topics, '']);
  };

  const handleTopicChange = (index: number, value: string) => {
    const updatedTopics = [...topics];
    updatedTopics[index] = value;
    setTopics(updatedTopics);
  };

  const handleRemoveTopic = (index: number) => {
    if (topics.length > 1) {
      const updatedTopics = [...topics];
      updatedTopics.splice(index, 1);
      setTopics(updatedTopics);
    }
  };

  // Solutions
  const handleAddSolution = () => {
    setQuestionSolutions([...questionSolutions, { name: '', explanation: '', example: '', code: '' }]);
  };

  const handleSolutionChange = (index: number, field: keyof Solution, value: string) => {
    const updatedSolutions = [...questionSolutions];
    updatedSolutions[index] = { ...updatedSolutions[index], [field]: value };
    setQuestionSolutions(updatedSolutions);
  };

  const handleRemoveSolution = (index: number) => {
    if (questionSolutions.length > 1) {
      const updatedSolutions = [...questionSolutions];
      updatedSolutions.splice(index, 1);
      setQuestionSolutions(updatedSolutions);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.jwt) return;

    setIsLoading(true);

    try {
      // Filter out empty fields
      const filteredConstraints = constraints.filter(c => c.trim() !== '');
      const filteredTopics = topics.filter(t => t.trim() !== '');
      const filteredSampleTestCases = sampleTestCases.filter(tc => tc.input.trim() !== '' && tc.output.trim() !== '');
      const filteredActualTestCases = actualTestCases.filter(tc => tc.input.trim() !== '' && tc.output.trim() !== '');
      const filteredSolutions = questionSolutions.filter(s => s.name.trim() !== '' && s.code.trim() !== '');

      const question: Question = {
        questionName,
        questionDescription,
        constraints: filteredConstraints,
        sampleTestCases: filteredSampleTestCases,
        actualTestCases: filteredActualTestCases,
        topics: filteredTopics,
        questionDifficulty,
        questionSource,
        questionSolutions: filteredSolutions
      };

      await apiService.addNewQuestion(user.jwt, question);
      toast({
        title: "Success",
        description: "Question added successfully!",
      });
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add question. Please try again.",
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
              <CardTitle className="text-2xl font-bold text-white">Add New Coding Question</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white">Basic Information</h2>
                <div>
                  <Label htmlFor="questionName" className="text-slate-200">Question Name</Label>
                  <Input
                    id="questionName"
                    value={questionName}
                    onChange={(e) => setQuestionName(e.target.value)}
                    required
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="questionDescription" className="text-slate-200">Question Description</Label>
                  <Textarea
                    id="questionDescription"
                    value={questionDescription}
                    onChange={(e) => setQuestionDescription(e.target.value)}
                    required
                    className="bg-slate-700/50 border-slate-600 text-white min-h-[120px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="difficulty" className="text-slate-200">Difficulty</Label>
                    <Select value={questionDifficulty} onValueChange={(value: 'EASY' | 'MEDIUM' | 'HARD') => setQuestionDifficulty(value)}>
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
                    <Select value={questionSource} onValueChange={(value: 'LeetCode' | 'CodeForces') => setQuestionSource(value)}>
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
                    onClick={handleAddConstraint}
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Constraint
                  </Button>
                </div>
                
                {constraints.map((constraint, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={constraint}
                      onChange={(e) => handleConstraintChange(index, e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white flex-1"
                      placeholder="e.g., 0 <= s.length <= 5 * 10^4"
                    />
                    <Button
                      type="button"
                      onClick={() => handleRemoveConstraint(index)}
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
                    onClick={handleAddTopic}
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Topic
                  </Button>
                </div>
                
                {topics.map((topic, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={topic}
                      onChange={(e) => handleTopicChange(index, e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white flex-1"
                      placeholder="e.g., HashMap, Sliding Window, String"
                    />
                    <Button
                      type="button"
                      onClick={() => handleRemoveTopic(index)}
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
                    onClick={handleAddSampleTestCase}
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Test Case
                  </Button>
                </div>
                
                {sampleTestCases.map((testCase, index) => (
                  <div key={index} className="space-y-2 p-4 bg-slate-700/30 rounded-lg relative">
                    <Button
                      type="button"
                      onClick={() => handleRemoveSampleTestCase(index)}
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
                        onChange={(e) => handleSampleTestCaseChange(index, 'input', e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        placeholder='e.g., s = "abcabcbb"'
                      />
                    </div>
                    <div>
                      <Label htmlFor={`sample-output-${index}`} className="text-slate-200">Output</Label>
                      <Input
                        id={`sample-output-${index}`}
                        value={testCase.output}
                        onChange={(e) => handleSampleTestCaseChange(index, 'output', e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        placeholder="e.g., 3"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`sample-explanation-${index}`} className="text-slate-200">Explanation</Label>
                      <Textarea
                        id={`sample-explanation-${index}`}
                        value={testCase.explanation || ''}
                        onChange={(e) => handleSampleTestCaseChange(index, 'explanation', e.target.value)}
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
                    onClick={handleAddActualTestCase}
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Test Case
                  </Button>
                </div>
                
                {actualTestCases.map((testCase, index) => (
                  <div key={index} className="space-y-2 p-4 bg-slate-700/30 rounded-lg relative">
                    <Button
                      type="button"
                      onClick={() => handleRemoveActualTestCase(index)}
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
                        onChange={(e) => handleActualTestCaseChange(index, 'input', e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        placeholder="e.g., abcabcbb"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`actual-output-${index}`} className="text-slate-200">Output</Label>
                      <Input
                        id={`actual-output-${index}`}
                        value={testCase.output}
                        onChange={(e) => handleActualTestCaseChange(index, 'output', e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        placeholder="e.g., 3"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`actual-explanation-${index}`} className="text-slate-200">Explanation</Label>
                      <Textarea
                        id={`actual-explanation-${index}`}
                        value={testCase.explanation || ''}
                        onChange={(e) => handleActualTestCaseChange(index, 'explanation', e.target.value)}
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
                    onClick={handleAddSolution}
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Solution
                  </Button>
                </div>
                
                {questionSolutions.map((solution, index) => (
                  <div key={index} className="space-y-2 p-4 bg-slate-700/30 rounded-lg relative">
                    <Button
                      type="button"
                      onClick={() => handleRemoveSolution(index)}
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
                        onChange={(e) => handleSolutionChange(index, 'name', e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        placeholder="e.g., Sliding Window with HashSet"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`solution-explanation-${index}`} className="text-slate-200">Explanation</Label>
                      <Textarea
                        id={`solution-explanation-${index}`}
                        value={solution.explanation}
                        onChange={(e) => handleSolutionChange(index, 'explanation', e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        placeholder="e.g., Use two pointers to represent the window and a set to store unique characters."
                      />
                    </div>
                    <div>
                      <Label htmlFor={`solution-example-${index}`} className="text-slate-200">Example</Label>
                      <Input
                        id={`solution-example-${index}`}
                        value={solution.example}
                        onChange={(e) => handleSolutionChange(index, 'example', e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        placeholder='e.g., Input: "abcabcbb" -> Max substring: "abc" -> length = 3'
                      />
                    </div>
                    <div>
                      <Label htmlFor={`solution-code-${index}`} className="text-slate-200">Solution Code</Label>
                      <Textarea
                        id={`solution-code-${index}`}
                        value={solution.code}
                        onChange={(e) => handleSolutionChange(index, 'code', e.target.value)}
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
