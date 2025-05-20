
"use client"

import { useState } from "react"
import { Loader2, Trash2, Edit, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  const [editingRollNumber, setEditingRollNumber] = useState<string>('')
  const [editingName, setEditingName] = useState<string>('')
  const [editingEmail, setEditingEmail] = useState<string>('')
  const [editingDepartment, setEditingDepartment] = useState<string>('')
  const [editingContest, setEditingContest] = useState<string>('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const [participantToDelete, setParticipantToDelete] = useState<string | null>(null)


  const handleEdit = (participant: ParticipantData) => {
    setEditingParticipant(participant)
    setEditingPaymentStatus(participant.paymentStatus || 'not paid')
    setEditingRollNumber(participant.rollNumber || '')
    setEditingName(participant.name || '')
    setEditingEmail(participant.email || '')
    setEditingDepartment(participant.department || '')
    setEditingContest(participant.contest || '')
  }

  const handleUpdate = async () => {
    if (!editingParticipant || !editingParticipant.id) return
    try {
      await onUpdate(editingParticipant.id, {
        name: editingName,
        email: editingEmail,
        rollNumber: editingRollNumber,
        department: editingDepartment,
        contest: editingContest,
        paymentStatus: editingPaymentStatus,
      })
      setEditingParticipant(null)
      setEditingPaymentStatus('not paid')
      setEditingRollNumber('')
      setEditingName('')
      setEditingEmail('')
      setEditingDepartment('')
      setEditingContest('')
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
          <CardTitle className="text-xl md:text-2xl font-bold text-white">User Management</CardTitle>
          <CardDescription className="text-gray-300">
            Manage participant registrations and payment status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-300">Name</TableHead>
                  <TableHead className="text-gray-300">Email</TableHead>
                  <TableHead className="text-gray-300">Roll Number</TableHead>
                  <TableHead className="text-gray-300">Department</TableHead>
                  <TableHead className="text-gray-300">Contest</TableHead>
                  <TableHead className="text-gray-300">Payment Status</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell className="text-white">{participant.name}</TableCell>
                    <TableCell className="text-white">{participant.email}</TableCell>
                    <TableCell className="text-white">{participant.rollNumber}</TableCell>
                    <TableCell className="text-white">{participant.department}</TableCell>
                    <TableCell className="text-white">{participant.contest}</TableCell>
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
                          <DialogContent className="bg-darkBlue border-lightBlue/20">
                            <DialogHeader>
                              <DialogTitle className="text-white">Edit Participant</DialogTitle>
                              <DialogDescription className="text-gray-400">
                                Update participant information below.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
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
                              <div className="space-y-2">
                                <Label htmlFor="paymentStatus" className="text-white">Payment Status</Label>
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
                            </div>
                            <DialogFooter>
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
                          <DialogContent className="bg-darkBlue border-lightBlue/20">
                            <DialogHeader>
                              <DialogTitle className="text-white">Confirm Deletion</DialogTitle>
                              <DialogDescription className="text-gray-400">
                                Are you sure you want to delete this participant? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
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
