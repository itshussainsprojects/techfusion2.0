"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Edit, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import type { ParticipantData } from "@/lib/firebase/firebase-provider"

interface ParticipantsTableProps {
  participants: ParticipantData[]
  onEdit: (participant: ParticipantData) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, data: Partial<ParticipantData>) => Promise<void>
}

export function ParticipantsTable({ participants, onEdit, onDelete, onUpdate }: ParticipantsTableProps) {
  const [editingParticipant, setEditingParticipant] = useState<ParticipantData | null>(null)

  const handleUpdate = async () => {
    if (!editingParticipant || !editingParticipant.id) return
    try {
      await onUpdate(editingParticipant.id, {
        name: editingParticipant.name,
        rollNumber: editingParticipant.rollNumber,
        department: editingParticipant.department,
        contest: editingParticipant.contest,
      })
      setEditingParticipant(null)
    } catch (error) {
      console.error('Error updating participant:', error)
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-white">Name</TableHead>
            <TableHead className="text-white">Email</TableHead>
            <TableHead className="text-white">Roll Number</TableHead>
            <TableHead className="text-white">Department</TableHead>
            <TableHead className="text-white">Contest</TableHead>
            <TableHead className="text-white text-right">Actions</TableHead>
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
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingParticipant(participant)}
                    className="text-white hover:text-lightBlue"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => participant.id && onDelete(participant.id)}
                    className="text-white hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!editingParticipant} onOpenChange={() => setEditingParticipant(null)}>
        <DialogContent className="bg-darkBlue border-lightBlue/20">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Participant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Name</Label>
              <Input
                id="name"
                value={editingParticipant?.name || ''}
                onChange={(e) => setEditingParticipant(prev => prev ? {...prev, name: e.target.value} : null)}
                className="bg-darkBlue/50 border-gray-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rollNumber" className="text-white">Roll Number</Label>
              <Input
                id="rollNumber"
                value={editingParticipant?.rollNumber || ''}
                onChange={(e) => setEditingParticipant(prev => prev ? {...prev, rollNumber: e.target.value} : null)}
                className="bg-darkBlue/50 border-gray-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department" className="text-white">Department</Label>
              <Input
                id="department"
                value={editingParticipant?.department || ''}
                onChange={(e) => setEditingParticipant(prev => prev ? {...prev, department: e.target.value} : null)}
                className="bg-darkBlue/50 border-gray-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contest" className="text-white">Contest</Label>
              <Select
                value={editingParticipant?.contest || ''}
                onValueChange={(value) => setEditingParticipant(prev => prev ? {...prev, contest: value} : null)}
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
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingParticipant(null)}
              className="border-gray-700 text-white hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              className="bg-lightBlue hover:bg-lightBlue/80 text-white"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}