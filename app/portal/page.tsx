"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Calendar, MapPin, Users, Clock, Trophy, Info, User } from "lucide-react"
import ParticlesBackground from "@/components/particles-background"
import type { ParticipantData } from "@/lib/firebase/firebase-provider"
import PaymentSection from './components/payment-section'

// Contest details
const contestDetails = {
  hackathon: {
    title: "Tech Fusion Hackathon",
    description: "Build innovative solutions to real-world problems in 48 hours.",
    date: "June 15-17, 2025",
    location: "Main Campus, Building A",
    teamSize: "2-4 members",
    duration: "48 hours",
    prizes: ["$5,000 First Prize", "$2,500 Second Prize", "$1,000 Third Prize"],
    requirements: [
      "Bring your own laptop and charger",
      "Knowledge of web/mobile development",
      "Presentation skills for demo",
      "GitHub account",
    ],
    schedule: [
      { time: "June 15, 9:00 AM", event: "Registration & Team Formation" },
      { time: "June 15, 10:30 AM", event: "Opening Ceremony & Problem Statement" },
      { time: "June 15, 12:00 PM", event: "Hacking Begins" },
      { time: "June 16, 12:00 PM", event: "Mid-way Checkpoint" },
      { time: "June 17, 12:00 PM", event: "Hacking Ends" },
      { time: "June 17, 2:00 PM", event: "Presentations & Judging" },
      { time: "June 17, 5:00 PM", event: "Awards Ceremony" },
    ],
  },
  robotics: {
    title: "Robotics Challenge",
    description: "Design and program robots to navigate complex obstacles and complete tasks.",
    date: "June 18-19, 2025",
    location: "Engineering Building, Room 305",
    teamSize: "2-3 members",
    duration: "2 days",
    prizes: ["$3,000 First Prize", "$1,500 Second Prize", "$750 Third Prize"],
    requirements: [
      "Basic knowledge of robotics",
      "Familiarity with Arduino or Raspberry Pi",
      "Programming skills (Python or C++)",
      "Tools for assembly and testing",
    ],
    schedule: [
      { time: "June 18, 9:00 AM", event: "Registration & Equipment Check" },
      { time: "June 18, 10:00 AM", event: "Rules Briefing & Challenge Announcement" },
      { time: "June 18, 11:00 AM", event: "Design & Build Phase Begins" },
      { time: "June 19, 10:00 AM", event: "Testing Phase" },
      { time: "June 19, 2:00 PM", event: "Final Competition" },
      { time: "June 19, 5:00 PM", event: "Awards Ceremony" },
    ],
  },
  gaming: {
    title: "Gaming Tournament",
    description: "Compete in popular esports titles and showcase your gaming skills.",
    date: "June 20, 2025",
    location: "Student Center, Gaming Arena",
    teamSize: "Individual & Team Events",
    duration: "1 day",
    prizes: ["$2,000 First Prize", "$1,000 Second Prize", "$500 Third Prize"],
    requirements: [
      "Own gaming peripherals (optional)",
      "Registration for specific game titles",
      "Knowledge of tournament rules",
      "Discord account for communication",
    ],
    schedule: [
      { time: "June 20, 8:00 AM", event: "Check-in & Setup" },
      { time: "June 20, 9:00 AM", event: "Group Stage Matches Begin" },
      { time: "June 20, 12:00 PM", event: "Lunch Break" },
      { time: "June 20, 1:00 PM", event: "Quarterfinals" },
      { time: "June 20, 3:00 PM", event: "Semifinals" },
      { time: "June 20, 4:30 PM", event: "Finals" },
      { time: "June 20, 6:00 PM", event: "Awards Ceremony" },
    ],
  },
  "ai-challenge": {
    title: "AI Innovation Challenge",
    description: "Develop AI solutions to solve complex problems in healthcare, environment, or education.",
    date: "June 21-22, 2025",
    location: "Computer Science Building, AI Lab",
    teamSize: "1-3 members",
    duration: "2 days",
    prizes: ["$4,000 First Prize", "$2,000 Second Prize", "$1,000 Third Prize"],
    requirements: [
      "Knowledge of machine learning frameworks",
      "Data preprocessing skills",
      "Python programming experience",
      "Presentation of AI solution and results",
    ],
    schedule: [
      { time: "June 21, 9:00 AM", event: "Registration & Problem Statement" },
      { time: "June 21, 10:00 AM", event: "Kickoff & Dataset Release" },
      { time: "June 21, 11:00 AM", event: "Development Begins" },
      { time: "June 22, 10:00 AM", event: "Progress Check-in" },
      { time: "June 22, 3:00 PM", event: "Submission Deadline" },
      { time: "June 22, 4:00 PM", event: "Presentations & Judging" },
      { time: "June 22, 6:00 PM", event: "Awards Ceremony" },
    ],
  },
  "startup-pitch": {
    title: "Startup Pitch Competition",
    description: "Present your innovative business ideas to investors and industry experts.",
    date: "June 23, 2025",
    location: "Business School Auditorium",
    teamSize: "1-4 members",
    duration: "1 day",
    prizes: ["$10,000 Seed Funding", "Mentorship Program", "Incubator Space"],
    requirements: [
      "Business plan document",
      "Pitch deck (10 slides maximum)",
      "5-minute presentation",
      "Q&A readiness",
    ],
    schedule: [
      { time: "June 23, 9:00 AM", event: "Registration & Setup" },
      { time: "June 23, 10:00 AM", event: "Opening Remarks" },
      { time: "June 23, 10:30 AM", event: "Preliminary Round Pitches" },
      { time: "June 23, 12:30 PM", event: "Networking Lunch" },
      { time: "June 23, 2:00 PM", event: "Finalist Announcements" },
      { time: "June 23, 3:00 PM", event: "Final Round Pitches" },
      { time: "June 23, 5:00 PM", event: "Judges Deliberation & Awards" },
    ],
  },
}

const CONTEST_PRICES = {
  hackathon: {
    amount: 1000,
    currency: 'PKR',
    description: 'Hackathon Registration Fee'
  },
  robotics: {
    amount: 800,
    currency: 'PKR',
    description: 'Robotics Challenge Fee'
  },
  gaming: {
    amount: 500,
    currency: 'PKR',
    description: 'Gaming Tournament Fee'
  },
  "ai-challenge": {
    amount: 900,
    currency: 'PKR',
    description: 'AI Challenge Registration Fee'
  },
  "startup-pitch": {
    amount: 700,
    currency: 'PKR',
    description: 'Startup Pitch Competition Fee'
  }
}

export default function PortalPage() {
  const router = useRouter()
  const { user, loading, getUserParticipation } = useFirebase()

  const [participant, setParticipant] = useState<ParticipantData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const reloadParticipant = async () => {
    if (user?.email) {
      try {
        const data = await getUserParticipation(user.email)
        setParticipant(data)
      } catch (error) {
        console.error("Error fetching participant data:", error)
      } finally {
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) reloadParticipant()
  }, [user])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/portal")
    }
  }, [loading, user, router])

  if (loading || isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-darkBlue">
        <Loader2 className="h-8 w-8 animate-spin text-lightBlue" />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  if (!participant) {
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
                <CardTitle className="text-2xl font-bold text-center text-white">Not Registered</CardTitle>
                <CardDescription className="text-center text-gray-300">
                  You haven't registered for any contests yet.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                <p className="text-gray-300">
                  Register for a contest to access your participant portal and get all the details.
                </p>
                <Button
                  onClick={() => router.push("/register")}
                  className="bg-lightBlue hover:bg-lightBlue/80 text-white"
                >
                  Register Now
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  // Get contest details based on participant's contest
  const contest = contestDetails[participant.contest as keyof typeof contestDetails]

  return (
    <div className="min-h-screen pt-20 pb-10 bg-darkBlue">
      <ParticlesBackground />

      <div className="container mx-auto px-4 z-10 relative">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="glassmorphism border-lightBlue/20 mb-6">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl md:text-3xl font-bold text-white">Participant Portal</CardTitle>
                  <CardDescription className="text-gray-300">Welcome back, {participant.name}</CardDescription>
                </div>
                <Badge className="bg-lightBlue text-white text-sm px-3 py-1">
                  {participant.contest.charAt(0).toUpperCase() + participant.contest.slice(1).replace("-", " ")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-300">
                  <Users className="h-5 w-5 text-lightBlue" />
                  <span>Department: {participant.department}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="h-5 w-5 text-lightBlue" />
                  <span>Registered on: {new Date(participant.timestamp || Date.now()).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <User className="h-5 w-5 text-lightBlue" />
                  <span>Roll Number: {participant.rollNumber}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphism border-lightBlue/20">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl font-bold text-white">{contest.title}</CardTitle>
              <CardDescription className="text-gray-300">{contest.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-darkBlue/50">
                  <TabsTrigger value="details" className="text-white">
                    Details
                  </TabsTrigger>
                  <TabsTrigger value="requirements" className="text-white">
                    Requirements
                  </TabsTrigger>
                  <TabsTrigger value="schedule" className="text-white">
                    Schedule
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-lightBlue shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-white">Date</h4>
                        <p className="text-gray-300">{contest.date}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-lightBlue shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-white">Location</h4>
                        <p className="text-gray-300">{contest.location}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-lightBlue shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-white">Team Size</h4>
                        <p className="text-gray-300">{contest.teamSize}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-lightBlue shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-white">Duration</h4>
                        <p className="text-gray-300">{contest.duration}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold text-white flex items-center gap-2 mb-3">
                      <Trophy className="h-5 w-5 text-lightBlue" /> Prizes
                    </h4>
                    <ul className="space-y-2 pl-8 list-disc text-gray-300">
                      {contest.prizes.map((prize, index) => (
                        <li key={index}>{prize}</li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="requirements" className="space-y-4 mt-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-lightBlue shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-white mb-3">What You'll Need</h4>
                      <ul className="space-y-2 pl-8 list-disc text-gray-300">
                        {contest.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="schedule" className="space-y-4 mt-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-lightBlue shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-white mb-3">Event Schedule</h4>
                      <div className="space-y-4">
                        {contest.schedule.map((item, index) => (
                          <div key={index} className="border-l-2 border-lightBlue pl-4 pb-4">
                            <p className="font-medium text-white">{item.time}</p>
                            <p className="text-gray-300">{item.event}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-8 flex justify-center">
                <Button className="bg-lightBlue hover:bg-lightBlue/80 text-white">Download Event Details</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <PaymentSection
          participant={participant}
          reloadParticipant={reloadParticipant}
          paymentDetails={CONTEST_PRICES[participant.contest as keyof typeof CONTEST_PRICES]}
        />
      </div>
    </div>
  )
}
