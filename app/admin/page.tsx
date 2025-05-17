"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ParticipantsTable } from "./components/participants-table"
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
import { Loader2, Trash2, Edit, Lock, AlertCircle } from "lucide-react"
import type { ParticipantData } from "@/lib/firebase/firebase-provider"

export default function AdminPage() {
  const router = useRouter()
  const { user, loading, getParticipants, updateParticipant, deleteParticipant, signInWithEmail } = useFirebase()

  const [participants, setParticipants] = useState<ParticipantData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminCredentials, setAdminCredentials] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [editingParticipant, setEditingParticipant] = useState<ParticipantData | null>(null)

  // Admin email for production
  const ADMIN_EMAIL = "admin@techfusion.com"

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/admin")
    } else if (user && user.email === ADMIN_EMAIL) {
      setIsAdmin(true)
    }
  }, [loading, user, router])

  useEffect(() => {
    if (isAdmin) {
      fetchParticipants()
    }
  }, [isAdmin])

  const fetchParticipants = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getParticipants()
      setParticipants(data)
    } catch (error: any) {
      console.error("Error fetching participants:", error)
      setError("Failed to fetch participants. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await signInWithEmail(adminCredentials.email, adminCredentials.password)
      if (adminCredentials.email === ADMIN_EMAIL) {
        setIsAdmin(true)
      } else {
        setError("Unauthorized access. Only admin can access this panel.")
      }
    } catch (error: any) {
      console.error("Admin login error:", error)
      setError("Invalid credentials. Please try again.")
    }
  }

  const handleEdit = async (participant: ParticipantData) => {
    setError(null)
    try {
      setEditingParticipant(participant)
    } catch (error: any) {
      console.error("Error editing participant:", error)
      setError("Failed to edit participant. Please try again.")
    }
  }

  const handleUpdate = async (id: string, data: Partial<ParticipantData>) => {
    setError(null)
    try {
      await updateParticipant(id, data)
      await fetchParticipants() // Refresh the list
      setEditingParticipant(null)
    } catch (error: any) {
      console.error("Error updating participant:", error)
      setError("Failed to update participant. Please try again.")
    }
  }

  const handleDelete = async (id: string) => {
    setError(null)
    try {
      await deleteParticipant(id)
      await fetchParticipants() // Refresh the list
    } catch (error: any) {
      console.error("Error deleting participant:", error)
      setError("Failed to delete participant. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-darkBlue">
        <Loader2 className="h-8 w-8 animate-spin text-lightBlue" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-20 pb-10 flex items-center justify-center bg-darkBlue">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto"
          >
            <Card className="glassmorphism border-lightBlue/20">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center text-white">Admin Access</CardTitle>
                <CardDescription className="text-center text-gray-300">
                  Enter admin credentials to continue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-2 rounded-md flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">
                      Email
                    </Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        value={adminCredentials.email}
                        onChange={(e) => setAdminCredentials({ ...adminCredentials, email: e.target.value })}
                        className="bg-darkBlue/50 border-gray-700 text-white"
                        placeholder="admin@techfusion.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        value={adminCredentials.password}
                        onChange={(e) => setAdminCredentials({ ...adminCredentials, password: e.target.value })}
                        className="bg-darkBlue/50 border-gray-700 text-white pl-10"
                        placeholder="Enter admin password"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-lightBlue hover:bg-lightBlue/80 text-white">
                    Access Admin Panel
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-10 bg-darkBlue">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="glassmorphism border-lightBlue/20">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">Admin Dashboard</CardTitle>
              <CardDescription className="text-gray-300">
                Manage registered participants for Tech Fusion 2.0
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-2 rounded-md flex items-center mb-4">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {error}
                </div>
              )}

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-lightBlue" />
                </div>
              ) : (
                <ParticipantsTable
                  participants={participants}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                />
              )}

              <div className="mt-6 flex justify-end">
                <Button onClick={fetchParticipants} className="bg-lightBlue hover:bg-lightBlue/80 text-white">
                  Refresh Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
