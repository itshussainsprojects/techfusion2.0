"use client"

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useFirebase } from '@/lib/firebase/firebase-provider'
import type { ParticipantData } from '@/lib/firebase/firebase-provider'
import type { ContestQuestion, QuestionSubmission } from '@/lib/types/question'
import { Button } from '@/components/ui/button' // Added Button import
import { Loader2, Zap, CheckCircle, Sparkles, Star } from 'lucide-react' // Added CheckCircle
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { UrduTTS } from '@/lib/urdu-tts'
import Link from 'next/link'

// Define a type for the balloon state
interface QuestionState {
  status: 'unanswered' | 'submitted' | 'popped' // 'submitted' could be an intermediate if needed
  popTriggerTime?: number // Timestamp to trigger individual question pop
}
interface BalloonState {
  participantId: string
  name: string
  rollNumber?: string
  questionStatus: Record<string, QuestionState> // questionId -> QuestionState
  lastActivity?: number // Timestamp for sorting or effects
  balloonWiggleTrigger?: number // Timestamp to trigger main balloon wiggle
}

// New interface for popup balloon animations
interface PopupBalloon {
  id: string
  participantName: string
  questionTitle: string
  timestamp: number
  color: string
}

// Balloon colors for variety
const BALLOON_COLORS = [
  'from-red-400 to-red-600',
  'from-blue-400 to-blue-600',
  'from-green-400 to-green-600',
  'from-yellow-400 to-yellow-600',
  'from-purple-400 to-purple-600',
  'from-pink-400 to-pink-600',
  'from-indigo-400 to-indigo-600',
  'from-orange-400 to-orange-600'
]

const RELEVANT_CONTEST_TYPE: ContestQuestion['contestType'] = 'speed-coding-with-ai'

export default function LiveSubmissionsPage() {
  const { user, isAdmin, getParticipants, getActiveQuestions, onNewSubmission, clearAllSubmissions } = useFirebase()
  const [balloons, setBalloons] = useState<BalloonState[]>([])
  const [activeContestQuestions, setActiveContestQuestions] = useState<ContestQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Refs to store current data for the submission listener
  const balloonsRef = useRef<BalloonState[]>([])
  const questionsRef = useRef<ContestQuestion[]>([])

  // Update refs when state changes
  useEffect(() => {
    balloonsRef.current = balloons
  }, [balloons])

  useEffect(() => {
    questionsRef.current = activeContestQuestions
  }, [activeContestQuestions])

  // New state for popup balloon animations
  const [popupBalloons, setPopupBalloons] = useState<PopupBalloon[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [voiceSpeed, setVoiceSpeed] = useState(1.0)
  const [voiceLanguage, setVoiceLanguage] = useState<'en' | 'ur'>('en') // Language toggle
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [urduVoices, setUrduVoices] = useState<SpeechSynthesisVoice[]>([])
  const [audioInitialized, setAudioInitialized] = useState(false)

  // Live stats state
  const [totalSubmissions, setTotalSubmissions] = useState(0)
  const [submissionsByQuestion, setSubmissionsByQuestion] = useState<Record<string, number>>({})

  // Initialize voices when component mounts
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices()

      // Filter for English voices
      const englishVoices = voices.filter(voice =>
        voice.lang.startsWith('en') && !voice.name.includes('Google')
      )

      // Filter for Urdu voices (ur-PK, ur-IN, or any Urdu variant)
      const urduVoicesList = voices.filter(voice =>
        voice.lang.startsWith('ur') ||
        voice.lang.includes('PK') ||
        voice.name.toLowerCase().includes('urdu')
      )

      setAvailableVoices(englishVoices.length > 0 ? englishVoices : voices.slice(0, 5))
      setUrduVoices(urduVoicesList)

      console.log('🎙️ Available Urdu voices:', urduVoicesList.map(v => `${v.name} (${v.lang})`))
      console.log('🎙️ Available English voices:', englishVoices.map(v => `${v.name} (${v.lang})`))
      console.log('🎙️ Total voices available:', voices.length)
    }

    loadVoices()
    speechSynthesis.onvoiceschanged = loadVoices
  }, [])

  // Function to play celebration sound
  const playPopSound = () => {
    if (!soundEnabled) return
    try {
      // Create a more pleasant celebration sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      // Create multiple oscillators for a richer sound
      const createTone = (freq: number, startTime: number, duration: number, volume: number) => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + startTime)
        oscillator.frequency.exponentialRampToValueAtTime(freq * 0.5, audioContext.currentTime + startTime + duration)

        gainNode.gain.setValueAtTime(0, audioContext.currentTime + startTime)
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + startTime + 0.01)
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + startTime + duration)

        oscillator.start(audioContext.currentTime + startTime)
        oscillator.stop(audioContext.currentTime + startTime + duration)
      }

      // Create a celebratory chord progression
      createTone(523.25, 0, 0.15, 0.1)    // C5
      createTone(659.25, 0.05, 0.15, 0.08) // E5
      createTone(783.99, 0.1, 0.15, 0.06)  // G5
      createTone(1046.5, 0.15, 0.2, 0.04)  // C6

    } catch (error) {
      console.log('Audio not supported or failed:', error)
    }
  }

  // Note: Individual TTS methods moved to lib/urdu-tts.ts for better organization

  // Initialize Urdu TTS
  const urduTTS = UrduTTS.getInstance()

  // Function to announce submission with voice (English & Urdu support)
  const announceSubmission = async (participantName: string, questionTitle: string) => {
    console.log(`🎙️ announceSubmission called: ${participantName} - ${questionTitle}`)
    console.log(`🎙️ Voice enabled: ${voiceEnabled}, Language: ${voiceLanguage}`)

    if (!voiceEnabled) {
      console.log('🎙️ Voice disabled, skipping announcement')
      return
    }

    if (!('speechSynthesis' in window)) {
      console.log('🎙️ Speech synthesis not supported')
      return
    }

    try {
      // Initialize audio context if needed
      await initializeAudio()

      // Cancel any ongoing speech
      speechSynthesis.cancel()

      // Configure TTS settings
      urduTTS.setSpeed(voiceSpeed)
      urduTTS.setVolume(0.8)

      if (voiceLanguage === 'ur') {
        // Real Urdu announcements with Pakistani accent
        const currentHour = new Date().getHours()
        const isEarlySubmission = Date.now() % 10000 < 3000

        const urduExcitement = isEarlySubmission
          ? ["واہ! بہت تیز!", "شاباش! بجلی کی رفتار!", "زبردست رفتار!", "کمال کی تیزی!"]
          : ["شاباش!", "بہت بہترین!", "زبردست!", "کمال!", "واہ واہ!", "عمدہ!", "لاجواب!"]

        const urduSubmission = isEarlySubmission
          ? ["نے بہت تیزی سے حل کیا", "نے فوری طور پر مکمل کیا", "نے جلدی سے ختم کیا"]
          : ["نے جمع کیا", "نے مکمل کیا", "نے حل کیا", "نے ختم کیا", "نے پورا کیا"]

        // Urdu time greetings
        const urduTimeGreeting = currentHour < 12 ? "صبح بخیر!" : currentHour < 17 ? "دوپہر بخیر!" : "شام بخیر!"

        const randomExcitement = urduExcitement[Math.floor(Math.random() * urduExcitement.length)]
        const randomSubmission = urduSubmission[Math.floor(Math.random() * urduSubmission.length)]

        // Occasionally add time greeting
        const includeGreeting = Math.random() < 0.3
        const greeting = includeGreeting ? `${urduTimeGreeting} ` : ""

        const urduMessage = `${greeting}${randomExcitement} ${participantName} ${randomSubmission} ${questionTitle}!`

        // Use enhanced Urdu TTS library
        const success = await urduTTS.speak(urduMessage)
        if (success) {
          console.log(`🎙️ Urdu announcement successful: ${urduMessage}`)
        } else {
          console.log('🎙️ Urdu announcement failed, no fallback needed')
        }
        return // Exit early for Urdu

      } else {
        // English announcements (existing code)
        const currentHour = new Date().getHours()
        const isEarlySubmission = Date.now() % 10000 < 3000

        const excitementPhrases = isEarlySubmission
          ? ["🚀 Lightning fast!", "⚡ Speed demon!", "🔥 Blazing speed!", "💨 Incredible pace!"]
          : ["🎉 Fantastic!", "🔥 Amazing!", "⚡ Incredible!", "🚀 Outstanding!", "💫 Brilliant!", "🎯 Excellent!", "🌟 Superb!"]

        const submissionPhrases = isEarlySubmission
          ? ["just blazed through", "speedily conquered", "rapidly solved", "quickly demolished"]
          : ["just submitted", "completed", "finished", "solved", "conquered", "nailed"]

        const timeGreeting = currentHour < 12 ? "Good morning!" : currentHour < 17 ? "Good afternoon!" : "Good evening!"

        const randomExcitement = excitementPhrases[Math.floor(Math.random() * excitementPhrases.length)]
        const randomSubmission = submissionPhrases[Math.floor(Math.random() * submissionPhrases.length)]

        const includeGreeting = Math.random() < 0.3
        const greeting = includeGreeting ? `${timeGreeting} ` : ""

        const englishMessage = `${greeting}${randomExcitement} ${participantName} ${randomSubmission} ${questionTitle}!`

        const utterance = new SpeechSynthesisUtterance(englishMessage)

        // Configure voice settings
        if (availableVoices.length > 0) {
          const randomVoice = availableVoices[Math.floor(Math.random() * availableVoices.length)]
          utterance.voice = randomVoice
        }

        utterance.lang = 'en-US'
        utterance.rate = voiceSpeed
        utterance.pitch = 1.1
        utterance.volume = 0.8

        utterance.onstart = () => {
          console.log(`🎙️ Announcing (English): ${englishMessage}`)
        }

        utterance.onerror = (event) => {
          console.log('Speech synthesis error:', event.error)
        }

        speechSynthesis.speak(utterance)
      }

    } catch (error) {
      console.log('Voice announcement failed:', error)
    }
  }

  // Function to create a popup balloon with voice announcement
  const createPopupBalloon = (participantName: string, questionTitle: string) => {
    console.log(`🎈 createPopupBalloon called with: "${participantName}" - "${questionTitle}"`)

    const newBalloon: PopupBalloon = {
      id: `${Date.now()}-${Math.random()}`,
      participantName,
      questionTitle,
      timestamp: Date.now(),
      color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)]
    }

    setPopupBalloons(prev => [...prev, newBalloon])

    // Play sound effect first
    playPopSound()

    // Remove balloon after animation completes
    setTimeout(() => {
      setPopupBalloons(prev => prev.filter(b => b.id !== newBalloon.id))
    }, 4000)
  }

  // Check authentication status
  useEffect(() => {
    if (!user) {
      setError("Please sign in to access the live submissions page")
      setLoading(false)
      return
    }
    loadInitialData()
  }, [user])

  // Load initial data with error handling
  const loadInitialData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch active questions
      const questions = await getActiveQuestions(RELEVANT_CONTEST_TYPE)
      setActiveContestQuestions(questions)

      // Fetch participants
      const participants = await getParticipants()
      
      // Initialize balloon states
      const initialBalloons: BalloonState[] = participants.map(p => ({
        participantId: p.id || '',
        name: p.name,
        rollNumber: p.rollNumber,
        questionStatus: {},
        lastActivity: Date.now()
      }))
      
      setBalloons(initialBalloons)
      setLoading(false)
    } catch (err) {
      console.error('Error loading initial data:', err)
      setError('Failed to load submissions data. Please try refreshing the page.')
      setLoading(false)
    }
  }

  // Reset wiggle and individual pop triggers after animation
  useEffect(() => {
    balloons.forEach(balloon => {
      if (balloon.balloonWiggleTrigger) {
        const timer = setTimeout(() => {
          setBalloons(prev => prev.map(b =>
            b.participantId === balloon.participantId ? { ...b, balloonWiggleTrigger: undefined } : b
          ));
        }, 700); // Duration of wiggle animation
        return () => clearTimeout(timer);
      }
      Object.keys(balloon.questionStatus).forEach(questionId => {
        if (balloon.questionStatus[questionId].popTriggerTime) {
          const qTimer = setTimeout(() => {
            setBalloons(prev => prev.map(b => {
              if (b.participantId === balloon.participantId) {
                const newQStatus = { ...b.questionStatus };
                if (newQStatus[questionId]) {
                  newQStatus[questionId] = { ...newQStatus[questionId], popTriggerTime: undefined };
                }
                return { ...b, questionStatus: newQStatus };
              }
              return b;
            }));
          }, 600); // Duration of question pop animation
          return () => clearTimeout(qTimer);
        }
      });
    });
  }, [balloons]);

  // Sound toggle function
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled)
    toast.info(soundEnabled ? 'Sound effects disabled' : 'Sound effects enabled')
  }

  // Initialize audio context (required for browsers)
  const initializeAudio = async () => {
    if (!audioInitialized) {
      try {
        // Create a silent audio context to enable audio
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        if (audioContext.state === 'suspended') {
          await audioContext.resume()
        }
        setAudioInitialized(true)
        console.log('🎙️ Audio context initialized')
      } catch (error) {
        console.log('🎙️ Audio initialization failed:', error)
      }
    }
  }

  // Voice toggle function
  const toggleVoice = async () => {
    if (!voiceEnabled) {
      // Initialize audio when enabling voice
      await initializeAudio()
    } else {
      // Stop any ongoing speech when disabling
      speechSynthesis.cancel()
    }
    setVoiceEnabled(!voiceEnabled)
    toast.info(voiceEnabled ? 'Voice announcements disabled' : 'Voice announcements enabled')
  }

  // Voice speed control
  const adjustVoiceSpeed = () => {
    const newSpeed = voiceSpeed >= 1.5 ? 0.8 : voiceSpeed + 0.2
    setVoiceSpeed(newSpeed)
    toast.info(`Voice speed: ${newSpeed.toFixed(1)}x`)
  }

  // Language toggle function
  const toggleLanguage = () => {
    const newLang = voiceLanguage === 'en' ? 'ur' : 'en'
    setVoiceLanguage(newLang)

    toast.success(newLang === 'ur' ? 'Romanized Urdu enabled! (Shabash!)' : 'English voice enabled!')
  }

  // Clear all submissions function for fresh start
  const handleClearSubmissions = async () => {
    if (!isAdmin) {
      toast.error("Only admins can clear submissions")
      return
    }

    if (!confirm("Are you sure you want to clear ALL submissions? This cannot be undone!")) {
      return
    }

    try {
      await clearAllSubmissions()

      // Reset live stats
      setTotalSubmissions(0)
      setSubmissionsByQuestion({})

      // Reset balloon states
      setBalloons(prevBalloons =>
        prevBalloons.map(balloon => ({
          ...balloon,
          questionStatus: Object.fromEntries(
            Object.keys(balloon.questionStatus).map(qId => [qId, { status: 'unanswered' as const }])
          ),
          lastActivity: Date.now()
        }))
      )

      toast.success("All submissions cleared! Fresh start ready.")
    } catch (error) {
      console.error("Error clearing submissions:", error)
      toast.error("Failed to clear submissions")
    }
  }

  // Test balloon function for admins
  const testBalloonAnimation = async () => {
    // Initialize audio first
    await initializeAudio()

    const testNames = voiceLanguage === 'ur'
      ? ['علی احمد', 'فاطمہ خان', 'محمد حسن', 'عائشہ علی', 'احمد رضا', 'زینب شاہ', 'حسن علی']
      : ['Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince', 'Eve Wilson']

    const testQuestions = voiceLanguage === 'ur'
      ? ['الگورتھم چیلنج', 'ڈیٹا سٹرکچر مسئلہ', 'اے آئی پروجیکٹ', 'ویب ڈیولپمنٹ ٹاسک', 'کوڈنگ چیلنج']
      : ['Algorithm Challenge', 'Data Structure Problem', 'AI Implementation', 'Web Development Task']

    const randomName = testNames[Math.floor(Math.random() * testNames.length)]
    const randomQuestion = testQuestions[Math.floor(Math.random() * testQuestions.length)]

    console.log(`🎈 Testing with: "${randomName}" - "${randomQuestion}"`)

    // Create popup balloon animation and voice announcement
    createPopupBalloon(randomName, randomQuestion)

    // Also test voice announcement directly
    announceSubmission(randomName, randomQuestion)

    toast.success(`🎈 Test balloon launched for ${randomName}!`)
  }

  // Render loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading submissions...</span>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 p-4 text-center">
        <div className="text-destructive">{error}</div>
        {!user && (
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        )}
        {user && (
          <Button onClick={loadInitialData}>
            Try Again
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white p-4 pt-20 relative overflow-hidden">
      {/* Popup Balloon Animations */}
      <AnimatePresence>
        {popupBalloons.map((balloon) => (
          <motion.div
            key={balloon.id}
            initial={{
              y: window.innerHeight + 100,
              x: Math.random() * (window.innerWidth - 200),
              scale: 0.5,
              rotate: -10
            }}
            animate={{
              y: -200,
              scale: [0.5, 1.2, 1, 1.1, 0],
              rotate: [0, 5, -5, 0],
            }}
            exit={{
              scale: 0,
              opacity: 0
            }}
            transition={{
              duration: 4,
              ease: "easeOut",
              scale: {
                times: [0, 0.3, 0.6, 0.8, 1],
                duration: 4
              }
            }}
            className="fixed z-50 pointer-events-none"
            style={{ left: Math.random() * (window.innerWidth - 200) }}
          >
            {/* Balloon */}
            <div className="relative">
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className={`w-24 h-32 rounded-full bg-gradient-to-b ${balloon.color} shadow-lg relative`}
              >
                {/* Balloon highlight */}
                <div className="absolute top-2 left-2 w-4 h-6 bg-white/30 rounded-full blur-sm"></div>

                {/* Balloon string */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0.5 h-16 bg-gray-600"></div>
              </motion.div>

              {/* Participant info */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded-lg p-3 min-w-max"
              >
                <div className="text-center">
                  <div className="font-bold text-yellow-300 text-sm">{balloon.participantName}</div>
                  <div className="text-xs text-gray-300 mt-1">{balloon.questionTitle}</div>
                  <div className="flex justify-center mt-2">
                    <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
                    <Star className="h-4 w-4 text-yellow-400 animate-pulse mx-1" />
                    <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
                  </div>
                </div>
              </motion.div>

              {/* Confetti particles */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: 0,
                    y: 0,
                    scale: 0,
                    rotate: 0
                  }}
                  animate={{
                    x: (Math.random() - 0.5) * 200,
                    y: Math.random() * 100 + 50,
                    scale: [0, 1, 0],
                    rotate: Math.random() * 360
                  }}
                  transition={{
                    delay: 1.5 + i * 0.1,
                    duration: 1.5,
                    ease: "easeOut"
                  }}
                  className={`absolute top-1/2 left-1/2 w-2 h-2 rounded-full ${
                    ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400', 'bg-pink-400'][i % 6]
                  }`}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <header className="text-center mb-8 relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            <Zap className="inline-block h-10 w-10 mr-2 text-yellow-400" />
            Live Contest Submissions
          </h1>
          <div className="flex flex-wrap gap-2 justify-center">
            {/* Sound Effects Toggle */}
            <Button
              onClick={toggleSound}
              variant="outline"
              size="sm"
              className={`${soundEnabled ? 'bg-green-600/20 border-green-500' : 'bg-red-600/20 border-red-500'} text-white`}
              title={soundEnabled ? 'Disable sound effects' : 'Enable sound effects'}
            >
              {soundEnabled ? '🔊' : '🔇'}
            </Button>

            {/* Voice Announcements Toggle */}
            <Button
              onClick={toggleVoice}
              variant="outline"
              size="sm"
              className={`${voiceEnabled ? 'bg-blue-600/20 border-blue-500' : 'bg-gray-600/20 border-gray-500'} text-white`}
              title={voiceEnabled ? 'Disable voice announcements' : 'Enable voice announcements'}
            >
              {voiceEnabled ? '🎙️' : '🔇'}
            </Button>

            {/* Language Toggle */}
            {voiceEnabled && (
              <Button
                onClick={toggleLanguage}
                variant="outline"
                size="sm"
                className={`${voiceLanguage === 'ur' ? 'bg-green-600/20 border-green-500' : 'bg-orange-600/20 border-orange-500'} text-white hover:opacity-80`}
                title={voiceLanguage === 'ur' ? 'Switch to English voice' : 'Switch to Romanized Urdu voice'}
              >
                {voiceLanguage === 'ur' ? '🇵🇰 Urdu' : '🇺🇸 EN'}
              </Button>
            )}

            {/* Voice Speed Control */}
            {voiceEnabled && (
              <Button
                onClick={adjustVoiceSpeed}
                variant="outline"
                size="sm"
                className="bg-purple-600/20 border-purple-500 text-white hover:bg-purple-600/30"
                title={`Voice speed: ${voiceSpeed.toFixed(1)}x`}
              >
                ⚡{voiceSpeed.toFixed(1)}x
              </Button>
            )}

            {/* Admin Test Buttons */}
            {isAdmin && (
              <>
                <Button
                  onClick={handleClearSubmissions}
                  variant="outline"
                  size="sm"
                  className="bg-red-600/20 border-red-500 text-white hover:bg-red-600/30"
                  title="Clear all submissions for fresh start"
                >
                  🔄 Clear
                </Button>
                <Button
                  onClick={testBalloonAnimation}
                  variant="outline"
                  size="sm"
                  className="bg-yellow-600/20 border-yellow-500 text-white hover:bg-yellow-600/30"
                  title="Test balloon animation with voice"
                >
                  🎈 Test
                </Button>
              </>
            )}
          </div>
        </div>
        <p className="mt-3 text-lg text-purple-300">
          Watch submissions pop in real-time for {RELEVANT_CONTEST_TYPE.replace(/-/g, ' ')}!
        </p>
        {voiceEnabled && (
          <p className="mt-2 text-sm text-green-300 animate-pulse">
            🎙️ Voice announcements enabled in {voiceLanguage === 'ur' ? 'اردو (Pakistani Urdu)' : 'English'} - Listen for live commentary!
          </p>
        )}
      </header>

      {/* Statistics and Active Questions */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        {/* Live Statistics */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-4 bg-black/20 rounded-lg"
        >
          <h2 className="text-xl font-semibold mb-3 text-green-300 flex items-center">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse mr-2"></div>
            Live Stats
          </h2>
          <div className="grid grid-cols-2 gap-4 text-center mb-4">
            <div>
              <motion.div
                key={balloons.length}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.3 }}
                className="text-2xl font-bold text-white"
              >
                {balloons.length}
              </motion.div>
              <div className="text-xs text-gray-300">Active Participants</div>
            </div>
            <div>
              <motion.div
                key={totalSubmissions}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5 }}
                className="text-2xl font-bold text-yellow-400"
              >
                {totalSubmissions}
              </motion.div>
              <div className="text-xs text-gray-300">Total Submissions</div>
            </div>
          </div>

          {/* Question-wise submission stats */}
          {Object.keys(submissionsByQuestion).length > 0 && (
            <div className="border-t border-gray-600 pt-3">
              <div className="text-sm text-purple-300 mb-2">Submissions by Question:</div>
              <div className="space-y-1">
                {Object.entries(submissionsByQuestion).map(([questionId, count]) => {
                  const question = activeContestQuestions.find(q => q.id === questionId)
                  return (
                    <div key={questionId} className="flex justify-between items-center text-xs">
                      <span className="text-gray-300 truncate flex-1 mr-2">
                        {question?.title || questionId}
                      </span>
                      <motion.span
                        key={count}
                        initial={{ scale: 1 }}
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 0.3 }}
                        className="text-yellow-400 font-bold bg-yellow-400/20 px-2 py-1 rounded"
                      >
                        {count}
                      </motion.span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </motion.div>

        {/* Active Questions */}
        {activeContestQuestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 bg-black/20 rounded-lg"
          >
            <h2 className="text-xl font-semibold mb-2 text-purple-300">Active Questions:</h2>
            <div className="flex flex-wrap gap-2">
              {activeContestQuestions.map(q => (
                <span key={q.id} className="px-3 py-1 bg-purple-700 text-sm rounded-full">{q.title}</span>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <main className="flex-grow relative z-10">
        {balloons.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-xl text-gray-400">No participants currently active in this contest or awaiting submissions.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <AnimatePresence>
              {balloons.map((balloon) => (
                <motion.div
                  key={balloon.participantId}
                  layout
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{
                    opacity: 1,
                    scale: balloon.balloonWiggleTrigger ? [1, 1.05, 1] : 1,
                    rotate: balloon.balloonWiggleTrigger ? [0, -2, 2, -1, 1, 0] : 0,
                    boxShadow: balloon.balloonWiggleTrigger
                      ? [
                          "0 10px 25px rgba(0,0,0,0.3)",
                          "0 15px 35px rgba(59, 130, 246, 0.4)",
                          "0 10px 25px rgba(0,0,0,0.3)"
                        ]
                      : "0 10px 25px rgba(0,0,0,0.3)"
                  }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                    scale: { duration: 0.6 },
                    rotate: { duration: 0.6 },
                    boxShadow: { duration: 0.6 }
                  }}
                  className={`p-4 rounded-lg shadow-xl relative overflow-hidden transition-all duration-300
                    bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-700
                    ${balloon.balloonWiggleTrigger ? 'ring-2 ring-yellow-400 ring-opacity-75' : ''}
                  `}
                >
                  <div className="relative z-20">
                    <h3 className="text-lg font-semibold truncate text-yellow-300">{balloon.name}</h3>
                    <p className="text-xs text-blue-200 truncate mb-1">{balloon.rollNumber || 'No Roll#'}</p>
                    <div className="mt-2 grid grid-cols-1 xs:grid-cols-2 gap-1.5"> {/* Responsive grid for question balloons */}
                      {Object.entries(balloon.questionStatus).map(([questionId, qState]) => {
                        const question = activeContestQuestions.find(q => q.id === questionId);

                        return (
                          <motion.div
                            key={questionId}
                            initial={{ scale: 1 }}
                            animate={{
                              scale: qState.status === 'popped' ? [1, 1.2, 0.95, 1] : 1,
                              opacity: 1,
                              backgroundColor: qState.status === 'popped'
                                ? ["rgba(71, 85, 105, 0.7)", "rgba(16, 185, 129, 0.9)", "rgba(16, 185, 129, 0.9)"]
                                : undefined
                            }}
                            transition={{
                              duration: qState.popTriggerTime ? 0.8 : 0.3,
                              ease: "easeOut",
                              scale: {
                                times: qState.popTriggerTime ? [0, 0.3, 0.7, 1] : [0, 1]
                              }
                            }}
                            className={`flex flex-col items-center justify-center text-center p-1.5 rounded-md text-xs shadow-md relative
                              ${qState.status === 'unanswered' ? 'bg-slate-600/70 hover:bg-slate-500/70' :
                                qState.status === 'popped' ? 'bg-emerald-600/90' : 'bg-rose-500/80'
                              }`}
                          >
                            {/* Sparkle effect for popped questions */}
                            {qState.status === 'popped' && qState.popTriggerTime && (
                              <>
                                {[...Array(4)].map((_, i) => (
                                  <motion.div
                                    key={i}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{
                                      scale: [0, 1, 0],
                                      opacity: [0, 1, 0],
                                      x: [0, (Math.random() - 0.5) * 30],
                                      y: [0, (Math.random() - 0.5) * 30]
                                    }}
                                    transition={{
                                      delay: i * 0.1,
                                      duration: 0.6,
                                      ease: "easeOut"
                                    }}
                                    className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                                  />
                                ))}
                              </>
                            )}

                            <span className="truncate text-white text-[9px] sm:text-[10px] font-medium leading-tight w-full px-0.5 relative z-10">
                              {question?.title || 'Q...'}
                            </span>
                            {qState.status === 'popped' && (
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.2, duration: 0.4, ease: "backOut" }}
                              >
                                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white mt-0.5" />
                              </motion.div>
                            )}
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Enhanced Footer */}
      <footer className="text-center mt-8 py-4 border-t border-purple-700/50 relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <p className="text-sm text-purple-400 mb-2 sm:mb-0">Tech Fusion 2.0 - Live Dashboard</p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1"></div>
              Real-time Updates
            </span>
            <span>Sound: {soundEnabled ? 'ON' : 'OFF'}</span>
            <span>Voice: {voiceEnabled ? 'ON' : 'OFF'}</span>
            {voiceEnabled && (
              <>
                <span>Lang: {voiceLanguage === 'ur' ? 'Urdu' : 'English'}</span>
                <span>Speed: {voiceSpeed.toFixed(1)}x</span>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}