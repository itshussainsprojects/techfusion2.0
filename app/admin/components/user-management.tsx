"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Loader2, Trash2, Edit, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ParticipantData } from "@/lib/firebase/firebase-provider"

interface UserManagementProps {
  participants: ParticipantData[]
  isLoading: boolean
  onUpdate: (id: string, data: Partial<ParticipantData>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const CONTEST_PRICES = {
  hackathon: 1000,
  robotics: 800,
  gaming: 500,
  "ai-challenge": 900,
  "startup-pitch": 700,
  coding: 500,
  quiz: 300,
  project: 1000,
}

export function UserManagement({ participants, isLoading, onUpdate, onDelete }: UserManagementProps) {
  const [editingParticipant, setEditingParticipant] = useState<ParticipantData | null>(null)
  const [editingPaymentStatus, setEditingPaymentStatus] = useState<string | null>(null)
  const [editingRollNumber, setEditingRollNumber] = useState<string | null>(null)
  const [editingName, setEditingName] = useState<string | null>(null)
  const [editingEmail, setEditingEmail] = useState<string | null>(null)
  const [editingDepartment, setEditingDepartment] = useState<string | null>(null)
  const [editingContest, setEditingContest] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

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
      setEditingPaymentStatus(null)
      setEditingRollNumber(null)
      setEditingName(null)
      setEditingEmail(null)
      setEditingDepartment(null)
      setEditingContest(null)
    } catch (error) {
      console.error("Error updating participant:", error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await onDelete(id)
      setDeleteConfirmId(null)
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
              <TableCell className="text-white">{participant.paymentStatus || 'not paid'}</TableCell>
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
                      <div className="space-y-4 py-4">
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
                          <Input
                            id="contest"
                            value={editingContest || ''}
                            onChange={(e) => setEditingContest(e.target.value)}
                            className="bg-darkBlue/50 border-gray-700 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="paymentStatus" className="text-white">Payment Status</Label>
                          <Select
                            value={editingPaymentStatus || 'not paid'}
                            onValueChange={setEditingPaymentStatus}
                          >
                            <SelectTrigger className="bg-darkBlue/50 border-gray-700 text-white">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent className="bg-darkBlue border-gray-700">
                              <SelectItem value="not paid">Not Paid</SelectItem>
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

                  <Dialog open={deleteConfirmId === participant.id} onOpenChange={() => setDeleteConfirmId(null)}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="hover:bg-red-500/20"
                        onClick={() => setDeleteConfirmId(participant.id ?? null)}
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
                          onClick={() => setDeleteConfirmId(null)}
                          className="border-gray-700 text-white hover:bg-gray-700"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => participant.id && handleDelete(participant.id)}
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
  )
}