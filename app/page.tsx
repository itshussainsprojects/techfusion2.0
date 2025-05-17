"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import ParticlesBackground from "@/components/particles-background"
import CountdownTimer from "@/components/countdown-timer"
import FAQSection from "@/components/faq-section"
import SpeakersSection from "@/components/speakers-section"
import { ChevronDown, Calendar, Clock, MapPin, Trophy, Code, Cpu, Gamepad, Brain, Rocket } from "lucide-react"

export default function Home() {
  const targetRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100])

  const scrollToRegistration = () => {
    const element = document.getElementById("register-section")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    } else {
      window.location.href = "/register"
    }
  }

  // Event date - August 1, 2025
  const eventDate = new Date("2025-08-01T09:00:00")

  const contests = [
    {
      title: "Hackathon",
      description: "24-hour coding challenge to build innovative solutions",
      icon: <Code className="h-6 w-6" />,
      color: "from-blue-500 to-purple-600",
    },
    {
      title: "Robotics",
      description: "Design and program robots to complete specific tasks",
      icon: <Cpu className="h-6 w-6" />,
      color: "from-green-500 to-teal-600",
    },
    {
      title: "Gaming",
      description: "Competitive gaming tournaments across popular titles",
      icon: <Gamepad className="h-6 w-6" />,
      color: "from-red-500 to-orange-600",
    },
    {
      title: "AI Challenge",
      description: "Develop AI solutions for real-world problems",
      icon: <Brain className="h-6 w-6" />,
      color: "from-purple-500 to-pink-600",
    },
    {
      title: "Startup Pitch",
      description: "Present your tech startup idea to industry experts",
      icon: <Rocket className="h-6 w-6" />,
      color: "from-yellow-500 to-amber-600",
    },
  ]

  const timelineEvents = [
    {
      date: "June 1, 2025",
      title: "Registration Opens",
      description: "Early bird registration begins for all contests",
    },
    {
      date: "July 15, 2025",
      title: "Registration Closes",
      description: "Last day to register for Tech Fusion 2.0",
    },
    {
      date: "August 1, 2025",
      title: "Opening Ceremony",
      description: "Official kickoff of Tech Fusion 2.0 with keynote speakers",
    },
    {
      date: "August 2-3, 2025",
      title: "Contest Days",
      description: "All contests run simultaneously across campus venues",
    },
    {
      date: "August 4, 2025",
      title: "Awards Ceremony",
      description: "Announcement of winners and prize distribution",
    },
  ]

  return (
    <div className="relative">
      {/* Hero Section */}
      <section
        ref={targetRef}
        className="relative h-screen flex items-center justify-center overflow-hidden bg-darkBlue"
      >
        <ParticlesBackground />
        <motion.div style={{ opacity, scale, y }} className="container mx-auto px-4 text-center z-10">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white"
          >
            <span className="gradient-text">Tech Fusion 2.0</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl mb-8 text-gray-300 max-w-3xl mx-auto"
          >
            Where innovation meets technology. Join us for the biggest tech event of the year organized by IEEE SSCIT.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-12"
          >
            <CountdownTimer targetDate={eventDate} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Button
              onClick={scrollToRegistration}
              className="bg-lightBlue hover:bg-lightBlue/80 text-white px-8 py-6 text-lg rounded-md shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
            >
              Register Now
            </Button>
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatType: "loop" }}
          >
            <ChevronDown className="h-8 w-8 text-white/70" />
          </motion.div>
        </motion.div>
      </section>

      {/* Event Overview Section */}
      <section className="py-20 bg-gradient-to-b from-darkBlue to-darkBlue/90">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Event Overview</h2>
            <div className="w-20 h-1 bg-lightBlue mx-auto mb-6"></div>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Tech Fusion 2.0 is a multi-day technology event featuring competitions, workshops, and networking
              opportunities for students and tech enthusiasts.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="glassmorphism rounded-lg p-6 text-white"
            >
              <div className="flex items-center mb-4">
                <Calendar className="h-6 w-6 text-lightBlue mr-3" />
                <h3 className="text-xl font-bold">August 1-4, 2025</h3>
              </div>
              <p className="text-gray-300">Four days of tech innovation, competitions, and networking opportunities.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="glassmorphism rounded-lg p-6 text-white"
            >
              <div className="flex items-center mb-4">
                <MapPin className="h-6 w-6 text-lightBlue mr-3" />
                <h3 className="text-xl font-bold">University Campus</h3>
              </div>
              <p className="text-gray-300">Hosted across multiple venues throughout the university campus.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="glassmorphism rounded-lg p-6 text-white"
            >
              <div className="flex items-center mb-4">
                <Trophy className="h-6 w-6 text-lightBlue mr-3" />
                <h3 className="text-xl font-bold">$10,000 in Prizes</h3>
              </div>
              <p className="text-gray-300">Compete for cash prizes, internship opportunities, and tech gadgets.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contests Section */}
      <section id="events" className="py-20 bg-gradient-to-b from-darkBlue/90 to-darkBlue/80">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Contests</h2>
            <div className="w-20 h-1 bg-lightBlue mx-auto mb-6"></div>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Participate in cutting-edge technology competitions designed to challenge your skills and creativity.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {contests.map((contest, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
              >
                <Card className="bg-darkBlue/40 border border-gray-700 overflow-hidden h-full">
                  <div className={`h-2 bg-gradient-to-r ${contest.color}`}></div>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-white">{contest.title}</CardTitle>
                      <div className="p-2 rounded-full bg-gray-800 text-white">{contest.icon}</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-300">{contest.description}</CardDescription>
                  </CardContent>
                  <CardFooter>
                    <Link href="/register">
                      <Button
                        variant="outline"
                        className="w-full border-lightBlue text-lightBlue hover:bg-lightBlue hover:text-white"
                      >
                        Register
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Speakers Section */}
      <SpeakersSection />

      {/* Timeline Section */}
      <section id="timeline" className="py-20 bg-gradient-to-b from-darkBlue/80 to-darkBlue/70">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Event Timeline</h2>
            <div className="w-20 h-1 bg-lightBlue mx-auto mb-6"></div>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Mark your calendar for these important dates and events.
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-lightBlue/30 hidden md:block"></div>

            {/* Timeline Events */}
            <div className="space-y-12 relative">
              {timelineEvents.map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`flex flex-col md:flex-row items-center ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  <div className="md:w-1/2 mb-4 md:mb-0 flex justify-center md:justify-end md:pr-8">
                    <div
                      className={`glassmorphism p-6 rounded-lg max-w-md ${
                        index % 2 === 0 ? "md:text-right" : "md:text-left md:ml-8"
                      }`}
                    >
                      <div className="flex items-center mb-2 justify-start md:justify-end">
                        <Clock className="h-5 w-5 text-lightBlue mr-2" />
                        <h4 className="text-lg font-medium text-lightBlue">{event.date}</h4>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                      <p className="text-gray-300">{event.description}</p>
                    </div>
                  </div>

                  {/* Timeline Dot */}
                  <div className="hidden md:flex items-center justify-center z-10">
                    <div className="w-6 h-6 rounded-full bg-lightBlue animate-pulse"></div>
                  </div>

                  {/* Empty Space for Alternating Layout */}
                  <div className="md:w-1/2"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Register Section */}
      <section id="register-section" className="py-20 bg-gradient-to-b from-darkBlue/70 to-darkBlue">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Ready to Join?</h2>
            <div className="w-20 h-1 bg-lightBlue mx-auto mb-6"></div>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-8">
              Register now to secure your spot in Tech Fusion 2.0. Limited seats available for each contest.
            </p>
            <Link href="/register">
              <Button className="bg-lightBlue hover:bg-lightBlue/80 text-white px-8 py-6 text-lg rounded-md shadow-lg hover:shadow-xl transition-all duration-300 neon-border">
                Register Now
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
