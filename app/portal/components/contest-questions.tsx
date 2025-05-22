"use client"

import React, { useState, useEffect } from "react"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { ContestQuestion, QuestionSubmission } from "@/lib/types/question"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Clock, CheckCircle, AlertTriangle, LockIcon, Code, Send } from "lucide-react"
import { format, formatDistance } from "date-fns"
import { toast } from "sonner"
import { ParticipantData } from "@/lib/firebase/firebase-provider"

interface ContestQuestionsProps {
  contestType: 'speed-coding-with-ai' | 'devathon'
  participant: ParticipantData
}

export function ContestQuestions({ contestType, participant }: ContestQuestionsProps) {
  const { getActiveQuestions, submitAnswer, getSubmissions } = useFirebase()

  const [questions, setQuestions] = useState<ContestQuestion[]>([])
  const [submissions, setSubmissions] = useState<Record<string, QuestionSubmission>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({})
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [codeUrls, setCodeUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    loadQuestions()
  }, [contestType])

  const loadQuestions = async () => {
    try {
      setLoading(true)
      const data = await getActiveQuestions(contestType)
      setQuestions(data)

      // Skip loading submissions initially - we'll load them individually for each question
      // This avoids the permissions issue with the broad query

      // Create an empty submissions map
      const submissionsMap: Record<string, QuestionSubmission> = {}

      // For each question, try to load its submission directly
      if (data.length > 0 && participant.email) {
        for (const question of data) {
          if (question.id) {
            try {
              // Try to get submission for this specific question
              const questionSubmissions = await getSubmissions(question.id, participant.email)

              if (questionSubmissions.length > 0) {
                submissionsMap[question.id] = questionSubmissions[0]
              }
            } catch (error) {
              console.error(`Error loading submission for question ${question.id}:`, error)
              // Continue with other questions even if one fails
            }
          }
        }

        setSubmissions(submissionsMap)
      }
    } catch (error) {
      console.error("Error loading questions:", error)
      toast.error("Failed to load questions")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (questionId: string) => {
    // Always use email for consistency
    if (!participant.email) {
      toast.error("You must be logged in to submit answers")
      return
    }

    try {
      setSubmitting(prev => ({ ...prev, [questionId]: true }))

      await submitAnswer({
        questionId,
        participantId: participant.email, // Always use email
        submissionText: answers[questionId] || '',
        codeUrl: codeUrls[questionId] || '',
        submittedAt: new Date(),
        status: 'pending'
      })

      toast.success("Answer submitted successfully")

      // Reload questions and submissions
      await loadQuestions()

      // Clear the answer and code URL
      setAnswers(prev => ({ ...prev, [questionId]: '' }))
      setCodeUrls(prev => ({ ...prev, [questionId]: '' }))
    } catch (error: any) {
      console.error("Error submitting answer:", error)
      toast.error(error.message || "Failed to submit answer")
    } finally {
      setSubmitting(prev => ({ ...prev, [questionId]: false }))
    }
  }

  const formatDateTime = (date: Date | string) => {
    if (!date) return 'N/A'
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return format(dateObj, 'MMM dd, yyyy HH:mm')
  }

  const getTimeRemaining = (endTime: Date | string) => {
    if (!endTime) return 'N/A'
    const endDate = typeof endTime === 'string' ? new Date(endTime) : endTime
    const now = new Date()

    if (now > endDate) {
      return 'Ended'
    }

    return formatDistance(endDate, now, { addSuffix: true })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-400 bg-green-500/20'
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/20'
      case 'hard':
        return 'text-red-400 bg-red-500/20'
      default:
        return 'text-gray-400 bg-gray-500/20'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-lightBlue" />
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <Card className="glassmorphism border-lightBlue/20">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">No Active Questions</CardTitle>
          <CardDescription className="text-gray-300">
            There are no active questions for {contestType.replace(/-/g, ' ')} at this time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-300 max-w-md">
              Questions will be available at the scheduled time. Please check back later.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="glassmorphism border-lightBlue/20">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">
            {contestType === 'speed-coding-with-ai' ? 'Speed Coding with AI' : 'Devathon'} Questions
          </CardTitle>
          <CardDescription className="text-gray-300">
            Complete the following questions before the deadline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {questions.map((question) => {
              const hasSubmitted = !!submissions[question.id || '']
              const isSubmitting = submitting[question.id || ''] || false

              return (
                <Card key={question.id} className="border border-gray-700 bg-darkBlue/30">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-bold text-white flex items-center">
                          {question.title}
                          <span className={`ml-2 text-xs px-2 py-1 rounded ${getDifficultyColor(question.difficulty)}`}>
                            {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                          </span>
                          <span className="ml-2 text-xs px-2 py-1 rounded bg-lightBlue/20 text-lightBlue">
                            {question.points} points
                          </span>
                        </CardTitle>
                        <CardDescription className="text-gray-300 mt-1">
                          Due: {formatDateTime(question.endTime)} ({getTimeRemaining(question.endTime)})
                        </CardDescription>
                      </div>

                      {hasSubmitted && (
                        <div className="flex items-center text-green-400">
                          <CheckCircle className="h-5 w-5 mr-1" />
                          <span>Submitted</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <Tabs defaultValue="description" className="w-full">
                      <TabsList className="grid w-full grid-cols-3 bg-darkBlue/50">
                        <TabsTrigger value="description" className="text-white">
                          Description
                        </TabsTrigger>
                        <TabsTrigger value="examples" className="text-white">
                          Examples
                        </TabsTrigger>
                        <TabsTrigger value="submission" className="text-white">
                          Submission
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="description" className="space-y-4 mt-4">
                        <div className="prose prose-invert max-w-none">
                          <div className="text-gray-300 whitespace-pre-line">{question.description}</div>

                          {question.constraints && (
                            <div className="mt-4">
                              <h4 className="text-white font-medium mb-2">Constraints:</h4>
                              <div className="text-gray-300 whitespace-pre-line">{question.constraints}</div>
                            </div>
                          )}

                          {Array.isArray(question.hints) && question.hints.length > 0 && (
                            <div className="mt-4">
                              <h4 className="text-white font-medium mb-2">Hints:</h4>
                              <ul className="list-disc pl-5 space-y-1">
                                {question.hints.map((hint, index) => (
                                  <li key={index} className="text-gray-300">{hint}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="examples" className="space-y-4 mt-4">
                        {question.sampleInput && question.sampleOutput ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <h4 className="text-white font-medium">Sample Input:</h4>
                              <pre className="bg-gray-800/50 p-3 rounded text-gray-300 overflow-x-auto">
                                {question.sampleInput}
                              </pre>
                            </div>

                            <div className="space-y-2">
                              <h4 className="text-white font-medium">Sample Output:</h4>
                              <pre className="bg-gray-800/50 p-3 rounded text-gray-300 overflow-x-auto">
                                {question.sampleOutput}
                              </pre>
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-300">No examples provided for this question.</div>
                        )}
                      </TabsContent>

                      <TabsContent value="submission" className="space-y-4 mt-4">
                        {hasSubmitted ? (
                          <div className="space-y-4">
                            <div className="flex items-center text-green-400 mb-4">
                              <CheckCircle className="h-5 w-5 mr-2" />
                              <span>You have already submitted an answer for this question.</span>
                            </div>

                            <div className="space-y-2">
                              <h4 className="text-white font-medium">Your Submission:</h4>
                              <pre className="bg-gray-800/50 p-3 rounded text-gray-300 overflow-x-auto whitespace-pre-wrap">
                                {submissions[question.id || '']?.submissionText}
                              </pre>
                            </div>

                            {submissions[question.id || '']?.codeUrl && (
                              <div className="space-y-2">
                                <h4 className="text-white font-medium">Code URL:</h4>
                                <a
                                  href={submissions[question.id || '']?.codeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-lightBlue hover:underline"
                                >
                                  {submissions[question.id || '']?.codeUrl}
                                </a>
                              </div>
                            )}

                            <div className="space-y-2">
                              <h4 className="text-white font-medium">Submission Status:</h4>
                              <div className={`flex items-center ${
                                submissions[question.id || '']?.status === 'reviewed'
                                  ? 'text-green-400'
                                  : submissions[question.id || '']?.status === 'rejected'
                                    ? 'text-red-400'
                                    : 'text-yellow-400'
                              }`}>
                                {submissions[question.id || '']?.status === 'reviewed' ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    <span>Reviewed</span>
                                  </>
                                ) : submissions[question.id || '']?.status === 'rejected' ? (
                                  <>
                                    <AlertTriangle className="h-4 w-4 mr-1" />
                                    <span>Rejected</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="h-4 w-4 mr-1" />
                                    <span>Pending Review</span>
                                  </>
                                )}
                              </div>
                            </div>

                            {submissions[question.id || '']?.score !== undefined && (
                              <div className="space-y-2">
                                <h4 className="text-white font-medium">Score:</h4>
                                <div className="text-lightBlue font-bold">
                                  {submissions[question.id || '']?.score} / {question.points}
                                </div>
                              </div>
                            )}

                            {submissions[question.id || '']?.feedback && (
                              <div className="space-y-2">
                                <h4 className="text-white font-medium">Feedback:</h4>
                                <div className="text-gray-300 whitespace-pre-line">
                                  {submissions[question.id || '']?.feedback}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor={`answer-${question.id}`} className="text-white">Your Answer</Label>
                              <Textarea
                                id={`answer-${question.id}`}
                                value={answers[question.id || ''] || ''}
                                onChange={(e) => setAnswers(prev => ({ ...prev, [question.id || '']: e.target.value }))}
                                placeholder="Enter your solution here..."
                                className="bg-darkBlue/50 border-gray-700 text-white min-h-[150px]"
                                disabled={isSubmitting}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`code-url-${question.id}`} className="text-white">Code URL (Optional)</Label>
                              <Input
                                id={`code-url-${question.id}`}
                                value={codeUrls[question.id || ''] || ''}
                                onChange={(e) => setCodeUrls(prev => ({ ...prev, [question.id || '']: e.target.value }))}
                                placeholder="GitHub or other code repository URL"
                                className="bg-darkBlue/50 border-gray-700 text-white"
                                disabled={isSubmitting}
                              />
                              <p className="text-xs text-gray-400">
                                If your solution is too complex to paste here, you can provide a link to a GitHub repository or other code sharing platform.
                              </p>
                            </div>

                            <Button
                              onClick={() => handleSubmit(question.id || '')}
                              className="bg-lightBlue hover:bg-lightBlue/80 text-white w-full"
                              disabled={isSubmitting || !answers[question.id || '']}
                            >
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Submitting...
                                </>
                              ) : (
                                <>
                                  <Send className="h-4 w-4 mr-2" />
                                  Submit Answer
                                </>
                              )}
                            </Button>

                            <div className="flex items-center text-yellow-400 text-sm mt-2">
                              <AlertTriangle className="h-4 w-4 mr-1 flex-shrink-0" />
                              <span>
                                You can only submit once. Make sure your answer is complete before submitting.
                              </span>
                            </div>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
