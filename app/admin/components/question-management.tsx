"use client"

import React, { useState, useEffect } from "react"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { ContestQuestion } from "@/lib/types/question"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Plus, Edit, Trash2, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

interface QuestionManagementProps {
  isLoading?: boolean
}

export function QuestionManagement({ isLoading = false }: QuestionManagementProps) {
  const { createQuestion, getQuestions, updateQuestion, deleteQuestion } = useFirebase()

  const [questions, setQuestions] = useState<ContestQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedContestType, setSelectedContestType] = useState<'speed-coding-with-ai' | 'devathon'>('speed-coding-with-ai')

  // New question form state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newQuestion, setNewQuestion] = useState<Partial<ContestQuestion>>({
    title: '',
    description: '',
    contestType: 'speed-coding-with-ai',
    difficulty: 'medium',
    points: 100,
    sampleInput: '',
    sampleOutput: '',
    constraints: '',
    hints: [],
    releaseTime: new Date(),
    endTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
    isActive: true
  })

  // Edit question state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<ContestQuestion | null>(null)

  // Delete question state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null)

  // Load questions
  useEffect(() => {
    loadQuestions()
  }, [selectedContestType])

  const loadQuestions = async () => {
    try {
      setLoading(true)
      const data = await getQuestions(selectedContestType)
      setQuestions(data)

      // If we got an empty array, show a message about potential permission issues
      if (data.length === 0) {
        toast.warning(
          "No questions found. If you're expecting to see questions, there might be a permissions issue. Please check your Firestore rules.",
          { duration: 5000 }
        )
      }
    } catch (error) {
      console.error("Error loading questions:", error)

      // Show a more detailed error message
      if (error instanceof Error) {
        if (error.message.includes("permission")) {
          toast.error(
            "Permission denied. Make sure you have admin privileges and the Firestore rules are set up correctly.",
            { duration: 5000 }
          )
        } else {
          toast.error(`Failed to load questions: ${error.message}`, { duration: 5000 })
        }
      } else {
        toast.error("Failed to load questions due to an unknown error", { duration: 5000 })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddQuestion = async () => {
    try {
      if (!newQuestion.title || !newQuestion.description) {
        toast.error("Please fill in all required fields")
        return
      }

      // Convert hints from string to array if needed
      let hints = newQuestion.hints || []
      if (typeof newQuestion.hints === 'string') {
        hints = (newQuestion.hints as string).split('\n').filter(hint => hint.trim() !== '')
      }

      // Show a loading toast
      toast.loading("Creating question...", { id: "create-question" })

      try {
        await createQuestion({
          ...newQuestion as ContestQuestion,
          hints
        })

        // Dismiss the loading toast and show success
        toast.dismiss("create-question")
        toast.success("Question created successfully")

        setIsAddDialogOpen(false)
        setNewQuestion({
          title: '',
          description: '',
          contestType: selectedContestType,
          difficulty: 'medium',
          points: 100,
          sampleInput: '',
          sampleOutput: '',
          constraints: '',
          hints: [],
          releaseTime: new Date(),
          endTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
          isActive: true
        })

        loadQuestions()
      } catch (createError) {
        // Dismiss the loading toast and show error
        toast.dismiss("create-question")

        if (createError instanceof Error) {
          if (createError.message.includes("permission")) {
            toast.error(
              "Permission denied. Make sure you have admin privileges and the Firestore rules are set up correctly.",
              { duration: 5000 }
            )
          } else {
            toast.error(`Failed to create question: ${createError.message}`, { duration: 5000 })
          }
        } else {
          toast.error("Failed to create question due to an unknown error", { duration: 5000 })
        }
      }
    } catch (error) {
      console.error("Error adding question:", error)
      toast.error("Failed to create question")
    }
  }

  const handleEditQuestion = async () => {
    try {
      if (!editingQuestion || !editingQuestion.id) return

      // Convert hints from string to array if needed
      let hints = editingQuestion.hints || []
      if (typeof editingQuestion.hints === 'string') {
        hints = (editingQuestion.hints as string).split('\n').filter(hint => hint.trim() !== '')
      }

      await updateQuestion(editingQuestion.id, {
        ...editingQuestion,
        hints
      })

      toast.success("Question updated successfully")
      setIsEditDialogOpen(false)
      setEditingQuestion(null)

      loadQuestions()
    } catch (error) {
      console.error("Error updating question:", error)
      toast.error("Failed to update question")
    }
  }

  const handleDeleteQuestion = async () => {
    try {
      if (!questionToDelete) return

      await deleteQuestion(questionToDelete)

      toast.success("Question deleted successfully")
      setIsDeleteDialogOpen(false)
      setQuestionToDelete(null)

      loadQuestions()
    } catch (error) {
      console.error("Error deleting question:", error)
      toast.error("Failed to delete question")
    }
  }

  const formatDateTime = (date: Date | string) => {
    if (!date) return 'N/A'
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return format(dateObj, 'MMM dd, yyyy HH:mm')
  }

  if (isLoading || loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-lightBlue" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="glassmorphism border-lightBlue/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl md:text-2xl font-bold text-white">Contest Questions</CardTitle>
            <CardDescription className="text-gray-300">
              Manage questions for coding contests
            </CardDescription>
          </div>

          <div className="flex items-center gap-4">
            <Select
              value={selectedContestType}
              onValueChange={(value: 'speed-coding-with-ai' | 'devathon') => setSelectedContestType(value)}
            >
              <SelectTrigger className="w-[200px] bg-darkBlue/50 border-gray-700 text-white">
                <SelectValue placeholder="Select contest" />
              </SelectTrigger>
              <SelectContent className="bg-darkBlue border-gray-700">
                <SelectItem value="speed-coding-with-ai">Speed Coding with AI</SelectItem>
                <SelectItem value="devathon">Devathon</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-lightBlue hover:bg-lightBlue/80 text-white">
                  <Plus className="h-4 w-4 mr-2" /> Add Question
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-darkBlue border-lightBlue/20 max-h-[80vh] overflow-y-auto max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-white">Add New Question</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Create a new question for {selectedContestType.replace(/-/g, ' ')}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-white">Title</Label>
                    <Input
                      id="title"
                      value={newQuestion.title || ''}
                      onChange={(e) => setNewQuestion({...newQuestion, title: e.target.value})}
                      className="bg-darkBlue/50 border-gray-700 text-white"
                      placeholder="Enter question title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-white">Description</Label>
                    <Textarea
                      id="description"
                      value={newQuestion.description || ''}
                      onChange={(e) => setNewQuestion({...newQuestion, description: e.target.value})}
                      className="bg-darkBlue/50 border-gray-700 text-white min-h-[100px]"
                      placeholder="Enter detailed question description"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="difficulty" className="text-white">Difficulty</Label>
                      <Select
                        value={newQuestion.difficulty || 'medium'}
                        onValueChange={(value: 'easy' | 'medium' | 'hard') =>
                          setNewQuestion({...newQuestion, difficulty: value})}
                      >
                        <SelectTrigger className="bg-darkBlue/50 border-gray-700 text-white">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent className="bg-darkBlue border-gray-700">
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="points" className="text-white">Points</Label>
                      <Input
                        id="points"
                        type="number"
                        value={newQuestion.points || 100}
                        onChange={(e) => setNewQuestion({...newQuestion, points: parseInt(e.target.value)})}
                        className="bg-darkBlue/50 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sampleInput" className="text-white">Sample Input</Label>
                    <Textarea
                      id="sampleInput"
                      value={newQuestion.sampleInput || ''}
                      onChange={(e) => setNewQuestion({...newQuestion, sampleInput: e.target.value})}
                      className="bg-darkBlue/50 border-gray-700 text-white min-h-[80px]"
                      placeholder="Enter sample input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sampleOutput" className="text-white">Sample Output</Label>
                    <Textarea
                      id="sampleOutput"
                      value={newQuestion.sampleOutput || ''}
                      onChange={(e) => setNewQuestion({...newQuestion, sampleOutput: e.target.value})}
                      className="bg-darkBlue/50 border-gray-700 text-white min-h-[80px]"
                      placeholder="Enter expected output"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="constraints" className="text-white">Constraints</Label>
                    <Textarea
                      id="constraints"
                      value={newQuestion.constraints || ''}
                      onChange={(e) => setNewQuestion({...newQuestion, constraints: e.target.value})}
                      className="bg-darkBlue/50 border-gray-700 text-white min-h-[80px]"
                      placeholder="Enter constraints"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hints" className="text-white">Hints (one per line)</Label>
                    <Textarea
                      id="hints"
                      value={Array.isArray(newQuestion.hints) ? newQuestion.hints.join('\n') : newQuestion.hints || ''}
                      onChange={(e) => setNewQuestion({...newQuestion, hints: e.target.value})}
                      className="bg-darkBlue/50 border-gray-700 text-white min-h-[80px]"
                      placeholder="Enter hints (one per line)"
                    />
                  </div>

                  <div className="p-4 border border-lightBlue/30 rounded-md bg-lightBlue/10 mb-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <Switch
                        id="isActive"
                        checked={newQuestion.isActive}
                        onCheckedChange={(checked) => setNewQuestion({...newQuestion, isActive: checked})}
                      />
                      <Label htmlFor="isActive" className="text-white font-medium">Make Question Active</Label>
                    </div>
                    <p className="text-gray-300 text-sm">
                      When active, this question will be visible to participants who have registered for this contest.
                    </p>
                  </div>

                  <details className="mb-4">
                    <summary className="cursor-pointer text-gray-300 mb-2">Advanced Timing Options (Optional)</summary>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-700 rounded-md mt-2">
                      <div className="space-y-2">
                        <Label htmlFor="releaseTime" className="text-gray-400">Release Time</Label>
                        <Input
                          id="releaseTime"
                          type="datetime-local"
                          value={newQuestion.releaseTime instanceof Date
                            ? newQuestion.releaseTime.toISOString().slice(0, 16)
                            : typeof newQuestion.releaseTime === 'string'
                              ? new Date(newQuestion.releaseTime).toISOString().slice(0, 16)
                              : new Date().toISOString().slice(0, 16)}
                          onChange={(e) => setNewQuestion({...newQuestion, releaseTime: new Date(e.target.value)})}
                          className="bg-darkBlue/50 border-gray-700 text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="endTime" className="text-gray-400">End Time</Label>
                        <Input
                          id="endTime"
                          type="datetime-local"
                          value={newQuestion.endTime instanceof Date
                            ? newQuestion.endTime.toISOString().slice(0, 16)
                            : typeof newQuestion.endTime === 'string'
                              ? new Date(newQuestion.endTime).toISOString().slice(0, 16)
                              : new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                          onChange={(e) => setNewQuestion({...newQuestion, endTime: new Date(e.target.value)})}
                          className="bg-darkBlue/50 border-gray-700 text-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-gray-400 italic">
                          Note: These fields are no longer used for question visibility. Questions are shown based on the Active status only.
                        </p>
                      </div>
                    </div>
                  </details>
                </div>

                <DialogFooter className="mt-6">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-gray-700 text-white hover:bg-gray-700">
                    Cancel
                  </Button>
                  <Button onClick={handleAddQuestion} className="bg-lightBlue hover:bg-lightBlue/80 text-white">
                    Create Question
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {questions.length === 0 ? (
            <div className="text-center py-8 text-gray-300">
              No questions found for {selectedContestType.replace(/-/g, ' ')}. Add a question to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300 w-1/4">Title</TableHead>
                    <TableHead className="text-gray-300 w-1/6">Difficulty</TableHead>
                    <TableHead className="text-gray-300 w-1/6">Points</TableHead>
                    <TableHead className="text-gray-300 w-1/6">Status</TableHead>
                    <TableHead className="text-gray-300 w-1/6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.map((question) => (
                    <TableRow key={question.id}>
                      <TableCell className="text-white font-medium">{question.title}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          question.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                          question.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-white">{question.points}</TableCell>
                      <TableCell>
                        <Button
                          variant={question.isActive ? "default" : "outline"}
                          size="sm"
                          className={question.isActive ?
                            "bg-green-600 hover:bg-green-700 text-white" :
                            "border-gray-600 text-gray-400 hover:bg-gray-700/20"}
                          onClick={async () => {
                            try {
                              await updateQuestion(question.id!, {
                                isActive: !question.isActive
                              });
                              toast.success(`Question ${question.isActive ? 'deactivated' : 'activated'} successfully`);
                              loadQuestions();
                            } catch (error) {
                              console.error("Error toggling question status:", error);
                              toast.error("Failed to update question status");
                            }
                          }}
                        >
                          {question.isActive ? (
                            <span className="flex items-center">
                              <CheckCircle className="h-4 w-4 mr-1" /> Active
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <XCircle className="h-4 w-4 mr-1" /> Inactive
                            </span>
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="hover:bg-lightBlue/20"
                            onClick={() => {
                              setEditingQuestion(question)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4 text-lightBlue" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="hover:bg-red-500/20"
                            onClick={() => {
                              setQuestionToDelete(question.id)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Question Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-darkBlue border-lightBlue/20 max-h-[80vh] overflow-y-auto max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Question</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update question details
            </DialogDescription>
          </DialogHeader>

          {editingQuestion && (
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title" className="text-white">Title</Label>
                <Input
                  id="edit-title"
                  value={editingQuestion.title || ''}
                  onChange={(e) => setEditingQuestion({...editingQuestion, title: e.target.value})}
                  className="bg-darkBlue/50 border-gray-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description" className="text-white">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingQuestion.description || ''}
                  onChange={(e) => setEditingQuestion({...editingQuestion, description: e.target.value})}
                  className="bg-darkBlue/50 border-gray-700 text-white min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-difficulty" className="text-white">Difficulty</Label>
                  <Select
                    value={editingQuestion.difficulty || 'medium'}
                    onValueChange={(value: 'easy' | 'medium' | 'hard') =>
                      setEditingQuestion({...editingQuestion, difficulty: value})}
                  >
                    <SelectTrigger className="bg-darkBlue/50 border-gray-700 text-white">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent className="bg-darkBlue border-gray-700">
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-points" className="text-white">Points</Label>
                  <Input
                    id="edit-points"
                    type="number"
                    value={editingQuestion.points || 100}
                    onChange={(e) => setEditingQuestion({...editingQuestion, points: parseInt(e.target.value)})}
                    className="bg-darkBlue/50 border-gray-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-sampleInput" className="text-white">Sample Input</Label>
                <Textarea
                  id="edit-sampleInput"
                  value={editingQuestion.sampleInput || ''}
                  onChange={(e) => setEditingQuestion({...editingQuestion, sampleInput: e.target.value})}
                  className="bg-darkBlue/50 border-gray-700 text-white min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-sampleOutput" className="text-white">Sample Output</Label>
                <Textarea
                  id="edit-sampleOutput"
                  value={editingQuestion.sampleOutput || ''}
                  onChange={(e) => setEditingQuestion({...editingQuestion, sampleOutput: e.target.value})}
                  className="bg-darkBlue/50 border-gray-700 text-white min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-constraints" className="text-white">Constraints</Label>
                <Textarea
                  id="edit-constraints"
                  value={editingQuestion.constraints || ''}
                  onChange={(e) => setEditingQuestion({...editingQuestion, constraints: e.target.value})}
                  className="bg-darkBlue/50 border-gray-700 text-white min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-hints" className="text-white">Hints (one per line)</Label>
                <Textarea
                  id="edit-hints"
                  value={Array.isArray(editingQuestion.hints) ? editingQuestion.hints.join('\n') : editingQuestion.hints || ''}
                  onChange={(e) => setEditingQuestion({...editingQuestion, hints: e.target.value})}
                  className="bg-darkBlue/50 border-gray-700 text-white min-h-[80px]"
                />
              </div>

              <div className="p-4 border border-lightBlue/30 rounded-md bg-lightBlue/10 mb-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Switch
                    id="edit-isActive"
                    checked={editingQuestion.isActive}
                    onCheckedChange={(checked) => setEditingQuestion({...editingQuestion, isActive: checked})}
                  />
                  <Label htmlFor="edit-isActive" className="text-white font-medium">Make Question Active</Label>
                </div>
                <p className="text-gray-300 text-sm">
                  When active, this question will be visible to participants who have registered for this contest.
                </p>
              </div>

              <details className="mb-4">
                <summary className="cursor-pointer text-gray-300 mb-2">Advanced Timing Options (Optional)</summary>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-700 rounded-md mt-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-releaseTime" className="text-gray-400">Release Time</Label>
                    <Input
                      id="edit-releaseTime"
                      type="datetime-local"
                      value={editingQuestion.releaseTime instanceof Date
                        ? editingQuestion.releaseTime.toISOString().slice(0, 16)
                        : typeof editingQuestion.releaseTime === 'string'
                          ? new Date(editingQuestion.releaseTime).toISOString().slice(0, 16)
                          : new Date().toISOString().slice(0, 16)}
                      onChange={(e) => setEditingQuestion({...editingQuestion, releaseTime: new Date(e.target.value)})}
                      className="bg-darkBlue/50 border-gray-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-endTime" className="text-gray-400">End Time</Label>
                    <Input
                      id="edit-endTime"
                      type="datetime-local"
                      value={editingQuestion.endTime instanceof Date
                        ? editingQuestion.endTime.toISOString().slice(0, 16)
                        : typeof editingQuestion.endTime === 'string'
                          ? new Date(editingQuestion.endTime).toISOString().slice(0, 16)
                          : new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                      onChange={(e) => setEditingQuestion({...editingQuestion, endTime: new Date(e.target.value)})}
                      className="bg-darkBlue/50 border-gray-700 text-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400 italic">
                      Note: These fields are no longer used for question visibility. Questions are shown based on the Active status only.
                    </p>
                  </div>
                </div>
              </details>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-gray-700 text-white hover:bg-gray-700">
              Cancel
            </Button>
            <Button onClick={handleEditQuestion} className="bg-lightBlue hover:bg-lightBlue/80 text-white">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Question Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-darkBlue border-lightBlue/20 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this question? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-md">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
            <p className="text-sm text-gray-300">
              Deleting this question will remove it permanently and any associated submissions.
            </p>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="border-gray-700 text-white hover:bg-gray-700">
              Cancel
            </Button>
            <Button onClick={handleDeleteQuestion} className="bg-red-500 hover:bg-red-600 text-white">
              Delete Question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
