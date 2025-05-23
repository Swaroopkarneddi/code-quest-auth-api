import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiService, QuestionSummary } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LogOut, Plus, Search, Settings } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AddQuestionForm from "./AddQuestionForm";
import UpdateQuestionForm from "./UpdateQuestionForm";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [questions, setQuestions] = useState<QuestionSummary[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<QuestionSummary[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "add" | "update">(
    "dashboard"
  );
  const [selectedQuestion, setSelectedQuestion] =
    useState<QuestionSummary | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    filterQuestions();
  }, [questions, searchTerm, difficultyFilter]);

  const fetchQuestions = async () => {
    if (!user?.jwt) return;

    try {
      const questionsData = await apiService.getAllQuestionNames(user.jwt);
      setQuestions(questionsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterQuestions = () => {
    let filtered = questions;

    if (searchTerm) {
      filtered = filtered.filter(
        (q) =>
          q.questionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.topics.some((topic) =>
            topic.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    if (difficultyFilter !== "all") {
      filtered = filtered.filter(
        (q) => q.questionDifficulty === difficultyFilter
      );
    }

    setFilteredQuestions(filtered);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "bg-green-600";
      case "MEDIUM":
        return "bg-yellow-600";
      case "HARD":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  if (activeTab === "add") {
    return (
      <AddQuestionForm
        onBack={() => setActiveTab("dashboard")}
        onSuccess={() => {
          setActiveTab("dashboard");
          fetchQuestions();
        }}
      />
    );
  }

  if (activeTab === "update" && selectedQuestion) {
    return (
      <UpdateQuestionForm
        question={selectedQuestion}
        onBack={() => setActiveTab("dashboard")}
        onSuccess={() => {
          setActiveTab("dashboard");
          fetchQuestions();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Code Grad</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-slate-300">Welcome, {user?.role}</span>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="bg-green-600 text-white hover:bg-green-700 border-green-600"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search questions or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
            />
          </div>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-[180px] bg-slate-800/50 border-slate-600 text-white">
              <SelectValue placeholder="Filter by difficulty" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="EASY">Easy</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HARD">Hard</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => setActiveTab("add")}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white">
                {questions.length}
              </div>
              <div className="text-slate-400">Total Questions</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-400">
                {
                  questions.filter((q) => q.questionDifficulty === "EASY")
                    .length
                }
              </div>
              <div className="text-slate-400">Easy</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-400">
                {
                  questions.filter((q) => q.questionDifficulty === "MEDIUM")
                    .length
                }
              </div>
              <div className="text-slate-400">Medium</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-400">
                {
                  questions.filter((q) => q.questionDifficulty === "HARD")
                    .length
                }
              </div>
              <div className="text-slate-400">Hard</div>
            </CardContent>
          </Card>
        </div>

        {/* Questions Grid */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-slate-400">Loading questions...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuestions.map((question) => (
              <Card
                key={question.questionId}
                className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-white text-lg">
                      {question.questionName}
                    </CardTitle>
                    <Badge
                      className={`${getDifficultyColor(
                        question.questionDifficulty
                      )} text-white`}
                    >
                      {question.questionDifficulty}
                    </Badge>
                  </div>
                  <CardDescription className="text-slate-400">
                    Question ID: {question.questionId}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {question.topics.map((topic, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="border-slate-600 text-slate-300"
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedQuestion(question);
                      setActiveTab("update");
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full bg-green-600 text-white hover:bg-green-700 border-green-600"
                  >
                    Update Question
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredQuestions.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <div className="text-slate-400">
              No questions found matching your criteria.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
