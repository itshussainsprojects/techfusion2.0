
"use client"

import React, { useState } from "react"
import { Loader2, Trash2, Edit, AlertCircle, CheckCircle, XCircle, Clock, Users, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ParticipantData } from "@/lib/firebase/firebase-provider"

interface UserManagementProps {
  participants: ParticipantData[]
  isLoading: boolean
  onUpdate: (id: string, data: Partial<ParticipantData>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function UserManagement({ participants, isLoading, onUpdate, onDelete }: UserManagementProps) {
  const [editingParticipant, setEditingParticipant] = useState<ParticipantData | null>(null)
  const [editingPaymentStatus, setEditingPaymentStatus] = useState<'not paid' | 'paid' | 'partial'>('not paid')
  const [editingApprovalStatus, setEditingApprovalStatus] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [editingRejectionReason, setEditingRejectionReason] = useState<string>('')
  const [editingRollNumber, setEditingRollNumber] = useState<string>('')
  const [editingName, setEditingName] = useState<string>('')
  const [editingEmail, setEditingEmail] = useState<string>('')
  const [editingDepartment, setEditingDepartment] = useState<string>('')
  const [editingCnic, setEditingCnic] = useState<string>('')
  const [editingContest, setEditingContest] = useState<string>('')
  const [editingContests, setEditingContests] = useState<string[]>([])
  const [editingContestsData, setEditingContestsData] = useState<Record<string, any>>({})
  const [selectedContestForEdit, setSelectedContestForEdit] = useState<string>('')
  const [selectedContestPaymentStatus, setSelectedContestPaymentStatus] = useState<'not paid' | 'paid' | 'partial'>('not paid')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const [participantToDelete, setParticipantToDelete] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')


  const handleEdit = (participant: ParticipantData) => {
    setEditingParticipant(participant)
    setEditingPaymentStatus(participant.paymentStatus || 'not paid')
    setEditingApprovalStatus(participant.approvalStatus || 'pending')
    setEditingRejectionReason(participant.rejectionReason || '')
    setEditingRollNumber(participant.rollNumber || '')
    setEditingName(participant.name || '')
    setEditingEmail(participant.email || '')
    setEditingDepartment(participant.department || '')
    setEditingCnic(participant.cnic || '')
    setEditingContest(participant.contest || '')
    setEditingContests(participant.contests || [])
    setEditingContestsData(participant.contestsData || {})

    // Set the first contest as the selected contest for editing
    if (participant.contests && participant.contests.length > 0) {
      const firstContest = participant.contests[0];
      setSelectedContestForEdit(firstContest);

      // Set the payment status for this contest
      const contestStatus = participant.contestsData && participant.contestsData[firstContest]
        ? participant.contestsData[firstContest].paymentStatus
        : 'not paid';
      setSelectedContestPaymentStatus(contestStatus as 'not paid' | 'paid' | 'partial');
    } else if (participant.contest) {
      setSelectedContestForEdit(participant.contest);

      // Set the payment status for this contest
      const contestStatus = participant.contestsData && participant.contestsData[participant.contest]
        ? participant.contestsData[participant.contest].paymentStatus
        : 'not paid';
      setSelectedContestPaymentStatus(contestStatus as 'not paid' | 'paid' | 'partial');
    }
  }

  const handleUpdate = async () => {
    if (!editingParticipant || !editingParticipant.id) return
    try {
      await onUpdate(editingParticipant.id, {
        name: editingName,
        email: editingEmail,
        rollNumber: editingRollNumber,
        department: editingDepartment,
        cnic: editingCnic,
        contest: editingContest,
        contests: editingContests,
        contestsData: editingContestsData,
        paymentStatus: editingPaymentStatus,
        approvalStatus: editingApprovalStatus,
        rejectionReason: editingApprovalStatus === 'rejected' ? editingRejectionReason : '',
      })
      setEditingParticipant(null)
      setEditingPaymentStatus('not paid')
      setEditingApprovalStatus('pending')
      setEditingRejectionReason('')
      setEditingRollNumber('')
      setEditingName('')
      setEditingEmail('')
      setEditingDepartment('')
      setEditingCnic('')
      setEditingContest('')
      setEditingContests([])
      setEditingContestsData({})
    } catch (error) {
      console.error("Error updating participant:", error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await onDelete(id); // This calls the delete function from AdminPage
    } catch (error) {
      console.error("Error deleting participant:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-lightBlue" />
      </div>
    )
  }

  if (participants.length === 0) {
    return <div className="text-center py-8 text-gray-300">No participants registered yet.</div>
  }

  return (
    <div className="space-y-6">
      <Card className="glassmorphism border-lightBlue/20">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl font-bold text-white">
            User Management
            {participants.filter(p => (p.approvalStatus || 'pending') === 'pending').length > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-500">
                {participants.filter(p => (p.approvalStatus || 'pending') === 'pending').length} pending
              </span>
            )}
          </CardTitle>
          <CardDescription className="text-gray-300">
            Manage participant registrations and payment status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-end">
            <div className="w-64">
              <Label htmlFor="statusFilter" className="text-white mb-2 block">Filter by Status</Label>
              <Select
                value={statusFilter}
                onValueChange={(value: 'all' | 'pending' | 'approved' | 'rejected') => setStatusFilter(value)}
              >
                <SelectTrigger className="bg-darkBlue/50 border-gray-700 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-darkBlue border-gray-700">
                  <SelectItem value="all">All Registrations</SelectItem>
                  <SelectItem value="pending">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                      <span>Pending Approval</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="approved">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      <span>Approved</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="rejected">
                    <div className="flex items-center">
                      <XCircle className="h-4 w-4 mr-2 text-red-500" />
                      <span>Rejected</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-300">Name</TableHead>
                  <TableHead className="text-gray-300">Email</TableHead>
                  <TableHead className="text-gray-300">Roll Number</TableHead>
                  <TableHead className="text-gray-300">Department</TableHead>
                  <TableHead className="text-gray-300">CNIC</TableHead>
                  <TableHead className="text-gray-300">Contest</TableHead>
                  <TableHead className="text-gray-300">Team Members</TableHead>
                  <TableHead className="text-gray-300">Payment Status</TableHead>
                  <TableHead className="text-gray-300">Approval Status</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants
                  .filter(participant => {
                    if (statusFilter === 'all') return true;
                    const participantStatus = participant.approvalStatus || 'pending';
                    return participantStatus === statusFilter;
                  })
                  .sort((a, b) => {
                    // Sort by approval status: pending first, then approved, then rejected
                    const statusOrder = { pending: 0, approved: 1, rejected: 2 };
                    const aStatus = a.approvalStatus || 'pending';
                    const bStatus = b.approvalStatus || 'pending';
                    return (statusOrder[aStatus as keyof typeof statusOrder] || 0) - (statusOrder[bStatus as keyof typeof statusOrder] || 0);
                  })
                  .map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell className="text-white">{participant.name}</TableCell>
                    <TableCell className="text-white">{participant.email}</TableCell>
                    <TableCell className="text-white">{participant.rollNumber}</TableCell>
                    <TableCell className="text-white">{participant.department}</TableCell>
                    <TableCell className="text-white">
                      {participant.cnic ? (
                        <span className="text-white">{participant.cnic}</span>
                      ) : (
                        <span className="text-gray-400 text-sm">Not provided</span>
                      )}
                    </TableCell>
                    <TableCell className="text-white">
                      {participant.contests && participant.contests.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {participant.contests.map(contest => (
                            <span key={contest} className="px-2 py-0.5 bg-darkBlue/50 rounded text-xs">
                              {contest.replace(/-/g, ' ')}
                            </span>
                          ))}
                        </div>
                      ) : (
                        participant.contest
                      )}
                    </TableCell>
                    <TableCell className="text-white">
                      {participant.teamMembers && Object.keys(participant.teamMembers).length > 0 ? (
                        <div className="space-y-2">
                          {Object.entries(participant.teamMembers).map(([contestId, members]) => (
                            <div key={contestId} className="text-xs">
                              <div className="flex items-center gap-1 text-lightBlue font-medium">
                                <Users className="h-3 w-3" />
                                {contestId.replace(/-/g, ' ')} ({members.length + 1} members)
                              </div>
                              <div className="ml-4 space-y-1 mt-1">
                                <div className="flex items-center gap-1 text-green-400">
                                  <User className="h-3 w-3" />
                                  {participant.name} (Team Leader)
                                </div>
                                {members.map((member, index) => (
                                  <div key={index} className="flex items-center gap-1 text-gray-300">
                                    <User className="h-3 w-3" />
                                    {member.name} ({member.rollNumber})
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                          <User className="h-3 w-3" />
                          Individual
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {participant.paymentStatus === 'paid' ? (
                        <span className="flex items-center gap-2 text-green-500">
                          <CheckCircle className="h-4 w-4" />
                          Paid
                        </span>
                      ) : participant.paymentStatus === 'partial' ? (
                        <span className="flex items-center gap-2 text-yellow-500">
                          <AlertCircle className="h-4 w-4" />
                          Partial
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 text-red-500">
                          <XCircle className="h-4 w-4" />
                          Not Paid
                        </span>
                      )}

                      {/* Show individual contest payment statuses if available */}
                      {participant.contestsData && Object.keys(participant.contestsData).length > 0 && (
                        <div className="mt-1 text-xs space-y-1">
                          {Object.entries(participant.contestsData).map(([contestId, data]) => (
                            <div key={contestId} className="flex justify-between">
                              <span className="text-gray-400">{contestId.replace(/-/g, ' ')}:</span>
                              <span className={
                                data.paymentStatus === 'paid' ? 'text-green-500' :
                                data.paymentStatus === 'partial' ? 'text-yellow-500' :
                                'text-red-500'
                              }>
                                {data.paymentStatus === 'paid' ? 'Paid' :
                                 data.paymentStatus === 'partial' ? 'Partial' :
                                 'Not Paid'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {participant.approvalStatus === 'approved' ? (
                        <span className="flex items-center gap-2 text-green-500">
                          <CheckCircle className="h-4 w-4" />
                          Approved
                        </span>
                      ) : participant.approvalStatus === 'rejected' ? (
                        <span className="flex items-center gap-2 text-red-500">
                          <XCircle className="h-4 w-4" />
                          Rejected
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 text-yellow-500">
                          <Clock className="h-4 w-4" />
                          Pending
                        </span>
                      )}

                      {participant.rejectionReason && (
                        <div className="mt-1 text-xs text-red-400">
                          Reason: {participant.rejectionReason}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="hover:bg-lightBlue/20"
                              onClick={() => handleEdit(participant)}
                            >
                              <Edit className="h-4 w-4 text-lightBlue" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-darkBlue border-lightBlue/20 max-h-[80vh] overflow-y-auto max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-white">Edit Participant</DialogTitle>
                              <DialogDescription className="text-gray-400">
                                Update participant information below.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="name" className="text-white">Name</Label>
                                  <Input
                                    id="name"
                                    value={editingName || ''}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    className="bg-darkBlue/50 border-gray-700 text-white"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="email" className="text-white">Email</Label>
                                  <Input
                                    id="email"
                                    value={editingEmail || ''}
                                    onChange={(e) => setEditingEmail(e.target.value)}
                                    className="bg-darkBlue/50 border-gray-700 text-white"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="rollNumber" className="text-white">Roll Number</Label>
                                  <Input
                                    id="rollNumber"
                                    value={editingRollNumber || ''}
                                    onChange={(e) => setEditingRollNumber(e.target.value)}
                                    className="bg-darkBlue/50 border-gray-700 text-white"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="department" className="text-white">Department</Label>
                                  <Input
                                    id="department"
                                    value={editingDepartment || ''}
                                    onChange={(e) => setEditingDepartment(e.target.value)}
                                    className="bg-darkBlue/50 border-gray-700 text-white"
                                  />
                                </div>
                              </div>

                              {/* CNIC field - shown for all participants but especially important for Suffiyana */}
                              <div className="space-y-2">
                                <Label htmlFor="cnic" className="text-white">
                                  CNIC (Pakistani National ID)
                                  {editingContests && editingContests.includes('suffiyana') && (
                                    <span className="text-red-400 ml-1">*</span>
                                  )}
                                </Label>
                                <Input
                                  id="cnic"
                                  value={editingCnic || ''}
                                  onChange={(e) => setEditingCnic(e.target.value)}
                                  placeholder="12345-1234567-1"
                                  className="bg-darkBlue/50 border-gray-700 text-white"
                                />
                                {editingContests && editingContests.includes('suffiyana') && (
                                  <p className="text-xs text-yellow-400">
                                    CNIC is required for Suffiyana 2.0 registration
                                  </p>
                                )}
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="contest" className="text-white">Contest</Label>
                                <Select
                                  value={editingContest || ''}
                                  onValueChange={(value) => setEditingContest(value)}
                                >
                                  <SelectTrigger className="bg-darkBlue/50 border-gray-700 text-white">
                                    <SelectValue placeholder="Select a contest" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-darkBlue border-gray-700">
                                    <SelectItem value="coding">Coding Competition</SelectItem>
                                    <SelectItem value="quiz">Tech Quiz</SelectItem>
                                    <SelectItem value="project">Project Showcase</SelectItem>
                                    <SelectItem value="gaming">Gaming Tournament</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="paymentStatus" className="text-white">Overall Payment Status</Label>
                                    <Select
                                      value={editingPaymentStatus || 'not paid'}
                                      onValueChange={(value: 'not paid' | 'paid' | 'partial') => setEditingPaymentStatus(value)}
                                    >
                                      <SelectTrigger className="bg-darkBlue/50 border-gray-700 text-white">
                                        <SelectValue placeholder="Select status" />
                                      </SelectTrigger>
                                      <SelectContent className="bg-darkBlue border-gray-700">
                                        <SelectItem value="not paid">Not Paid</SelectItem>
                                        <SelectItem value="partial">Partial</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="approvalStatus" className="text-white">Approval Status</Label>
                                    <Select
                                      value={editingApprovalStatus}
                                      onValueChange={(value: 'pending' | 'approved' | 'rejected') => setEditingApprovalStatus(value)}
                                    >
                                      <SelectTrigger className="bg-darkBlue/50 border-gray-700 text-white">
                                        <SelectValue placeholder="Select status" />
                                      </SelectTrigger>
                                      <SelectContent className="bg-darkBlue border-gray-700">
                                        <SelectItem value="pending">
                                          <div className="flex items-center">
                                            <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                                            <span>Pending</span>
                                          </div>
                                        </SelectItem>
                                        <SelectItem value="approved">
                                          <div className="flex items-center">
                                            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                            <span>Approved</span>
                                          </div>
                                        </SelectItem>
                                        <SelectItem value="rejected">
                                          <div className="flex items-center">
                                            <XCircle className="h-4 w-4 mr-2 text-red-500" />
                                            <span>Rejected</span>
                                          </div>
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                {editingApprovalStatus === 'rejected' && (
                                  <div className="space-y-2 border-t border-gray-700 pt-4 mt-2">
                                    <Label htmlFor="rejectionReason" className="text-white">Rejection Reason</Label>
                                    <Textarea
                                      id="rejectionReason"
                                      value={editingRejectionReason}
                                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditingRejectionReason(e.target.value)}
                                      placeholder="Provide a reason for rejection"
                                      className="bg-darkBlue/50 border-gray-700 text-white min-h-[80px]"
                                    />
                                  </div>
                                )}

                                {editingContests && editingContests.length > 0 && (
                                  <div className="border-t border-gray-700 pt-4 mt-4">
                                    <Label className="text-white mb-2 block">Contest-Specific Payment Status</Label>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label className="text-gray-400 text-sm">Select Contest</Label>
                                        <Select
                                          value={selectedContestForEdit}
                                          onValueChange={(value) => {
                                            setSelectedContestForEdit(value);
                                            // Update the payment status for the selected contest
                                            const contestStatus = editingContestsData && editingContestsData[value]
                                              ? editingContestsData[value].paymentStatus
                                              : 'not paid';
                                            setSelectedContestPaymentStatus(contestStatus as 'not paid' | 'paid' | 'partial');
                                          }}
                                        >
                                          <SelectTrigger className="bg-darkBlue/50 border-gray-700 text-white">
                                            <SelectValue placeholder="Select a contest" />
                                          </SelectTrigger>
                                          <SelectContent className="bg-darkBlue border-gray-700">
                                            {editingContests.map(contest => (
                                              <SelectItem key={contest} value={contest}>
                                                {contest.replace(/-/g, ' ')}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      {selectedContestForEdit && (
                                        <div className="space-y-2">
                                          <Label className="text-gray-400 text-sm">Status for {selectedContestForEdit.replace(/-/g, ' ')}</Label>
                                          <Select
                                            value={selectedContestPaymentStatus}
                                            onValueChange={(value: 'not paid' | 'paid' | 'partial') => {
                                              setSelectedContestPaymentStatus(value);

                                              // Update the contestsData with the new payment status
                                              const updatedContestsData = { ...editingContestsData };
                                              if (!updatedContestsData[selectedContestForEdit]) {
                                                updatedContestsData[selectedContestForEdit] = {
                                                  contestName: selectedContestForEdit,
                                                  registrationDate: new Date()
                                                };
                                              }

                                              updatedContestsData[selectedContestForEdit] = {
                                                ...updatedContestsData[selectedContestForEdit],
                                                paymentStatus: value
                                              };

                                              setEditingContestsData(updatedContestsData);

                                              // Calculate the overall payment status
                                              let overallStatus = 'not paid';
                                              const allPaid = editingContests.every(contest =>
                                                updatedContestsData[contest]?.paymentStatus === 'paid'
                                              );

                                              const anyPartial = editingContests.some(contest =>
                                                updatedContestsData[contest]?.paymentStatus === 'partial' ||
                                                updatedContestsData[contest]?.paymentStatus === 'paid'
                                              );

                                              if (allPaid) {
                                                overallStatus = 'paid';
                                              } else if (anyPartial) {
                                                overallStatus = 'partial';
                                              }

                                              setEditingPaymentStatus(overallStatus as 'not paid' | 'paid' | 'partial');
                                            }}
                                          >
                                            <SelectTrigger className="bg-darkBlue/50 border-gray-700 text-white">
                                              <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-darkBlue border-gray-700">
                                              <SelectItem value="not paid">Not Paid</SelectItem>
                                              <SelectItem value="partial">Partial</SelectItem>
                                              <SelectItem value="paid">Paid</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Team Members Section */}
                              {editingParticipant?.teamMembers && Object.keys(editingParticipant.teamMembers).length > 0 && (
                                <div className="border-t border-gray-700 pt-4 mt-4">
                                  <Label className="text-white mb-3 block">Team Members</Label>
                                  <div className="space-y-4">
                                    {Object.entries(editingParticipant.teamMembers).map(([contestId, members]) => (
                                      <div key={contestId} className="bg-darkBlue/30 p-4 rounded-lg">
                                        <div className="flex items-center gap-2 mb-3">
                                          <Users className="h-4 w-4 text-lightBlue" />
                                          <h4 className="text-lightBlue font-medium">
                                            {contestId.replace(/-/g, ' ')} Team ({members.length + 1} members)
                                          </h4>
                                        </div>

                                        {/* Team Leader */}
                                        <div className="mb-3 p-3 bg-green-500/10 border border-green-500/20 rounded">
                                          <div className="flex items-center gap-2 mb-2">
                                            <User className="h-4 w-4 text-green-400" />
                                            <span className="text-green-400 font-medium">Team Leader</span>
                                          </div>
                                          <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                              <span className="text-gray-400">Name:</span>
                                              <span className="text-white ml-2">{editingParticipant.name}</span>
                                            </div>
                                            <div>
                                              <span className="text-gray-400">Roll:</span>
                                              <span className="text-white ml-2">{editingParticipant.rollNumber}</span>
                                            </div>
                                            <div>
                                              <span className="text-gray-400">Email:</span>
                                              <span className="text-white ml-2">{editingParticipant.email}</span>
                                            </div>
                                            <div>
                                              <span className="text-gray-400">Dept:</span>
                                              <span className="text-white ml-2">{editingParticipant.department}</span>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Team Members */}
                                        {members.length > 0 && (
                                          <div className="space-y-2">
                                            <h5 className="text-gray-300 font-medium">Team Members:</h5>
                                            {members.map((member, index) => (
                                              <div key={index} className="p-3 bg-darkBlue/50 border border-gray-700 rounded">
                                                <div className="flex items-center gap-2 mb-2">
                                                  <User className="h-4 w-4 text-gray-400" />
                                                  <span className="text-gray-300">Member {index + 1}</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                  <div>
                                                    <span className="text-gray-400">Name:</span>
                                                    <span className="text-white ml-2">{member.name}</span>
                                                  </div>
                                                  <div>
                                                    <span className="text-gray-400">Roll:</span>
                                                    <span className="text-white ml-2">{member.rollNumber}</span>
                                                  </div>
                                                  <div>
                                                    <span className="text-gray-400">Email:</span>
                                                    <span className="text-white ml-2">{member.email}</span>
                                                  </div>
                                                  <div>
                                                    <span className="text-gray-400">Dept:</span>
                                                    <span className="text-white ml-2">{member.department}</span>
                                                  </div>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <DialogFooter className="sticky bottom-0 bg-darkBlue py-3 border-t border-gray-700 mt-4">
                              <div className="flex justify-end gap-2 w-full">
                                <Button
                                  variant="outline"
                                  onClick={() => setEditingParticipant(null)}
                                  className="border-gray-700 text-white hover:bg-gray-700"
                                >
                                  Cancel
                                </Button>
                                <Button onClick={handleUpdate} className="bg-lightBlue hover:bg-lightBlue/80 text-white">
                                  Save Changes
                                </Button>
                              </div>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Dialog open={deleteDialogOpen && participantToDelete === participant.id} onOpenChange={(open) => {
                          if (!open) {
                            setDeleteDialogOpen(false);
                            setParticipantToDelete(null);
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="hover:bg-red-500/20"
                              onClick={() => {
                                setParticipantToDelete(participant.id ?? null);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-darkBlue border-lightBlue/20 max-w-md">
                            <DialogHeader>
                              <DialogTitle className="text-white">Confirm Deletion</DialogTitle>
                              <DialogDescription className="text-gray-400">
                                Are you sure you want to delete this participant? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="sticky bottom-0 bg-darkBlue py-3 border-t border-gray-700 mt-4">
                              <div className="flex justify-end gap-2 w-full">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setDeleteDialogOpen(false);
                                    setParticipantToDelete(null);
                                  }}
                                  className="border-gray-700 text-white hover:bg-gray-700"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => {
                                    if (participant.id) {
                                      console.log("Deleting participant with ID:", participant.id);
                                      handleDelete(participant.id);
                                      setDeleteDialogOpen(false);
                                      setParticipantToDelete(null);
                                    } else {
                                      console.error("Cannot delete participant: ID is undefined");
                                    }
                                  }}
                                  className="bg-red-500 hover:bg-red-600 text-white"
                                >
                                  Delete
                                </Button>
                              </div>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
