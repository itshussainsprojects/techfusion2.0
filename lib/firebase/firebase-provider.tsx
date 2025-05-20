// "use client"

// import type React from "react"

// import { createContext, useContext, useEffect, useState } from "react"
// import { initializeApp, getApps } from "firebase/app"
// import {
//   getAuth,
//   onAuthStateChanged,
//   signInWithPopup,
//   GoogleAuthProvider,
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   signOut as firebaseSignOut,
//   updateProfile,
//   type User,
// } from "firebase/auth"
// import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, getDoc } from "firebase/firestore"
// import { firebaseConfig } from "./firebase-config"

// // Firebase imports
// import { Timestamp } from "firebase/firestore"
// import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"

// // Initialize Firebase
// let app
// let auth: ReturnType<typeof getAuth>
// let db: ReturnType<typeof getFirestore>

// try {
//   if (!getApps().length) {
//     app = initializeApp(firebaseConfig)
//     auth = getAuth(app)
//     db = getFirestore(app)
//   } else {
//     app = getApps()[0]
//     auth = getAuth(app)
//     db = getFirestore(app)
//   }
// } catch (error) {
//   console.error("Firebase initialization error:", error)
//   // Don't throw here, let the app continue with null values
// }

// // Create context
// export type ParticipantData = {
//   id?: string
//   name: string
//   email: string
//   rollNumber: string
//   department: string
//   contest: string
//   timestamp?: Date
//   paymentStatus?: 'paid' | 'not paid' | 'partial'
// }

// type FirebaseContextType = {
//   user: User | null
//   loading: boolean
//   isAdmin: boolean
//   signInWithGoogle: () => Promise<any>
//   signInWithEmail: (email: string, password: string) => Promise<any>
//   registerWithEmail: (name: string, email: string, password: string) => Promise<any>
//   signOut: () => Promise<void>
//   registerParticipant: (data: ParticipantData) => Promise<string>
//   getParticipants: () => Promise<ParticipantData[]>
//   updateParticipant: (id: string, data: Partial<ParticipantData>) => Promise<void>
//   deleteParticipant: (id: string) => Promise<void>
//   checkIfRegistered: (email: string) => Promise<boolean>
//   getUserParticipation: (email: string) => Promise<ParticipantData | null>
// }

// // List of admin emails
// const ADMIN_EMAILS = ["admin@techfusion.com", "dev@example.com"]

// const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined)

// export const FirebaseProvider = ({ children }: { children: React.ReactNode }) => {
//   const [user, setUser] = useState<User | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [isAdmin, setIsAdmin] = useState(false)

//   // Update the useEffect for auth state
//   useEffect(() => {
//     if (!auth) {
//       setLoading(false)
//       return
//     }

//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       setUser(user)
//       setIsAdmin(user ? ADMIN_EMAILS.includes(user.email || "") : false)
//       setLoading(false)
//     })

//     return () => unsubscribe()
//   }, [])

//   const signInWithGoogle = async () => {
//     if (!auth) throw new Error("Firebase auth not initialized")

//     const provider = new GoogleAuthProvider()
//     try {
//       const result = await signInWithPopup(auth, provider)
//       return result
//     } catch (error: any) {
//       console.error("Error signing in with Google:", error)
//       throw error
//     }
//   }

//   const signInWithEmail = async (email: string, password: string) => {
//     if (!auth) throw new Error("Firebase auth not initialized")

//     try {
//       const result = await signInWithEmailAndPassword(auth, email, password)
//       return result
//     } catch (error: any) {
//       console.error("Error signing in with email:", error)
//       throw error
//     }
//   }

//   const registerWithEmail = async (name: string, email: string, password: string) => {
//     if (!auth) throw new Error("Firebase auth not initialized")

//     try {
//       const result = await createUserWithEmailAndPassword(auth, email, password)
//       if (auth.currentUser) {
//         await updateProfile(auth.currentUser, { displayName: name })
//       }
//       return result
//     } catch (error: any) {
//       console.error("Error registering with email:", error)
//       throw error
//     }
//   }

//   const signOut = async () => {
//     if (!auth) throw new Error("Firebase auth not initialized")

//     try {
//       await firebaseSignOut(auth)
//       setUser(null)
//       setIsAdmin(false)
//     } catch (error) {
//       console.error("Error signing out:", error)
//       throw error
//     }
//   }

//   const registerParticipant = async (data: ParticipantData) => {
//     if (!db) throw new Error("Firebase Firestore not initialized")
//     try {
//       const participantsRef = collection(db, "participants")
//       const docRef = await addDoc(participantsRef, {
//         ...data,
//         timestamp: Timestamp.fromDate(new Date()),
//       })
//       return docRef.id
//     } catch (error) {
//       console.error("Error registering participant:", error)
//       throw error
//     }
//   }

//   const getParticipants = async () => {
//     if (!db) throw new Error("Firebase Firestore not initialized")
//     try {
//       const participantsRef = collection(db, "participants")
//       const snapshot = await getDocs(participantsRef)
//       return snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//         timestamp: doc.data().timestamp?.toDate(),
//       })) as ParticipantData[]
//     } catch (error) {
//       console.error("Error getting participants:", error)
//       throw error
//     }
//   }

//   const updateParticipant = async (id: string, data: Partial<ParticipantData>) => {
//     if (!db) throw new Error("Firebase Firestore not initialized")
//     try {
//       const participantRef = doc(db, "participants", id)
//       await updateDoc(participantRef, {
//         ...data,
//         timestamp: Timestamp.fromDate(new Date()),
//         paymentStatus: data.paymentStatus,
//       })
//     } catch (error) {
//       console.error("Error updating participant:", error)
//       throw new Error("Error updating participant: " + (error as any)?.message)
//     }
//   }

//   const deleteParticipant = async (id: string) => {
//     if (!db) throw new Error("Firebase Firestore not initialized")

//     try {
//       const participantRef = doc(db, "participants", id)
//       await deleteDoc(participantRef)
//     } catch (error) {
//       console.error("Error deleting participant:", error)
//       throw error
//     }
//   }

//   const checkIfRegistered = async (email: string) => {
//     if (!db) throw new Error("Firebase Firestore not initialized")

//     try {
//       const participantsRef = collection(db, "participants")
//       const q = query(participantsRef, where("email", "==", email))
//       const snapshot = await getDocs(q)
//       return !snapshot.empty
//     } catch (error) {
//       console.error("Error checking registration:", error)
//       throw error
//     }
//   }

//   const getUserParticipation = async (email: string) => {
//     if (!db) throw new Error("Firebase Firestore not initialized")
//     try {
//       const participantsRef = collection(db, "participants")
//       const q = query(participantsRef, where("email", "==", email))
//       const snapshot = await getDocs(q)
//       if (snapshot.empty) return null
//       const doc = snapshot.docs[0]
//       const data = doc.data()
//       return {
//         id: doc.id,
//         name: data.name,
//         email: data.email,
//         rollNumber: data.rollNumber,
//         department: data.department,
//         contest: data.contest,
//         timestamp: data.timestamp?.toDate(),
//         paymentStatus: data.paymentStatus,
//       } as ParticipantData
//     } catch (error) {
//       console.error("Error getting user participation:", error)
//       throw error
//     }
//   }

//   const value = {
//     user,
//     loading,
//     isAdmin,
//     signInWithGoogle,
//     signInWithEmail,
//     registerWithEmail,
//     signOut,
//     registerParticipant,
//     getParticipants,
//     updateParticipant,
//     deleteParticipant,
//     checkIfRegistered,
//     getUserParticipation,
//   }

//   return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>
// }

// export const useFirebase = () => {
//   const context = useContext(FirebaseContext)
//   if (context === undefined) {
//     throw new Error("useFirebase must be used within a FirebaseProvider")
//   }
//   return context
// }
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

// Define PaymentData type
export type PaymentData = {
  id?: string
  userEmail: string
  userName: string
  userRollNumber: string
  participantId: string
  contestName: string
  amount: number
  paymentMethod: string
  status: 'pending' | 'verified' | 'rejected'
  screenshotUrl?: string
  timestamp?: Date
  rejectionReason?: string
}

// Define ParticipantData type
export type ParticipantData = {
  id?: string
  name: string
  email: string
  rollNumber: string
  department: string
  contest: string
  timestamp?: Date
  paymentStatus?: 'paid' | 'not paid' | 'partial'
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
  getPayments: () => Promise<PaymentData[]>
  getPaymentsByParticipantId: (participantId: string) => Promise<PaymentData[]>
  createPaymentRecord: (data: PaymentData) => Promise<string>
  updatePaymentStatus: (id: string, status: 'verified' | 'rejected' | 'pending', rejectionReason?: string) => Promise<void>
}

// List of admin emails
const ADMIN_EMAILS = ["admin@techfusion.com", "dev@example.com"]

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined)

export const FirebaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

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

      // Get the current participant data first
      const participantDoc = await getDoc(participantRef);
      if (!participantDoc.exists()) {
        throw new Error("Participant not found");
      }

      // Check if the current user is the owner of this participant record
      const participantData = participantDoc.data();
      const isOwner = user && user.email === participantData.email;

      // If updating payment status and user is the owner, only update that field
      if (data.paymentStatus && isOwner && !isAdmin) {
        console.log("User updating their own payment status to:", data.paymentStatus);
        await updateDoc(participantRef, {
          paymentStatus: data.paymentStatus,
          timestamp: Timestamp.fromDate(new Date())
        });
      }
      // If admin, update all provided fields
      else if (isAdmin) {
        console.log("Admin updating participant data:", data);
        await updateDoc(participantRef, {
          ...data,
          timestamp: Timestamp.fromDate(new Date())
        });
      }
      // Otherwise, throw permission error
      else {
        throw new Error("Permission denied: You can only update your own data");
      }
    } catch (error) {
      console.error("Error updating participant:", error);
      throw new Error("Error updating participant: " + (error as any)?.message);
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

  // Payment-related functions
  const getPayments = async () => {
    if (!db) throw new Error("Firebase Firestore not initialized")
    try {
      const paymentsRef = collection(db, "payments")
      const snapshot = await getDocs(paymentsRef)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      })) as PaymentData[]
    } catch (error) {
      console.error("Error getting payments:", error)
      throw error
    }
  }

  const getPaymentsByParticipantId = async (participantId: string) => {
    if (!db) throw new Error("Firebase Firestore not initialized")
    try {
      const paymentsRef = collection(db, "payments")
      const q = query(paymentsRef, where("participantId", "==", participantId))
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      })) as PaymentData[]
    } catch (error) {
      console.error("Error getting payments by participant ID:", error)
      // Return empty array instead of throwing error to prevent UI issues
      return []
    }
  }

  const createPaymentRecord = async (data: PaymentData) => {
    if (!db) throw new Error("Firebase Firestore not initialized")
    try {
      const paymentsRef = collection(db, "payments")
      const docRef = await addDoc(paymentsRef, {
        ...data,
        status: data.status || 'pending',
        timestamp: Timestamp.fromDate(new Date()),
      })
      return docRef.id
    } catch (error) {
      console.error("Error creating payment record:", error)
      throw error
    }
  }

  const updatePaymentStatus = async (id: string, status: 'verified' | 'rejected' | 'pending', rejectionReason?: string) => {
    if (!db) throw new Error("Firebase Firestore not initialized")
    try {
      // 1. Get the payment record
      const paymentRef = doc(db, "payments", id)
      const paymentDoc = await getDoc(paymentRef)

      if (!paymentDoc.exists()) {
        throw new Error("Payment record not found")
      }

      const paymentData = paymentDoc.data() as PaymentData

      // 2. Update the payment status
      await updateDoc(paymentRef, {
        status,
        rejectionReason: rejectionReason || null,
        timestamp: Timestamp.fromDate(new Date()),
      })

      // 3. Update the participant's payment status based on the payment status
      if (paymentData.participantId && isAdmin) {
        try {
          const participantRef = doc(db, "participants", paymentData.participantId)

          if (status === 'verified') {
            // If payment is verified, mark participant as paid
            await updateDoc(participantRef, {
              paymentStatus: 'paid',
              timestamp: Timestamp.fromDate(new Date()),
            })
            console.log("Updated participant status to PAID");
          } else if (status === 'rejected') {
            // If payment is rejected, mark participant as not paid
            await updateDoc(participantRef, {
              paymentStatus: 'not paid',
              timestamp: Timestamp.fromDate(new Date()),
            })
            console.log("Updated participant status to NOT PAID");
          }
        } catch (participantError) {
          console.error("Error updating participant status:", participantError);
          // Don't throw here, we still want to consider the payment update successful
          // even if the participant update fails
        }
      } else {
        console.log("Not updating participant status: either no participantId or not admin");
      }
    } catch (error) {
      console.error("Error updating payment status:", error)
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
    getPayments,
    getPaymentsByParticipantId,
    createPaymentRecord,
    updatePaymentStatus
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
