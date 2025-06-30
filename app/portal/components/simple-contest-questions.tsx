"use client"

import React, { useState, useEffect } from "react"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { type ContestQuestion, type QuestionSubmission } from "@/lib/types/question"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Clock, CheckCircle, AlertTriangle, Send, Info, Star, MessageSquare } from "lucide-react" // Added Info, Star, MessageSquare
import { format, formatDistance } from "date-fns"
import { toast } from "sonner"
import { ParticipantData } from "@/lib/firebase/firebase-provider"

interface SimpleContestQuestionsProps {
  contestType: 'speed-coding-with-ai' | 'devathon'
  participant: ParticipantData
}

export function SimpleContestQuestions({ contestType, participant }: SimpleContestQuestionsProps) {
  const { getActiveQuestions, submitAnswer, getSubmissions } = useFirebase()

  const [questions, setQuestions] = useState<ContestQuestion[]>([])
  const [mySubmissions, setMySubmissions] = useState<Record<string, QuestionSubmission | null>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({})
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [codeUrls, setCodeUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    // Ensure participant.id is available for fetching submissions
    if (participant?.id) {
      loadQuestionsAndSubmissions()
    } else if (participant) { // If participant exists but no ID, means data might be incomplete from prop
      console.warn("Participant data is missing ID, cannot load submissions yet.", participant);
      // Fallback to loading just questions if ID is missing, though submissions won't load
      loadQuestionsOnly();
    }
  }, [contestType, participant?.id]) // Depend on participant.id

  const loadQuestionsOnly = async () => { // In case participant ID isn't ready
    setLoading(true);
    try {
      const qs = await getActiveQuestions(contestType);
      setQuestions(qs);
    } catch (error) {
      console.error("Error loading questions:", error);
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  }

  const loadQuestionsAndSubmissions = async () => {
    if (!participant?.id) {
      console.error("Participant ID is undefined, cannot load submissions.");
      loadQuestionsOnly(); // Load only questions if participant ID is missing
      return;
    }
    setLoading(true)
    try {
      const activeQuestions = await getActiveQuestions(contestType)
      setQuestions(activeQuestions)

      const submissionsMap: Record<string, QuestionSubmission | null> = {}
      for (const q of activeQuestions) {
        if (q.id) {
          // participant.id should be the Firestore document ID of the participant
          const submissionsArray = await getSubmissions(q.id, participant.id)
          if (submissionsArray.length > 0) {
            submissionsMap[q.id] = submissionsArray[0] // Assuming one submission per question
          } else {
            submissionsMap[q.id] = null
          }
        }
      }
      setMySubmissions(submissionsMap)
    } catch (error) {
      console.error("Error loading questions or submissions:", error)
      toast.error("Failed to load questions or your submissions.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (questionId: string) => {
    // participant.email is used by submitAnswer, which internally resolves it to participant ID
    if (!participant?.email || !participant?.id) {
      toast.error("User data incomplete. Cannot submit.")
      return
    }

    try {
      setSubmitting(prev => ({ ...prev, [questionId]: true }))

      await submitAnswer({
        questionId,
        participantId: participant.email,
        submissionText: answers[questionId] || '',
        codeUrl: codeUrls[questionId] || '',
        submittedAt: new Date(),
        status: 'pending'
      })

      toast.success("Answer submitted successfully")

      // Clear the answer and code URL
      setAnswers(prev => ({ ...prev, [questionId]: '' }))
      setCodeUrls(prev => ({ ...prev, [questionId]: '' }))

      // Reload questions and submissions
      if (participant?.id) {
        await loadQuestionsAndSubmissions()
      } else {
        await loadQuestionsOnly();
      }
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
              No questions are currently active for this contest. Please check back later.
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
            Complete the following active questions for this contest
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {questions.map((question) => {
              const currentSubmission = mySubmissions[question.id || ''];
              const isSubmittingThis = submitting[question.id || ''] || false;
              const hasSubmitted = !!currentSubmission;

              return (
                <Card key={question.id} className="border border-gray-700 bg-darkBlue/30">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-bold text-white">
                          {question.title}
                        </CardTitle>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(question.difficulty)}`}>
                            {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                          </span>
                          <span className="text-xs px-2 py-1 rounded bg-lightBlue/20 text-lightBlue">
                            {question.points} points
                          </span>
                          {hasSubmitted && currentSubmission?.status && (
                            <span className={`text-xs px-2 py-1 rounded capitalize
                              ${currentSubmission.status === 'pending' ? 'bg-yellow-500/30 text-yellow-300' :
                                currentSubmission.status === 'reviewed' ? 'bg-blue-500/30 text-blue-300' :
                                currentSubmission.status === 'rejected' ? 'bg-red-500/30 text-red-300' :
                                'bg-gray-500/30 text-gray-300' // Default or other statuses
                              }`}
                            >
                              {currentSubmission.status}
                            </span>
                          )}
                        </div>
                      </div>
                      {hasSubmitted && typeof currentSubmission?.score === 'number' && (
                        <div className="text-right">
                           <p className="text-sm text-gray-400">Score</p>
                           <p className="text-2xl font-bold text-green-400">{currentSubmission.score}</p>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <Tabs defaultValue="description" className="w-full">
                      <TabsList className="grid w-full grid-cols-3 bg-darkBlue/50 p-1.5 gap-2">
                        <TabsTrigger value="description" className="text-white data-[state=active]:bg-lightBlue/20 data-[state=active]:text-white">Desc.</TabsTrigger>
                        <TabsTrigger value="examples" className="text-white data-[state=active]:bg-lightBlue/20 data-[state=active]:text-white">Examples</TabsTrigger>
                        <TabsTrigger value="submission" className="text-white data-[state=active]:bg-lightBlue/20 data-[state=active]:text-white">
                          {hasSubmitted ? "View" : "Submit"}
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="description" className="space-y-4 mt-4 prose prose-sm prose-invert max-w-none">
                        <div className="text-gray-300 whitespace-pre-line">{question.description}</div>
                        {question.constraints && (<><h4>Constraints:</h4><div className="text-gray-300 whitespace-pre-line">{question.constraints}</div></>)}
                        {Array.isArray(question.hints) && question.hints.length > 0 && (<><h4>Hints:</h4><ul className="list-disc pl-5 space-y-1">{question.hints.map((hint, index) => (<li key={index} className="text-gray-300">{hint}</li>))}</ul></>)}
                      </TabsContent>

                      <TabsContent value="examples" className="space-y-4 mt-4">
                        {question.sampleInput && question.sampleOutput ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><h4>Sample Input:</h4><pre className="bg-gray-800/50 p-3 rounded text-gray-300 overflow-x-auto">{question.sampleInput}</pre></div>
                            <div><h4>Sample Output:</h4><pre className="bg-gray-800/50 p-3 rounded text-gray-300 overflow-x-auto">{question.sampleOutput}</pre></div>
                          </div>
                        ) : (<div className="text-gray-300">No examples provided.</div>)}
                      </TabsContent>

                      <TabsContent value="submission" className="space-y-4 mt-4">
                        {hasSubmitted && currentSubmission ? (
                          <div className="space-y-4 p-4 bg-darkBlue/40 rounded-md border border-gray-700">
                            <div>
                              <Label className="text-gray-400 text-xs">Your Submission:</Label>
                              <Textarea
                                readOnly
                                value={currentSubmission.submissionText}
                                className="mt-1 bg-darkBlue/50 border-gray-600 text-gray-200 min-h-[100px]"
                              />
                            </div>
                            {currentSubmission.codeUrl && (
                              <div>
                                <Label className="text-gray-400 text-xs">Submitted Code URL:</Label>
                                <p><a href={currentSubmission.codeUrl} target="_blank" rel="noopener noreferrer" className="text-lightBlue hover:underline break-all">{currentSubmission.codeUrl}</a></p>
                              </div>
                            )}
                            <div className="border-t border-gray-700 pt-3 mt-3">
                              <Label className="text-gray-400 text-xs">Status:</Label>
                              <p className="capitalize font-medium">{currentSubmission.status}</p>
                            </div>
                            {typeof currentSubmission.score === 'number' && (
                              <div>
                                <Label className="text-gray-400 text-xs">Score:</Label>
                                <p className="font-bold text-green-400 text-lg">{currentSubmission.score} / {question.points}</p>
                              </div>
                            )}
                            {currentSubmission.feedback && (
                              <div>
                                <Label className="text-gray-400 text-xs">Admin Feedback:</Label>
                                <div className="mt-1 p-3 bg-gray-800/50 rounded text-gray-300 whitespace-pre-line border border-gray-600">
                                  {currentSubmission.feedback}
                                </div>
                              </div>
                            )}
                             <p className="text-xs text-gray-500 mt-2">Submitted at: {formatDateTime(currentSubmission.submittedAt)}</p>
                          </div>
                        ) : (
                          // Submission Form
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor={`answer-${question.id}`} className="text-white">Your Answer</Label>
                              <Textarea id={`answer-${question.id}`} value={answers[question.id || ''] || ''} onChange={(e) => setAnswers(prev => ({ ...prev, [question.id || '']: e.target.value }))} placeholder="Enter your solution here..." className="bg-darkBlue/50 border-gray-700 text-white min-h-[150px]" disabled={isSubmittingThis} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`code-url-${question.id}`} className="text-white">Code URL (Optional)</Label>
                              <Input id={`code-url-${question.id}`} value={codeUrls[question.id || ''] || ''} onChange={(e) => setCodeUrls(prev => ({ ...prev, [question.id || '']: e.target.value }))} placeholder="GitHub or other code repository URL" className="bg-darkBlue/50 border-gray-700 text-white" disabled={isSubmittingThis} />
                              <p className="text-xs text-gray-400">If your solution is too complex, provide a link to your code.</p>
                            </div>
                            <Button onClick={() => handleSubmit(question.id || '')} className="bg-lightBlue hover:bg-lightBlue/80 text-white w-full" disabled={isSubmittingThis || !answers[question.id || '']}>
                              {isSubmittingThis ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</>) : (<><Send className="h-4 w-4 mr-2" />Submit Answer</>)}
                            </Button>
                            <div className="flex items-center text-yellow-400 text-sm mt-2"><AlertTriangle className="h-4 w-4 mr-1 flex-shrink-0" /><span>You can only submit once.</span></div>
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
