"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import type { QuestionSubmission, ContestQuestion } from "@/lib/types/question"
import type { ParticipantData } from "@/lib/firebase/firebase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Eye, Edit3, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

export default function SubmissionManagement() {
  const { getSubmissions, updateSubmission, getParticipants, getQuestions } = useFirebase()

  const [submissions, setSubmissions] = useState<QuestionSubmission[]>([])
  const [participants, setParticipants] = useState<ParticipantData[]>([])
  const [questions, setQuestions] = useState<ContestQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<QuestionSubmission | null>(null)
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false)

  // Form state for updating submission
  const [editStatus, setEditStatus] = useState<QuestionSubmission['status']>('pending')
  const [editScore, setEditScore] = useState<number | string>('')
  const [editFeedback, setEditFeedback] = useState('')

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      const [submissionsData, participantsData, questionsData] = await Promise.all([
        getSubmissions(),
        getParticipants(),
        getQuestions() // Fetch all questions to map question titles
      ])
      setSubmissions(submissionsData.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()))
      setParticipants(participantsData)
      setQuestions(questionsData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Failed to load submission data.")
    } finally {
      setLoading(false)
    }
  }

  const participantMap = useMemo(() => {
    return participants.reduce((acc, p) => {
      if (p.id) acc[p.id] = p // Key by participant document ID
      return acc
    }, {} as Record<string, ParticipantData>)
  }, [participants])

  const questionMap = useMemo(() => {
    return questions.reduce((acc, q) => {
      if (q.id) acc[q.id] = q
      return acc
    }, {} as Record<string, ContestQuestion>)
  }, [questions])

  const handleViewSubmission = (submission: QuestionSubmission) => {
    setSelectedSubmission(submission)
    setEditStatus(submission.status)
    setEditScore(submission.score === undefined ? '' : submission.score)
    setEditFeedback(submission.feedback || '')
  }

  const handleUpdateSubmission = async () => {
    if (!selectedSubmission || !selectedSubmission.id) return

    setIsSubmittingUpdate(true)
    try {
      const updatedData: Partial<QuestionSubmission> = {
        status: editStatus,
        score: editScore === '' ? undefined : Number(editScore),
        feedback: editFeedback,
      }
      await updateSubmission(selectedSubmission.id, updatedData)
      toast.success("Submission updated successfully.")
      setSelectedSubmission(null) // Close dialog
      loadInitialData() // Refresh data
    } catch (error) {
      console.error("Error updating submission:", error)
      toast.error("Failed to update submission.")
    } finally {
      setIsSubmittingUpdate(false)
    }
  }

  const formatDateTime = (date: Date | string) => {
    if (!date) return 'N/A'
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return format(dateObj, 'MMM dd, yyyy HH:mm')
  }
  
  const getStatusColor = (status: QuestionSubmission['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-500';
      case 'reviewed': return 'text-blue-500';
      case 'rejected': return 'text-red-500';
      // Add 'accepted' or 'graded' if you expand statuses
      default: return 'text-gray-500';
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-lightBlue" />
      </div>
    )
  }

  return (
    <Card className="mt-6 glassmorphism border-lightBlue/20">
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl font-bold text-white">Contest Submissions</CardTitle>
        <CardDescription className="text-gray-300">
          View and manage participant submissions for contests.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {submissions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
            <p>No submissions found yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-white">Participant</TableHead>
                  <TableHead className="text-white">Contest</TableHead>
                  <TableHead className="text-white">Question</TableHead>
                  <TableHead className="text-white">Submitted At</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => {
                  const participant = participantMap[submission.participantId]
                  const question = questionMap[submission.questionId]
                  return (
                    <TableRow key={submission.id}>
                      <TableCell className="text-gray-300">
                        {participant ? `${participant.name} (${participant.rollNumber || 'N/A'})` : `ID: ${submission.participantId}`}
                      </TableCell>
                      <TableCell className="text-gray-300 capitalize">{question?.contestType?.replace(/-/g, ' ') || 'N/A'}</TableCell>
                      <TableCell className="text-gray-300">{question?.title || 'Unknown Question'}</TableCell>
                      <TableCell className="text-gray-300">{formatDateTime(submission.submittedAt)}</TableCell>
                      <TableCell className={`font-medium ${getStatusColor(submission.status)}`}>
                        {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => handleViewSubmission(submission)} className="text-lightBlue border-lightBlue/50 hover:bg-lightBlue/10 hover:text-lightBlue">
                              <Eye className="h-4 w-4 mr-1" /> View / Edit
                            </Button>
                          </DialogTrigger>
                          {selectedSubmission && selectedSubmission.id === submission.id && (
                            <DialogContent className="sm:max-w-[600px] bg-darkBlue border-lightBlue/30 text-white">
                              <DialogHeader>
                                <DialogTitle className="text-lightBlue">Submission Details</DialogTitle>
                                <DialogDescription className="text-gray-400">
                                  Review and update the submission. Participant: {participantMap[selectedSubmission.participantId]?.name || `ID: ${selectedSubmission.participantId}`}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
                                <div>
                                  <strong>Question:</strong> {questionMap[selectedSubmission.questionId]?.title || 'N/A'}
                                </div>
                                <div>
                                  <strong>Submitted At:</strong> {formatDateTime(selectedSubmission.submittedAt)}
                                </div>
                                <div>
                                  <strong>Answer:</strong>
                                  <Textarea
                                    readOnly
                                    value={selectedSubmission.submissionText}
                                    className="mt-1 bg-darkBlue/50 border-gray-700 min-h-[100px]"
                                  />
                                </div>
                                {selectedSubmission.codeUrl && (
                                  <div>
                                    <strong>Code URL:</strong> <a href={selectedSubmission.codeUrl} target="_blank" rel="noopener noreferrer" className="text-lightBlue hover:underline">{selectedSubmission.codeUrl}</a>
                                  </div>
                                )}
                                <div className="space-y-2">
                                  <Label htmlFor="status" className="text-white">Status</Label>
                                  <Select value={editStatus} onValueChange={(value) => setEditStatus(value as QuestionSubmission['status'])}>
                                    <SelectTrigger className="w-full bg-darkBlue/50 border-gray-700 text-white">
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-darkBlue border-lightBlue/50 text-white">
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="reviewed">Reviewed</SelectItem>
                                      <SelectItem value="rejected">Rejected</SelectItem>
                                      {/* Add more statuses like 'accepted', 'graded' if needed */}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="score" className="text-white">Score (Optional)</Label>
                                  <Input
                                    id="score"
                                    type="number"
                                    value={editScore}
                                    onChange={(e) => setEditScore(e.target.value)}
                                    placeholder="Enter score"
                                    className="bg-darkBlue/50 border-gray-700 text-white"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="feedback" className="text-white">Feedback (Optional)</Label>
                                  <Textarea
                                    id="feedback"
                                    value={editFeedback}
                                    onChange={(e) => setEditFeedback(e.target.value)}
                                    placeholder="Provide feedback to the participant"
                                    className="bg-darkBlue/50 border-gray-700 text-white min-h-[80px]"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button variant="outline" className="text-gray-300 border-gray-600 hover:bg-gray-700">Cancel</Button>
                                </DialogClose>
                                <Button onClick={handleUpdateSubmission} disabled={isSubmittingUpdate} className="bg-lightBlue hover:bg-lightBlue/80 text-white">
                                  {isSubmittingUpdate ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Edit3 className="h-4 w-4 mr-2" />}
                                  Update Submission
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          )}
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}