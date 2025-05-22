// "use client"

// import { useState, useEffect } from 'react'
// import { useFirebase } from '@/lib/firebase/firebase-provider'
// import { UserManagement } from './components/user-management'
// import { Button } from '@/components/ui/button'
// import { ParticipantData } from '@/lib/firebase/firebase-provider' // Ensure correct import

// export default function AdminPage() {
//   const { user, signOut, getParticipants, updateParticipant, deleteParticipant } = useFirebase()
//   const [activeTab, setActiveTab] = useState<'users' | 'settings'>('users') // Type for activeTab
//   const [participants, setParticipants] = useState<ParticipantData[]>([])
//   const [isLoading, setIsLoading] = useState(true)

//   useEffect(() => {
//     if (user) {
//       loadParticipants()
//     }
//   }, [user])

//   const loadParticipants = async () => {
//     try {
//       const data = await getParticipants()
//       setParticipants(data)
//     } catch (error) {
//       console.error('Error loading participants:', error)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleUpdate = async (id: string, data: Partial<ParticipantData>) => {
//     try {
//       await updateParticipant(id, data)
//       await loadParticipants() // Refresh participant list after update
//     } catch (error) {
//       console.error('Error updating participant:', error)
//     }
//   }

//   const handleDelete = async (id: string) => {
//     try {
//       await deleteParticipant(id)
//       await loadParticipants() // Refresh participant list after deletion
//     } catch (error) {
//       console.error('Error deleting participant:', error)
//     }
//   }

//   if (!user) {
//     return <div>Please sign in to access the admin panel.</div>
//   }

//   return (
//     <div className="container mx-auto py-8">
//       <div className="flex justify-between items-center mb-8">
//         <h1 className="text-3xl font-bold">Admin Panel</h1>
//         <Button onClick={signOut} variant="outline">
//           Sign Out
//         </Button>
//       </div>
//       <UserManagement
//         participants={participants}
//         isLoading={isLoading}
//         onUpdate={handleUpdate}
//         onDelete={handleDelete}
//       />
//     </div>
//   )
// }
"use client"

import { useState, useEffect } from 'react'
import { useFirebase } from '@/lib/firebase/firebase-provider'
import { UserManagement } from './components/user-management'
import { PaymentManagement } from './components/payment-management'
import { QuestionManagement } from './components/question-management'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ParticipantData } from '@/lib/firebase/firebase-provider' // Ensure correct import

export default function AdminPage() {
  const { user, signOut, getParticipants, updateParticipant, deleteParticipant } = useFirebase()
  const [activeTab, setActiveTab] = useState<'users' | 'payments' | 'questions'>('users') // Type for activeTab
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
      await loadParticipants() // Refresh participant list after update
    } catch (error) {
      console.error('Error updating participant:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteParticipant(id) // Calls the delete function from firebase-provider.tsx
      await loadParticipants() // Refresh participant list after deletion
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

      <Tabs defaultValue="users" className="mb-8">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
          <TabsTrigger value="users" onClick={() => setActiveTab('users')}>User Management</TabsTrigger>
          <TabsTrigger value="payments" onClick={() => setActiveTab('payments')}>Payment Management</TabsTrigger>
          <TabsTrigger value="questions" onClick={() => setActiveTab('questions')}>Contest Questions</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <UserManagement
            participants={participants}
            isLoading={isLoading}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          <PaymentManagement />
        </TabsContent>

        <TabsContent value="questions" className="mt-6">
          <QuestionManagement isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
