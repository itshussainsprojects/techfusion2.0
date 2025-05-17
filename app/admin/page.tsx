"use client"

import { useState, useEffect } from 'react'
import { useFirebase } from '@/lib/firebase/firebase-provider'
import { UserManagement } from './components/user-management'
import { Button } from '@/components/ui/button'

export default function AdminPage() {
  const { user, signOut, getParticipants, updateParticipant, deleteParticipant } = useFirebase()
  const [activeTab, setActiveTab] = useState('users')
  const [participants, setParticipants] = useState<ParticipantData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadParticipants()
    }
  }, [user])

  const loadParticipants = async () => {
    try {
      const data = await getParticipants()
      setParticipants(data)
    } catch (error) {
      console.error('Error loading participants:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async (id: string, data: Partial<ParticipantData>) => {
    try {
      await updateParticipant(id, data)
      await loadParticipants()
    } catch (error) {
      console.error('Error updating participant:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteParticipant(id)
      await loadParticipants()
    } catch (error) {
      console.error('Error deleting participant:', error)
    }
  }

  if (!user) {
    return <div>Please sign in to access the admin panel.</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <Button onClick={signOut} variant="outline">
          Sign Out
        </Button>
      </div>
      <UserManagement
        participants={participants}
        isLoading={isLoading}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  )
}
