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
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, getDoc, orderBy, limit } from "firebase/firestore"
import { ContestQuestion, QuestionSubmission } from "@/lib/types/question"
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

// Define ContestRegistration type for individual contest data
export type ContestRegistration = {
  contestName: string
  paymentStatus?: 'paid' | 'not paid' | 'partial'
  registrationDate?: Date
  teamMembers?: string[]
}

// Define ParticipantData type
export type ParticipantData = {
  id?: string
  name: string
  email: string
  rollNumber: string
  department: string
  // For backward compatibility
  contest?: string
  // New fields for multi-contest support
  contests: string[]
  contestsData: Record<string, ContestRegistration>
  timestamp?: Date
  // Overall payment status (derived from individual contest statuses)
  paymentStatus?: 'paid' | 'not paid' | 'partial'
  // Admin approval status
  approvalStatus?: 'pending' | 'approved' | 'rejected'
  rejectionReason?: string
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
  // Contest questions management
  createQuestion: (data: ContestQuestion) => Promise<string>
  getQuestions: (contestType?: string) => Promise<ContestQuestion[]>
  getActiveQuestions: (contestType: string) => Promise<ContestQuestion[]>
  updateQuestion: (id: string, data: Partial<ContestQuestion>) => Promise<void>
  deleteQuestion: (id: string) => Promise<void>
  // Question submissions
  submitAnswer: (data: QuestionSubmission) => Promise<string>
  getSubmissions: (questionId?: string, participantId?: string) => Promise<QuestionSubmission[]>
  updateSubmission: (id: string, data: Partial<QuestionSubmission>) => Promise<void>
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
      // Ensure contests array and contestsData exist
      const participantData = {
        ...data,
        contests: data.contests || [data.contest || ""],
        contestsData: data.contestsData || {},
        timestamp: Timestamp.fromDate(new Date()),
        // Set approval status to pending by default
        approvalStatus: data.approvalStatus || 'pending',
      };

      // If we have a single contest but no contests array, convert it
      if (data.contest && (!data.contests || data.contests.length === 0)) {
        participantData.contests = [data.contest];

        // Create contestsData if it doesn't exist
        if (!participantData.contestsData[data.contest]) {
          participantData.contestsData[data.contest] = {
            contestName: data.contest,
            paymentStatus: data.paymentStatus || 'not paid',
            registrationDate: new Date()
          };
        }
      }

      // Set overall payment status based on individual contest statuses
      if (!participantData.paymentStatus) {
        const statuses = Object.values(participantData.contestsData).map(c => c.paymentStatus);

        if (statuses.every(s => s === 'paid')) {
          participantData.paymentStatus = 'paid';
        } else if (statuses.some(s => s === 'partial')) {
          participantData.paymentStatus = 'partial';
        } else {
          participantData.paymentStatus = 'not paid';
        }
      }

      const participantsRef = collection(db, "participants")
      const docRef = await addDoc(participantsRef, participantData)
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

      // If updating payment status and user is the owner, update payment status and contestsData
      if ((data.paymentStatus || data.contestsData) && isOwner && !isAdmin) {
        console.log("User updating their own payment data:", data);

        // Create the update object with only allowed fields
        const updateData: any = {
          timestamp: Timestamp.fromDate(new Date())
        };

        // Add paymentStatus if provided
        if (data.paymentStatus) {
          updateData.paymentStatus = data.paymentStatus;
        }

        // Add contestsData if provided
        if (data.contestsData) {
          updateData.contestsData = data.contestsData;
        }

        await updateDoc(participantRef, updateData);
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

      // Handle both old and new data structures
      const participantData: ParticipantData = {
        id: doc.id,
        name: data.name,
        email: data.email,
        rollNumber: data.rollNumber,
        department: data.department,
        contest: data.contest || (data.contests && data.contests.length > 0 ? data.contests[0] : ""),
        contests: data.contests || (data.contest ? [data.contest] : []),
        contestsData: data.contestsData || {},
        timestamp: data.timestamp?.toDate(),
        paymentStatus: data.paymentStatus,
        approvalStatus: data.approvalStatus || 'pending',
        rejectionReason: data.rejectionReason,
      };

      // If we have old data structure with just a contest field but no contests array
      if (data.contest && (!data.contests || data.contests.length === 0)) {
        participantData.contests = [data.contest];

        // Create contestsData if it doesn't exist
        if (!participantData.contestsData[data.contest]) {
          participantData.contestsData[data.contest] = {
            contestName: data.contest,
            paymentStatus: data.paymentStatus || 'not paid',
            registrationDate: data.timestamp?.toDate() || new Date()
          };
        }
      }

      return participantData;
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
      const contestName = paymentData.contestName;

      // 2. Update the payment status
      await updateDoc(paymentRef, {
        status,
        rejectionReason: rejectionReason || null,
        timestamp: Timestamp.fromDate(new Date()),
      })

      // 3. Update the participant's payment status based on the payment status
      if (paymentData.participantId && isAdmin && contestName) {
        try {
          const participantRef = doc(db, "participants", paymentData.participantId);
          const participantDoc = await getDoc(participantRef);

          if (!participantDoc.exists()) {
            throw new Error("Participant not found");
          }

          const participantData = participantDoc.data();

          // Get the existing contestsData or initialize it
          const contestsData = participantData.contestsData || {};

          // Get all contests the participant is registered for
          const allContests = participantData.contests || [participantData.contest];

          if (status === 'verified') {
            // If payment is verified, mark the specific contest as paid
            contestsData[contestName] = {
              ...contestsData[contestName],
              contestName,
              paymentStatus: 'paid',
              verificationDate: new Date()
            };

            console.log(`Updated contest ${contestName} status to PAID`);
          } else if (status === 'rejected') {
            // If payment is rejected, mark the specific contest as not paid
            contestsData[contestName] = {
              ...contestsData[contestName],
              contestName,
              paymentStatus: 'not paid',
              rejectionReason: rejectionReason || 'Payment rejected by admin'
            };

            console.log(`Updated contest ${contestName} status to NOT PAID`);
          }

          // Calculate the overall payment status based on all contests
          let overallStatus = 'not paid';

          // Check if any contests are in 'partial' status
          const anyPartial = allContests.some(contest =>
            contestsData[contest] && contestsData[contest].paymentStatus === 'partial'
          );

          // Check if all contests are in 'paid' status
          const allPaid = allContests.every(contest =>
            contestsData[contest] && contestsData[contest].paymentStatus === 'paid'
          );

          // Determine overall status
          if (allPaid) {
            overallStatus = 'paid';
          } else if (anyPartial || allContests.some(contest =>
            contestsData[contest] && contestsData[contest].paymentStatus === 'paid'
          )) {
            overallStatus = 'partial';
          }

          // Update the participant record with the new contest data and overall status
          await updateDoc(participantRef, {
            contestsData,
            paymentStatus: overallStatus,
            timestamp: Timestamp.fromDate(new Date()),
          });

          console.log(`Updated overall payment status to ${overallStatus}`);
        } catch (participantError) {
          console.error("Error updating participant status:", participantError);
          // Don't throw here, we still want to consider the payment update successful
          // even if the participant update fails
        }
      } else {
        console.log("Not updating participant status: either no participantId, no contestName, or not admin");
      }
    } catch (error) {
      console.error("Error updating payment status:", error)
      throw error
    }
  }

  // Contest Questions Management

  const createQuestion = async (data: ContestQuestion) => {
    if (!db) throw new Error("Firebase Firestore not initialized")
    if (!isAdmin) throw new Error("Only admins can create questions")

    try {
      // First, ensure the questions collection exists
      const questionsRef = collection(db, "questions")

      // Add the new question
      const docRef = await addDoc(questionsRef, {
        ...data,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
        releaseTime: data.releaseTime instanceof Date
          ? Timestamp.fromDate(data.releaseTime)
          : Timestamp.fromDate(new Date(data.releaseTime)),
        endTime: data.endTime instanceof Date
          ? Timestamp.fromDate(data.endTime)
          : Timestamp.fromDate(new Date(data.endTime)),
      })

      // If we get here, the question was created successfully
      console.log("Question created successfully with ID:", docRef.id)
      return docRef.id
    } catch (error) {
      console.error("Error creating question:", error)

      // Check if this is a permission error
      if (error instanceof Error && error.toString().includes("permission")) {
        throw new Error("Permission denied. Make sure you have admin privileges and the Firestore rules are set up correctly.")
      }

      throw error
    }
  }

  const getQuestions = async (contestType?: string) => {
    if (!db) throw new Error("Firebase Firestore not initialized")
    if (!isAdmin) throw new Error("Only admins can view all questions")

    try {
      // Since we might have permission issues with the security rules,
      // we'll handle this differently for now

      // First, check if the questions collection exists by trying to add a document
      // and then immediately deleting it (this is a workaround for permission issues)
      try {
        const questionsRef = collection(db, "questions")

        // Create a temporary question to test permissions
        const tempDoc = await addDoc(questionsRef, {
          title: "Test Question",
          description: "This is a test question to check permissions",
          contestType: "test",
          difficulty: "easy",
          points: 0,
          releaseTime: Timestamp.fromDate(new Date()),
          endTime: Timestamp.fromDate(new Date()),
          isActive: false,
          createdAt: Timestamp.fromDate(new Date()),
          updatedAt: Timestamp.fromDate(new Date())
        })

        // If we get here, we have permission to write to the collection
        // Delete the temporary document
        await deleteDoc(doc(db, "questions", tempDoc.id))

        // Now proceed with the query
        let q = query(questionsRef, orderBy("createdAt", "desc"))

        if (contestType) {
          q = query(questionsRef, where("contestType", "==", contestType), orderBy("createdAt", "desc"))
        }

        const snapshot = await getDocs(q)
        return snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          releaseTime: doc.data().releaseTime?.toDate(),
          endTime: doc.data().endTime?.toDate(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as ContestQuestion[]
      } catch (permissionError) {
        console.error("Permission error:", permissionError)

        // If we get a permission error, return an empty array for now
        // In a production environment, you would want to handle this differently
        return []
      }
    } catch (error) {
      console.error("Error getting questions:", error)

      // Return an empty array instead of throwing an error
      // This will prevent the UI from crashing
      return []
    }
  }

  const getActiveQuestions = async (contestType: string) => {
    if (!db) throw new Error("Firebase Firestore not initialized")

    try {
      const questionsRef = collection(db, "questions")

      // Get questions that:
      // 1. Match the contest type
      // 2. Are active (only check isActive flag)
      const q = query(
        questionsRef,
        where("contestType", "==", contestType),
        where("isActive", "==", true)
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        releaseTime: doc.data().releaseTime?.toDate(),
        endTime: doc.data().endTime?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as ContestQuestion[]
    } catch (error) {
      console.error("Error getting active questions:", error)
      // Return an empty array instead of throwing an error
      return []
    }
  }

  const updateQuestion = async (id: string, data: Partial<ContestQuestion>) => {
    if (!db) throw new Error("Firebase Firestore not initialized")
    if (!isAdmin) throw new Error("Only admins can update questions")

    try {
      const questionRef = doc(db, "questions", id)

      // Handle date conversions
      const updateData: any = {
        ...data,
        updatedAt: Timestamp.fromDate(new Date()),
      }

      if (data.releaseTime) {
        updateData.releaseTime = data.releaseTime instanceof Date
          ? Timestamp.fromDate(data.releaseTime)
          : Timestamp.fromDate(new Date(data.releaseTime))
      }

      if (data.endTime) {
        updateData.endTime = data.endTime instanceof Date
          ? Timestamp.fromDate(data.endTime)
          : Timestamp.fromDate(new Date(data.endTime))
      }

      await updateDoc(questionRef, updateData)
    } catch (error) {
      console.error("Error updating question:", error)
      throw error
    }
  }

  const deleteQuestion = async (id: string) => {
    if (!db) throw new Error("Firebase Firestore not initialized")
    if (!isAdmin) throw new Error("Only admins can delete questions")

    try {
      const questionRef = doc(db, "questions", id)
      await deleteDoc(questionRef)
    } catch (error) {
      console.error("Error deleting question:", error)
      throw error
    }
  }

  // Question Submissions

  const submitAnswer = async (data: QuestionSubmission) => {
    if (!db) throw new Error("Firebase Firestore not initialized")
    if (!user) throw new Error("User must be logged in to submit answers")

    try {
      // Get the question to check the contest type
      const questionRef = doc(db, "questions", data.questionId)
      const questionDoc = await getDoc(questionRef)

      if (!questionDoc.exists()) {
        throw new Error("Question not found")
      }

      const questionData = questionDoc.data() as ContestQuestion

      // Handle different types of participantId (email or document ID)
      let participantData: ParticipantData | null = null;
      let actualParticipantId = data.participantId;

      // If participantId is an email address
      if (typeof data.participantId === 'string' && data.participantId.includes('@')) {
        // Find the participant by email
        const participantsRef = collection(db, "participants");
        const participantQuery = query(participantsRef, where("email", "==", data.participantId));
        const participantSnapshot = await getDocs(participantQuery);

        if (participantSnapshot.empty) {
          throw new Error("Participant not found with this email");
        }

        // Get the participant document
        const participantDoc = participantSnapshot.docs[0];
        participantData = participantDoc.data() as ParticipantData;
        participantData.id = participantDoc.id;

        // Update the participantId to use the document ID
        actualParticipantId = participantDoc.id;
      } else {
        // Check if the participant exists using the provided ID
        const participantRef = doc(db, "participants", data.participantId as string);
        const participantDoc = await getDoc(participantRef);

        if (!participantDoc.exists()) {
          throw new Error("Participant not found with this ID");
        }

        participantData = participantDoc.data() as ParticipantData;
        participantData.id = participantDoc.id;
      }

      // Verify that the participant is the current user
      if (participantData.email !== user.email) {
        throw new Error("You can only submit answers for yourself");
      }

      // Check if the participant is registered for this contest
      const isRegistered = participantData.contests.includes(questionData.contestType);

      if (!isRegistered) {
        throw new Error("You are not registered for this contest");
      }

      // Check if the question is still active
      const now = new Date();
      const releaseTime = questionData.releaseTime instanceof Date
        ? questionData.releaseTime
        : new Date(questionData.releaseTime);
      const endTime = questionData.endTime instanceof Date
        ? questionData.endTime
        : new Date(questionData.endTime);

      if (now < releaseTime) {
        throw new Error("This question is not yet available");
      }

      if (now > endTime) {
        throw new Error("The submission period for this question has ended");
      }

      // Check if the participant has already submitted an answer for this question
      const submissionsRef = collection(db, "submissions");
      const q = query(
        submissionsRef,
        where("questionId", "==", data.questionId),
        where("participantId", "==", actualParticipantId)
      );

      const existingSubmissions = await getDocs(q);

      if (!existingSubmissions.empty) {
        throw new Error("You have already submitted an answer for this question");
      }

      // Create the submission with the correct participantId
      const submissionRef = await addDoc(collection(db, "submissions"), {
        ...data,
        participantId: actualParticipantId, // Use the resolved participantId
        submittedAt: Timestamp.fromDate(new Date()),
        status: 'pending',
      });

      return submissionRef.id;
    } catch (error) {
      console.error("Error submitting answer:", error);
      throw error;
    }
  }

  const getSubmissions = async (questionId?: string, participantId?: string) => {
    if (!db) throw new Error("Firebase Firestore not initialized")

    try {
      const submissionsRef = collection(db, "submissions")
      let q

      if (questionId && participantId) {
        // Get submissions for a specific question and participant
        // First try with the email as participantId
        if (participantId.includes('@')) {
          // This is an email address
          try {
            // First, find the participant document with this email
            const participantsRef = collection(db, "participants")
            const participantQuery = query(participantsRef, where("email", "==", participantId))
            const participantSnapshot = await getDocs(participantQuery)

            if (!participantSnapshot.empty) {
              // We found a participant with this email
              const participantDoc = participantSnapshot.docs[0]

              // Try to find submissions with the participant's document ID
              const submissionsByIdQuery = query(
                submissionsRef,
                where("questionId", "==", questionId),
                where("participantId", "==", participantDoc.id),
                orderBy("submittedAt", "desc")
              )

              const submissionsByIdSnapshot = await getDocs(submissionsByIdQuery)

              if (!submissionsByIdSnapshot.empty) {
                // Found submissions using the participant's document ID
                return submissionsByIdSnapshot.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
                  submittedAt: doc.data().submittedAt?.toDate(),
                })) as QuestionSubmission[]
              }
            }

            // If we didn't find submissions by document ID, try with the email directly
            q = query(
              submissionsRef,
              where("questionId", "==", questionId),
              where("participantId", "==", participantId),
              orderBy("submittedAt", "desc")
            )
          } catch (error) {
            console.error("Error finding participant:", error)
            // Fall back to direct query
            q = query(
              submissionsRef,
              where("questionId", "==", questionId),
              where("participantId", "==", participantId),
              orderBy("submittedAt", "desc")
            )
          }
        } else {
          // This is not an email, use it directly
          q = query(
            submissionsRef,
            where("questionId", "==", questionId),
            where("participantId", "==", participantId),
            orderBy("submittedAt", "desc")
          )
        }
      } else if (questionId) {
        // Get all submissions for a specific question
        if (!isAdmin) throw new Error("Only admins can view all submissions for a question")
        q = query(
          submissionsRef,
          where("questionId", "==", questionId),
          orderBy("submittedAt", "desc")
        )
      } else if (participantId) {
        // Get all submissions for a specific participant
        if (!isAdmin && user?.email !== participantId && user?.uid !== participantId) {
          throw new Error("You can only view your own submissions")
        }

        q = query(
          submissionsRef,
          where("participantId", "==", participantId),
          orderBy("submittedAt", "desc")
        )
      } else {
        // Get all submissions
        if (!isAdmin) throw new Error("Only admins can view all submissions")
        q = query(submissionsRef, orderBy("submittedAt", "desc"))
      }

      // If we reach here, we need to execute the query
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate(),
      })) as QuestionSubmission[]
    } catch (error) {
      console.error("Error getting submissions:", error)
      throw error
    }
  }

  const updateSubmission = async (id: string, data: Partial<QuestionSubmission>) => {
    if (!db) throw new Error("Firebase Firestore not initialized")
    if (!isAdmin) throw new Error("Only admins can update submissions")

    try {
      const submissionRef = doc(db, "submissions", id)
      await updateDoc(submissionRef, data)
    } catch (error) {
      console.error("Error updating submission:", error)
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
    updatePaymentStatus,
    // Contest questions
    createQuestion,
    getQuestions,
    getActiveQuestions,
    updateQuestion,
    deleteQuestion,
    // Question submissions
    submitAnswer,
    getSubmissions,
    updateSubmission
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
