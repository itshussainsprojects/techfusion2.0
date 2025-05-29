"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Calendar, MapPin, Users, Clock, Trophy, Info, User, Download, XCircle, Code } from "lucide-react"
import ParticlesBackground from "@/components/particles-background"
import type { ParticipantData } from "@/lib/firebase/firebase-provider"
import PaymentSection from './components/payment-section'
import { SimpleContestQuestions } from './components/simple-contest-questions'
import { toast } from "sonner"

// Contest details
const contestDetails = {
  "robo-war": {
    title: "Robo War",
    description: "A robot battle showcasing engineering and innovation - Rs. 4,500",
    date: "June 3-4, 2025",
    location: "Engineering Building, Room 305",
    teamSize: "2-3 members",
    duration: "2 days",
    prizes: ["25,000 PKR First Prize", "15,000 PKR Second Prize", "10,000 PKR Third Prize"],
    requirements: [
      "Registration fee: Rs. 4,500",
      "Basic knowledge of robotics",
      "Familiarity with Arduino or Raspberry Pi",
      "Programming skills (Python or C++)",
      "Tools for assembly and testing",
    ],
    schedule: [
      { time: "June 3, 10:00 AM", event: "Opening Ceremony" },
      { time: "June 3, 10:30 AM", event: "Registration & Equipment Check" },
      { time: "June 3, 11:00 AM", event: "Rules Briefing & Challenge Announcement" },
      { time: "June 3, 11:30 AM", event: "Design & Build Phase Begins" },
      { time: "June 4, 10:00 AM", event: "Testing Phase" },
      { time: "June 4, 2:00 PM", event: "Final Competition" },
      { time: "June 4, 5:00 PM", event: "Awards Ceremony" },
    ],
  },
  "e-sports": {
    title: "E-Sports",
    description: "Competitive video gaming in collaboration with Lavida.",
    date: "June 3, 2025",
    location: "Student Center, Gaming Arena",
    teamSize: "Individual & Team Events",
    duration: "1 day",
    prizes: ["5,000 PKR First Prize", "3,000 PKR Second Prize", "2,000 PKR Third Prize"],
    requirements: [
      "Own gaming peripherals (optional)",
      "Registration for specific game titles",
      "Knowledge of tournament rules",
      "Discord account for communication",
    ],
    schedule: [
      { time: "June 3, 8:00 AM", event: "Check-in & Setup" },
      { time: "June 3, 9:00 AM", event: "Group Stage Matches Begin" },
      { time: "June 3, 12:00 PM", event: "Lunch Break" },
      { time: "June 3, 1:00 PM", event: "Quarterfinals" },
      { time: "June 3, 3:00 PM", event: "Semifinals" },
      { time: "June 3, 4:30 PM", event: "Finals" },
      { time: "June 3, 6:00 PM", event: "Awards Ceremony" },
    ],
  },

  "in-it-to-win-it": {
    title: "In It to Win It",
    description: "Fun on-ground interactive activities and games like human snake ladder, buzzer game, shoot the ball, treasure hunt.",
    date: "June 3-4, 2025",
    location: "University Grounds",
    teamSize: "3-5 members",
    duration: "2 days",
    prizes: ["5,000 PKR First Prize", "3,000 PKR Second Prize", "2,000 PKR Third Prize", "Exciting Gifts for All Participants"],
    requirements: [
      "Comfortable clothing and footwear",
      "Team spirit and enthusiasm",
      "Basic physical fitness",
      "Willingness to participate in all activities",
    ],
    schedule: [
      { time: "June 3, 9:00 AM", event: "Registration & Team Formation" },
      { time: "June 3, 10:00 AM", event: "Opening Ceremony & Games Briefing" },
      { time: "June 3, 10:30 AM", event: "Activities Begin" },
      { time: "June 3, 12:30 PM", event: "Lunch Break" },
      { time: "June 3, 1:30 PM", event: "Activities Resume" },
      { time: "June 4, 10:00 AM", event: "Final Challenge" },
      { time: "June 4, 11:00 AM", event: "Awards Ceremony" },
    ],
  },
  "speed-coding-with-ai": {
    title: "Speed Coding with AI",
    description: "Develop innovative projects using AI tools like ChatGPT, DeepSeek, Grok, Qwen, and Replit. A scenario will be given and participants must create a complete project with AI assistance.",
    date: "June 3, 2025 (Tuesday)",
    location: "Cyber/AI Lab",
    teamSize: "Individual or 2 members",
    duration: "2 hours (11:00 AM - 1:00 PM)",
    prizes: ["3,000 PKR First Prize", "2,000 PKR Second Prize", "1,000 PKR Third Prize"],
    requirements: [
      "Laptop with stable internet connection",
      "Access to AI tools: ChatGPT, DeepSeek, Grok, Qwen, Replit, etc.",
      "Knowledge of any programming language/framework",
      "NO pre-built structures allowed - everything must be coded live",
      "Evaluation based on functionality, interface, and logical thinking",
    ],
    schedule: [
      { time: "June 3, 10:30 AM", event: "Check-in & Setup" },
      { time: "June 3, 10:45 AM", event: "Rules Briefing & Scenario Announcement" },
      { time: "June 3, 11:00 AM", event: "Coding Challenge Begins" },
      { time: "June 3, 1:00 PM", event: "Coding Challenge Ends & Submission" },
      { time: "June 3, 1:15 PM", event: "Project Evaluation & Ranking" },
      { time: "June 3, 2:00 PM", event: "Results Announcement & Awards" },
    ],
  },

  "treasure-hunt": {
    title: "Treasure Hunt",
    description: "Team-based adventure to find hidden treasures across campus.",
    date: "June 4, 2025",
    location: "University Campus",
    teamSize: "3-5 members",
    duration: "6 hours",
    prizes: ["5,000 PKR First Prize", "3,000 PKR Second Prize", "2,000 PKR Third Prize", "Winning Prizes & Exciting Gifts"],
    requirements: [
      "Comfortable clothing and footwear",
      "Smartphone with camera",
      "Problem-solving skills",
      "Team coordination",
    ],
    schedule: [
      { time: "June 4, 9:00 AM", event: "Registration & Team Check-in" },
      { time: "June 4, 9:30 AM", event: "Rules Briefing" },
      { time: "June 4, 10:00 AM", event: "Hunt Begins" },
      { time: "June 4, 1:00 PM", event: "Checkpoint & Lunch" },
      { time: "June 4, 2:00 PM", event: "Hunt Continues" },
      { time: "June 4, 4:00 PM", event: "Hunt Ends" },
      { time: "June 4, 4:30 PM", event: "Results & Awards" },
    ],
  },
  "60-second-video": {
    title: "60 Second Video",
    description: "Create short 60-second videos to cover and creatively highlight various aspects of the event.",
    date: "June 3-4, 2025",
    location: "University Campus",
    teamSize: "1-2 members",
    duration: "2 days",
    prizes: ["Best Video Award", "Most Creative Award", "People's Choice Award"],
    requirements: [
      "Smartphone or camera for video recording",
      "Basic video editing skills",
      "Creativity and storytelling ability",
      "Understanding of event themes",
    ],
    schedule: [
      { time: "June 3, 9:00 AM", event: "Briefing & Theme Announcement" },
      { time: "June 3-4", event: "Video Creation Period" },
      { time: "June 4, 12:00 PM", event: "Submission Deadline" },
      { time: "June 4, 3:00 PM", event: "Video Showcase" },
      { time: "June 4, 4:00 PM", event: "Judging & Awards" },
    ],
  },
  "suffiyana": {
    title: "Suffiyana 2.0",
    description: "Sufi musical performances and Qawalli featuring renowned artists - Rs. 800",
    date: "June 3, 2025",
    location: "University Location (To be confirmed later)",
    teamSize: "N/A",
    duration: "3 hours",
    prizes: ["Cultural Experience"],
    requirements: [
      "Registration fee: Rs. 800",
      "CNIC required for registration",
      "Respect for cultural performances",
      "Punctuality",
    ],
    schedule: [
      { time: "June 3, 10:00 AM", event: "Opening Ceremony" },
      { time: "June 3, 5:30 PM", event: "Doors Open" },
      { time: "June 3, 6:00 PM", event: "Welcome Address" },
      { time: "June 3, 6:15 PM", event: "First Performance" },
      { time: "June 3, 7:30 PM", event: "Intermission" },
      { time: "June 3, 7:45 PM", event: "Main Performance" },
      { time: "June 3, 9:00 PM", event: "Closing" },
    ],
  },

  "eye-sight-camp": {
    title: "Eye Sight Camp",
    description: "Free eyesight testing camp for students by Dr. Anum.",
    date: "June 4, 2025",
    location: "University Health Center",
    teamSize: "N/A",
    duration: "7 hours",
    prizes: ["Free Eye Checkup"],
    requirements: [
      "University ID",
      "Registration for time slot",
    ],
    schedule: [
      { time: "June 4, 9:00 AM", event: "Camp Opens" },
      { time: "June 4, 9:15 AM", event: "First Appointments" },
      { time: "June 4, 12:30 PM", event: "Lunch Break" },
      { time: "June 4, 1:30 PM", event: "Afternoon Appointments" },
      { time: "June 4, 4:00 PM", event: "Camp Closes" },
    ],
  },
  "women-engineering-seminar": {
    title: "Women in Engineering Seminar",
    description: "Inspiring session to highlight the role of women in tech and society.",
    date: "June 3, 2025",
    location: "Main Auditorium",
    teamSize: "N/A",
    duration: "3 hours",
    prizes: ["Professional Development"],
    requirements: [
      "Registration for attendance",
      "Notebook for taking notes (optional)",
    ],
    schedule: [
      { time: "June 3, 9:30 AM", event: "Registration" },
      { time: "June 3, 10:00 AM", event: "Welcome Address" },
      { time: "June 3, 10:15 AM", event: "Keynote Speech" },
      { time: "June 3, 11:00 AM", event: "Panel Discussion" },
      { time: "June 3, 12:00 PM", event: "Q&A Session" },
      { time: "June 3, 12:45 PM", event: "Closing Remarks" },
      { time: "June 3, 1:00 PM", event: "Networking" },
    ],
  },
  "ai-seminar": {
    title: "Artificial Intelligence Seminar",
    description: "Seminar on Artificial Intelligence and Robotics by Dr. Nosherwan Shoaib.",
    date: "June 4, 2025",
    location: "Computer Science Building, Room 201",
    teamSize: "N/A",
    duration: "3 hours",
    prizes: ["Knowledge & Networking"],
    requirements: [
      "Registration for attendance",
      "Basic understanding of AI concepts (recommended)",
      "Notebook for taking notes (optional)",
    ],
    schedule: [
      { time: "June 4, 1:30 PM", event: "Registration" },
      { time: "June 4, 2:00 PM", event: "Introduction" },
      { time: "June 4, 2:15 PM", event: "Keynote by Dr. Nosherwan Shoaib" },
      { time: "June 4, 3:15 PM", event: "Break" },
      { time: "June 4, 3:30 PM", event: "Interactive Session" },
      { time: "June 4, 4:30 PM", event: "Q&A" },
      { time: "June 4, 5:00 PM", event: "Closing & Networking" },
    ],
  },
}

const CONTEST_PRICES = {
  "robo-war": {
    amount: 4500,
    currency: 'PKR',
    description: 'Robo War Competition Fee'
  },
  "e-sports": {
    amount: 1600,
    currency: 'PKR',
    description: 'E-Sports Tournament Fee'
  },

  "in-it-to-win-it": {
    amount: 500,
    currency: 'PKR',
    description: 'In It to Win It Activities Fee'
  },
  "speed-coding-with-ai": {
    amount: 400,
    currency: 'PKR',
    description: 'Speed Coding with AI Competition Fee'
  },

  "treasure-hunt": {
    amount: 1000,
    currency: 'PKR',
    description: 'Treasure Hunt Team Registration Fee'
  },
  "60-second-video": {
    amount: 0,
    currency: 'PKR',
    description: '60 Second Video Competition - Free'
  },
  "eye-sight-camp": {
    amount: 0,
    currency: 'PKR',
    description: 'Eye Sight Camp - Free'
  },
  "women-engineering-seminar": {
    amount: 0,
    currency: 'PKR',
    description: 'Women in Engineering Seminar - Free'
  },
  "ai-seminar": {
    amount: 0,
    currency: 'PKR',
    description: 'AI Seminar - Free'
  },
  "suffiyana": {
    amount: 800,
    currency: 'PKR',
    description: 'Suffiyana 2.0 - Cultural Event'
  }
}

export default function PortalPage() {
  const router = useRouter()
  const { user, loading, getUserParticipation } = useFirebase()

  const [participant, setParticipant] = useState<ParticipantData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const [selectedContest, setSelectedContest] = useState<string>("")

  // Set initial selected contest when participant data changes
  useEffect(() => {
    if (participant) {
      if (!selectedContest && participant.contests?.length > 0) {
        setSelectedContest(participant.contests[0]);
      } else if (!selectedContest && participant.contest) {
        setSelectedContest(participant.contest);
      }
    }
  }, [participant, selectedContest]);

  const reloadParticipant = async (updatedParticipant?: ParticipantData) => {
    // If an updated participant is provided, update the state immediately
    if (updatedParticipant) {
      console.log("Updating participant with local data:", updatedParticipant);
      setParticipant(updatedParticipant);
    }

    // Then fetch the latest data from the server
    if (user?.email) {
      try {
        console.log("Reloading participant data from server...");
        const data = await getUserParticipation(user.email);
        console.log("Reloaded participant data from server:", data);
        setParticipant(data);
      } catch (error) {
        console.error("Error fetching participant data:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
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

  // Check if the participant's registration is pending approval
  if (participant.approvalStatus === 'pending') {
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
                <CardTitle className="text-2xl font-bold text-center text-white">Registration Pending</CardTitle>
                <CardDescription className="text-center text-gray-300">
                  Your registration is awaiting admin approval.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                <div className="flex justify-center mb-4">
                  <Loader2 className="h-16 w-16 text-yellow-500 animate-spin" />
                </div>
                <p className="text-gray-300">
                  Thank you for registering for Tech Fusion 2.0. Your registration is currently under review by our admin team.
                </p>
                <p className="text-gray-300">
                  You'll receive full access to the participant portal once your registration is approved.
                </p>
                <p className="text-gray-300 text-sm mt-6">
                  This usually takes 24-48 hours. If you have any questions, please contact us at support@techfusion.com
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  // Check if the participant's registration was rejected
  if (participant.approvalStatus === 'rejected') {
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
                <CardTitle className="text-2xl font-bold text-center text-white">Registration Rejected</CardTitle>
                <CardDescription className="text-center text-gray-300">
                  We're sorry, but your registration was not approved.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                <div className="flex justify-center mb-4">
                  <XCircle className="h-16 w-16 text-red-500" />
                </div>

                {participant.rejectionReason ? (
                  <div className="bg-red-500/10 p-4 rounded-md border border-red-500/20 text-left mb-4">
                    <h3 className="text-white font-medium mb-2">Reason for rejection:</h3>
                    <p className="text-gray-300">{participant.rejectionReason}</p>
                  </div>
                ) : (
                  <p className="text-gray-300">
                    Your registration could not be approved at this time.
                  </p>
                )}

                <p className="text-gray-300 text-sm mt-6">
                  If you believe this is an error or would like to submit a new registration, please contact us at support@techfusion.com
                </p>

                <Button
                  onClick={() => router.push("/register")}
                  className="bg-lightBlue hover:bg-lightBlue/80 text-white mt-4"
                >
                  Register Again
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  // Get contest details based on selected contest or fallback to first available contest
  const contestToUse = selectedContest ||
    (participant.contests && participant.contests.length > 0 ? participant.contests[0] : participant.contest);

  const contest = contestDetails[contestToUse as keyof typeof contestDetails];

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
                <div className="flex flex-wrap gap-2 justify-end">
                  {participant.contests && participant.contests.length > 0 ? (
                    participant.contests.map(contestId => (
                      <Badge
                        key={contestId}
                        className={`text-white text-sm px-3 py-1 cursor-pointer ${
                          selectedContest === contestId ? 'bg-lightBlue' : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                        onClick={() => setSelectedContest(contestId)}
                      >
                        {contestId.charAt(0).toUpperCase() + contestId.slice(1).replace(/-/g, " ")}
                      </Badge>
                    ))
                  ) : participant.contest ? (
                    <Badge className="bg-lightBlue text-white text-sm px-3 py-1">
                      {participant.contest.charAt(0).toUpperCase() + participant.contest.slice(1).replace(/-/g, " ")}
                    </Badge>
                  ) : null}
                </div>
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

          {/* Team Members Section */}
          {participant.teamMembers && Object.keys(participant.teamMembers).length > 0 && (
            <Card className="glassmorphism border-lightBlue/20">
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                  <Users className="h-6 w-6 text-lightBlue" />
                  Team Information
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Your team members for registered contests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(participant.teamMembers).map(([contestId, members]) => (
                    <div key={contestId} className="bg-darkBlue/30 p-4 rounded-lg border border-lightBlue/20">
                      <div className="flex items-center gap-2 mb-4">
                        <Trophy className="h-5 w-5 text-lightBlue" />
                        <h3 className="text-lightBlue font-medium text-lg">
                          {contestId.replace(/-/g, ' ')} Team ({members.length + 1} members)
                        </h3>
                      </div>

                      {/* Team Leader */}
                      <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-green-400" />
                          <span className="text-green-400 font-medium">Team Leader</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-400">Name:</span>
                            <span className="text-white ml-2">{participant.name}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Roll Number:</span>
                            <span className="text-white ml-2">{participant.rollNumber}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Email:</span>
                            <span className="text-white ml-2">{participant.email}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Department:</span>
                            <span className="text-white ml-2">{participant.department}</span>
                          </div>
                        </div>
                      </div>

                      {/* Team Members */}
                      {members.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-gray-300 font-medium">Team Members:</h4>
                          {members.map((member, index) => (
                            <div key={index} className="p-3 bg-darkBlue/50 border border-gray-700 rounded">
                              <div className="flex items-center gap-2 mb-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-300">Member {index + 1}</span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-400">Name:</span>
                                  <span className="text-white ml-2">{member.name}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Roll Number:</span>
                                  <span className="text-white ml-2">{member.rollNumber}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Email:</span>
                                  <span className="text-white ml-2">{member.email}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Department:</span>
                                  <span className="text-white ml-2">{member.department}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="glassmorphism border-lightBlue/20">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl font-bold text-white">{contest.title}</CardTitle>
              <CardDescription className="text-gray-300">{contest.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-darkBlue/50 p-1.5 gap-2">
                  <TabsTrigger
                    value="details"
                    className="text-white px-1 py-1.5 md:px-2 md:py-2 text-xs md:text-base font-medium data-[state=active]:bg-lightBlue/20 data-[state=active]:text-white"
                  >
                    Details
                  </TabsTrigger>
                  <TabsTrigger
                    value="requirements"
                    className="text-white px-1 py-1.5 md:px-2 md:py-2 text-xs md:text-base font-medium data-[state=active]:bg-lightBlue/20 data-[state=active]:text-white"
                  >
                    <span className="hidden md:inline">Requirements</span>
                    <span className="md:hidden">Req.</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="schedule"
                    className="text-white px-1 py-1.5 md:px-2 md:py-2 text-xs md:text-base font-medium data-[state=active]:bg-lightBlue/20 data-[state=active]:text-white"
                  >
                    <span className="hidden md:inline">Schedule</span>
                    <span className="md:hidden">Sched.</span>
                  </TabsTrigger>
                  {(contestToUse === 'speed-coding-with-ai') && (
                    <TabsTrigger
                      value="questions"
                      className="text-white px-1 py-1.5 md:px-2 md:py-2 text-xs md:text-base font-medium data-[state=active]:bg-lightBlue/20 data-[state=active]:text-white"
                    >
                      <Code className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                      <span className="hidden md:inline">Questions</span>
                      <span className="md:hidden">Q.</span>
                    </TabsTrigger>
                  )}
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

                {(contestToUse === 'speed-coding-with-ai') && (
                  <TabsContent value="questions" className="mt-4">
                    <SimpleContestQuestions
                      contestType={contestToUse as 'speed-coding-with-ai'}
                      participant={participant}
                    />
                  </TabsContent>
                )}
              </Tabs>

              <div className="mt-8 flex justify-center">
                <Button
                  className="bg-lightBlue hover:bg-lightBlue/80 text-white"
                  disabled={isDownloading}
                  onClick={() => {
                    setIsDownloading(true);
                    import('@/lib/utils/pdf-generator').then(module => {
                      const { generateEventDetailsPDF } = module;
                      try {
                        // Get the contest details for the selected contest
                        const contestId = contestToUse || "speed-coding-with-ai"; // Fallback to speed-coding-with-ai if no contest is selected
                        const contestDetailsForPdf = contestDetails[contestId as keyof typeof contestDetails];

                        generateEventDetailsPDF(
                          contestId,
                          contestDetailsForPdf,
                          participant.name,
                          participant.email,
                          participant.rollNumber
                        );
                        toast.success('Event details downloaded successfully!');
                      } catch (error) {
                        console.error('Error generating PDF:', error);
                        toast.error('Failed to download event details. Please try again.');
                      } finally {
                        setIsDownloading(false);
                      }
                    }).catch(error => {
                      console.error('Error loading PDF generator:', error);
                      toast.error('Failed to load PDF generator. Please try again.');
                      setIsDownloading(false);
                    });
                  }}
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download Event Details
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <PaymentSection
          participant={participant}
          reloadParticipant={reloadParticipant}
          selectedContest={selectedContest}
          paymentDetails={
            // Check if the contest exists in CONTEST_PRICES, otherwise use a default
            CONTEST_PRICES[
              (selectedContest || participant.contest || participant.contests?.[0] || "speed-coding-with-ai") as keyof typeof CONTEST_PRICES
            ] || {
              amount: 1000,
              currency: 'PKR',
              description: 'Registration Fee'
            }
          }
        />
      </div>
    </div>
  )
}
