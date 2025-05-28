"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Users } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export interface TeamMember {
  name: string
  email: string
  rollNumber: string
  department: string
  role?: string
}

interface TeamRegistrationProps {
  contestId: string
  teamMembers: TeamMember[]
  onTeamMembersChange: (members: TeamMember[]) => void
  maxTeamSize: number
  minTeamSize: number
  isTeamRequired: boolean
}

// Contest team size configurations
const CONTEST_TEAM_CONFIGS = {
  "robo-war": { min: 2, max: 3, required: true },
  "e-sports": { min: 1, max: 5, required: false }, // Individual & Team Events
  "in-it-to-win-it": { min: 3, max: 5, required: true },
  "speed-coding-with-ai": { min: 1, max: 2, required: false },
  "treasure-hunt": { min: 3, max: 5, required: true },
  "60-second-video": { min: 1, max: 2, required: false },
  // Events that don't require teams
  "eye-sight-camp": { min: 1, max: 1, required: false },
  "women-engineering-seminar": { min: 1, max: 1, required: false },
  "ai-seminar": { min: 1, max: 1, required: false },
  "suffiyana": { min: 1, max: 1, required: false },
}

export function TeamRegistration({
  contestId,
  teamMembers,
  onTeamMembersChange,
  maxTeamSize,
  minTeamSize,
  isTeamRequired
}: TeamRegistrationProps) {
  const [newMember, setNewMember] = useState<TeamMember>({
    name: "",
    email: "",
    rollNumber: "",
    department: "",
    role: ""
  })

  const config = CONTEST_TEAM_CONFIGS[contestId as keyof typeof CONTEST_TEAM_CONFIGS] ||
    { min: minTeamSize, max: maxTeamSize, required: isTeamRequired }

  const addTeamMember = () => {
    if (teamMembers.length >= config.max) return

    if (!newMember.name || !newMember.email || !newMember.rollNumber || !newMember.department) {
      return
    }

    const updatedMembers = [...teamMembers, { ...newMember }]
    onTeamMembersChange(updatedMembers)

    // Reset form
    setNewMember({
      name: "",
      email: "",
      rollNumber: "",
      department: "",
      role: ""
    })
  }

  const removeTeamMember = (index: number) => {
    const updatedMembers = teamMembers.filter((_, i) => i !== index)
    onTeamMembersChange(updatedMembers)
  }

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    const updatedMembers = teamMembers.map((member, i) =>
      i === index ? { ...member, [field]: value } : member
    )
    onTeamMembersChange(updatedMembers)
  }

  // Don't show team registration for individual events
  if (config.max === 1 && !config.required) {
    return null
  }

  return (
    <Card className="glassmorphism border-lightBlue/20 mt-4">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Users className="h-5 w-5 mr-2 text-lightBlue" />
          Team Registration
          <span className="ml-2 text-sm text-gray-400">
            ({config.min}-{config.max} members)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-300 mb-4">
          {config.required ? (
            <p>This contest requires a team of {config.min}-{config.max} members. Add your team members below:</p>
          ) : (
            <p>You can participate individually or with a team (up to {config.max} members):</p>
          )}
        </div>

        {/* Current Team Members */}
        <AnimatePresence>
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 border border-gray-700 rounded-lg bg-darkBlue/30"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium">Team Member {index + 1}</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="hover:bg-red-500/20 border-red-500/50"
                  onClick={() => removeTeamMember(index)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-gray-300 text-xs">Name</Label>
                  <Input
                    value={member.name}
                    onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                    className="bg-darkBlue/50 border-gray-700 text-white"
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <Label className="text-gray-300 text-xs">Email</Label>
                  <Input
                    type="email"
                    value={member.email}
                    onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                    className="bg-darkBlue/50 border-gray-700 text-white"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label className="text-gray-300 text-xs">Roll Number</Label>
                  <Input
                    value={member.rollNumber}
                    onChange={(e) => updateTeamMember(index, 'rollNumber', e.target.value)}
                    className="bg-darkBlue/50 border-gray-700 text-white"
                    placeholder="Roll Number"
                  />
                </div>
                <div>
                  <Label className="text-gray-300 text-xs">Department</Label>
                  <Input
                    value={member.department}
                    onChange={(e) => updateTeamMember(index, 'department', e.target.value)}
                    className="bg-darkBlue/50 border-gray-700 text-white"
                    placeholder="Department"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add New Member Form */}
        {teamMembers.length < config.max && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 border border-dashed border-gray-600 rounded-lg"
          >
            <h4 className="text-white font-medium mb-3 flex items-center">
              <Plus className="h-4 w-4 mr-2 text-lightBlue" />
              Add Team Member
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <Label className="text-gray-300 text-xs">Name</Label>
                <Input
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="bg-darkBlue/50 border-gray-700 text-white"
                  placeholder="Full Name"
                />
              </div>
              <div>
                <Label className="text-gray-300 text-xs">Email</Label>
                <Input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  className="bg-darkBlue/50 border-gray-700 text-white"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <Label className="text-gray-300 text-xs">Roll Number</Label>
                <Input
                  value={newMember.rollNumber}
                  onChange={(e) => setNewMember({ ...newMember, rollNumber: e.target.value })}
                  className="bg-darkBlue/50 border-gray-700 text-white"
                  placeholder="Roll Number"
                />
              </div>
              <div>
                <Label className="text-gray-300 text-xs">Department</Label>
                <Input
                  value={newMember.department}
                  onChange={(e) => setNewMember({ ...newMember, department: e.target.value })}
                  className="bg-darkBlue/50 border-gray-700 text-white"
                  placeholder="Department"
                />
              </div>
            </div>

            <Button
              type="button"
              onClick={addTeamMember}
              className="bg-lightBlue hover:bg-lightBlue/80 text-white"
              disabled={!newMember.name || !newMember.email || !newMember.rollNumber || !newMember.department}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </motion.div>
        )}

        {/* Team Status */}
        <div className="text-sm text-gray-400">
          Current team size: {teamMembers.length + 1} (including you)
          {config.required && teamMembers.length + 1 < config.min && (
            <span className="text-yellow-400 ml-2">
              • Need at least {config.min - (teamMembers.length + 1)} more member(s)
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export { CONTEST_TEAM_CONFIGS }
