"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { initializeApp, getApps } from "firebase/app"
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth"
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, getDoc } from "firebase/firestore"
import { firebaseConfig } from "./firebase-config"

// Firebase imports
import { Timestamp } from "firebase/firestore"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"

// Initialize Firebase
let app
let auth: ReturnType<typeof getAuth>
let db: ReturnType<typeof getFirestore>

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
  } else {
    app = getApps()[0]
    auth = getAuth(app)
    db = getFirestore(app)
  }
} catch (error) {
  console.error("Firebase initialization error:", error)
  // Don't throw here, let the app continue with null values
}

// Create context
export type ParticipantData = {
  id?: string
  name: string
  email: string
  rollNumber: string
  department: string
  contest: string
  timestamp?: Date
  paymentStatus?: 'paid' | 'not paid'
}

type FirebaseContextType = {
  user: User | null
  loading: boolean
  isAdmin: boolean
  signInWithGoogle: () => Promise<any>
  signInWithEmail: (email: string, password: string) => Promise<any>
  registerWithEmail: (name: string, email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  registerParticipant: (data: ParticipantData) => Promise<string>
  getParticipants: () => Promise<ParticipantData[]>
  updateParticipant: (id: string, data: Partial<ParticipantData>) => Promise<void>
  deleteParticipant: (id: string) => Promise<void>
  checkIfRegistered: (email: string) => Promise<boolean>
  getUserParticipation: (email: string) => Promise<ParticipantData | null>
}

// List of admin emails
const ADMIN_EMAILS = ["admin@techfusion.com", "dev@example.com"]

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined)

export const FirebaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  // Update the useEffect for auth state
  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setIsAdmin(user ? ADMIN_EMAILS.includes(user.email || "") : false)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    if (!auth) throw new Error("Firebase auth not initialized")

    const provider = new GoogleAuthProvider()
    try {
      const result = await signInWithPopup(auth, provider)
      return result
    } catch (error: any) {
      console.error("Error signing in with Google:", error)
      throw error
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase auth not initialized")

    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      return result
    } catch (error: any) {
      console.error("Error signing in with email:", error)
      throw error
    }
  }

  const registerWithEmail = async (name: string, email: string, password: string) => {
    if (!auth) throw new Error("Firebase auth not initialized")

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name })
      }
      return result
    } catch (error: any) {
      console.error("Error registering with email:", error)
      throw error
    }
  }

  const signOut = async () => {
    if (!auth) throw new Error("Firebase auth not initialized")

    try {
      await firebaseSignOut(auth)
      setUser(null)
      setIsAdmin(false)
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  const registerParticipant = async (data: ParticipantData) => {
    if (!db) throw new Error("Firebase Firestore not initialized")
    try {
      const participantsRef = collection(db, "participants")
      const docRef = await addDoc(participantsRef, {
        ...data,
        timestamp: Timestamp.fromDate(new Date()),
      })
      return docRef.id
    } catch (error) {
      console.error("Error registering participant:", error)
      throw error
    }
  }

  const getParticipants = async () => {
    if (!db) throw new Error("Firebase Firestore not initialized")
    try {
      const participantsRef = collection(db, "participants")
      const snapshot = await getDocs(participantsRef)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      })) as ParticipantData[]
    } catch (error) {
      console.error("Error getting participants:", error)
      throw error
    }
  }

  const updateParticipant = async (id: string, data: Partial<ParticipantData>) => {
    if (!db) throw new Error("Firebase Firestore not initialized")
    try {
      const participantRef = doc(db, "participants", id)
      await updateDoc(participantRef, {
        ...data,
        timestamp: Timestamp.fromDate(new Date()),
        paymentStatus: data.paymentStatus,
      })
    } catch (error) {
      console.error("Error updating participant:", error)
      throw new Error("Error updating participant: " + (error as any)?.message)
    }
  }

  const deleteParticipant = async (id: string) => {
    if (!db) throw new Error("Firebase Firestore not initialized")

    try {
      const participantRef = doc(db, "participants", id)
      await deleteDoc(participantRef)
    } catch (error) {
      console.error("Error deleting participant:", error)
      throw error
    }
  }

  const checkIfRegistered = async (email: string) => {
    if (!db) throw new Error("Firebase Firestore not initialized")

    try {
      const participantsRef = collection(db, "participants")
      const q = query(participantsRef, where("email", "==", email))
      const snapshot = await getDocs(q)
      return !snapshot.empty
    } catch (error) {
      console.error("Error checking registration:", error)
      throw error
    }
  }

  const getUserParticipation = async (email: string) => {
    if (!db) throw new Error("Firebase Firestore not initialized")
    try {
      const participantsRef = collection(db, "participants")
      const q = query(participantsRef, where("email", "==", email))
      const snapshot = await getDocs(q)
      if (snapshot.empty) return null
      const doc = snapshot.docs[0]
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name,
        email: data.email,
        rollNumber: data.rollNumber,
        department: data.department,
        contest: data.contest,
        timestamp: data.timestamp?.toDate(),
        paymentStatus: data.paymentStatus,
      } as ParticipantData
    } catch (error) {
      console.error("Error getting user participation:", error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    isAdmin,
    signInWithGoogle,
    signInWithEmail,
    registerWithEmail,
    signOut,
    registerParticipant,
    getParticipants,
    updateParticipant,
    deleteParticipant,
    checkIfRegistered,
    getUserParticipation,
  }

  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>
}

export const useFirebase = () => {
  const context = useContext(FirebaseContext)
  if (context === undefined) {
    throw new Error("useFirebase must be used within a FirebaseProvider")
  }
  return context
}
