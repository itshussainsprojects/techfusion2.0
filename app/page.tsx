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
import EventsSection from "@/components/events-section"
import { ChevronDown, Calendar, Clock, MapPin, Trophy, Code, Cpu, Gamepad, Brain, Rocket, Video } from "lucide-react"

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

  // Event date - 27th of this month at 9:00 AM
  const currentDate = new Date()
  const eventDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 27, 9, 0, 0)

  const contests = [
    {
      title: "Robo War",
      description: "A robot battle showcasing engineering and innovation - Rs. 10,000",
      icon: <Cpu className="h-6 w-6" />,
      color: "from-green-500 to-teal-600",
      price: 10000,
      prize: "Rs. 25,000"
    },
    {
      title: "E-Sports",
      description: "Competitive video gaming in collaboration with Lavida - Rs. 1,600",
      icon: <Gamepad className="h-6 w-6" />,
      color: "from-red-500 to-orange-600",
      price: 1600,
      prize: "Exciting Prizes"
    },
    {
      title: "CTF / Cipher Hack",
      description: "Cybersecurity competition testing ethical hacking skills - Rs. 500",
      icon: <Brain className="h-6 w-6" />,
      color: "from-purple-500 to-pink-600",
      price: 500,
      prize: "Exciting Prizes"
    },
    {
      title: "In It to Win It",
      description: "Fun on-ground interactive activities and games - Rs. 500",
      icon: <Rocket className="h-6 w-6" />,
      color: "from-yellow-500 to-amber-600",
      price: 500,
      prize: "Rs. 5,000"
    },
    {
      title: "Speed Coding with AI",
      description: "Rapid problem-solving coding contest with AI tools - Rs. 400",
      icon: <Code className="h-6 w-6" />,
      color: "from-cyan-500 to-blue-600",
      price: 400,
      prize: "Rs. 3,000"
    },
    {
      title: "Devathon",
      description: "A 24-hour development marathon to build innovative solutions - Rs. 400",
      icon: <Code className="h-6 w-6" />,
      color: "from-indigo-500 to-violet-600",
      price: 400,
      prize: "Exciting Prizes"
    },
    {
      title: "Treasure Hunt",
      description: "Team-based adventure to find hidden treasures - Rs. 1,000 per team",
      icon: <MapPin className="h-6 w-6" />,
      color: "from-amber-500 to-orange-600",
      price: 1000,
      prize: "Exciting Prizes"
    },
    {
      title: "60 Second Video",
      description: "Create short videos highlighting various aspects of the event - Free",
      icon: <Video className="h-6 w-6" />,
      color: "from-pink-500 to-rose-600",
      price: 0,
      prize: "Recognition"
    },
  ]

  // Get current month name and year
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const currentMonth = monthNames[currentDate.getMonth()]
  const currentYear = currentDate.getFullYear()

  const timelineEvents = [
    {
      date: `${currentMonth} 15, ${currentYear}`,
      title: "Registration Opens",
      description: "Early bird registration begins for all contests",
    },
    {
      date: `${currentMonth} 25, ${currentYear}`,
      title: "Registration Closes",
      description: "Last day to register for Tech Fusion 2.0",
    },
    {
      date: `${currentMonth} 27, ${currentYear}`,
      title: "Opening Ceremony",
      description: "Official kickoff of Tech Fusion 2.0 with keynote speakers at 9:00 AM",
    },
    {
      date: `${currentMonth} 27-29, ${currentYear}`,
      title: "Contest Days",
      description: "All contests run simultaneously across campus venues",
    },
    {
      date: `${currentMonth} 29, ${currentYear}`,
      title: "Awards Ceremony",
      description: "Announcement of winners and prize distribution",
    },
  ]

  return (
    <div className="relative">
      {/* Hero Section */}
      <section
        ref={targetRef}
        className="relative h-screen flex items-center justify-center overflow-hidden bg-darkBlue pt-16 md:pt-0"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/30 via-purple-900/30 to-darkBlue"></div>
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-darkBlue to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-darkBlue to-transparent"></div>
          <ParticlesBackground />
        </div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />

        <motion.div
          className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 blur-xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />

        <motion.div
          className="absolute top-1/3 right-1/3 w-24 h-24 rounded-full bg-gradient-to-br from-pink-500/20 to-red-500/20 blur-xl"
          animate={{
            x: [0, 20, 0],
            y: [0, 20, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />

        <motion.div style={{ opacity, scale, y }} className="container mx-auto px-4 text-center z-10 flex flex-col justify-center min-h-[80vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.1 }}
            className="mb-6 relative inline-block mt-8 sm:mt-0"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-lg blur-xl opacity-75 animate-pulse"></div>
            <h1 className="relative text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold px-4 sm:px-8 py-3 sm:py-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-lightBlue to-purple-400">
                Tech Fusion 2.0
              </span>
            </h1>
          </motion.div>

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
            className="flex flex-col sm:flex-row items-center justify-center gap-4 px-2 sm:px-4"
          >
            <Button
              onClick={scrollToRegistration}
              className="bg-gradient-to-r from-blue-600 to-lightBlue hover:from-blue-700 hover:to-lightBlue/90 text-white px-8 py-6 text-lg rounded-md shadow-lg hover:shadow-xl transition-all duration-300 relative group overflow-hidden"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-lightBlue to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></span>
              <span className="relative flex items-center">
                Register Now
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </Button>

            <Link href="#events">
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-md transition-all duration-300"
              >
                Explore Events
              </Button>
            </Link>
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
            className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors cursor-pointer"
          >
            <ChevronDown className="h-8 w-8 text-white" />
          </motion.div>
        </motion.div>
      </section>

      {/* Event Overview Section */}
      <section className="py-20 bg-gradient-to-b from-darkBlue to-darkBlue/90 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/30 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/30 rounded-full filter blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Event Overview</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-lightBlue mx-auto mb-6"></div>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Tech Fusion 2.0 is a multi-day technology event featuring competitions, workshops, and networking
              opportunities for students and tech enthusiasts.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="glassmorphism rounded-xl p-8 text-white border border-white/5 hover:border-lightBlue/30 transition-all duration-300 shadow-lg hover:shadow-lightBlue/20"
            >
              <div className="bg-gradient-to-br from-blue-500/20 to-lightBlue/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6 mx-auto">
                <Calendar className="h-8 w-8 text-lightBlue" />
              </div>
              <h3 className="text-xl font-bold text-center mb-4">June 27-29, 2025</h3>
              <p className="text-gray-300 text-center">Three days of tech innovation, competitions, cultural events, and networking opportunities.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="glassmorphism rounded-xl p-8 text-white border border-white/5 hover:border-lightBlue/30 transition-all duration-300 shadow-lg hover:shadow-lightBlue/20"
            >
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6 mx-auto">
                <MapPin className="h-8 w-8 text-lightBlue" />
              </div>
              <h3 className="text-xl font-bold text-center mb-4">University Campus</h3>
              <p className="text-gray-300 text-center">Hosted across multiple venues throughout the university campus, including the CS Labs and Computer Science Building.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="glassmorphism rounded-xl p-8 text-white border border-white/5 hover:border-lightBlue/30 transition-all duration-300 shadow-lg hover:shadow-lightBlue/20"
            >
              <div className="bg-gradient-to-br from-amber-500/20 to-red-500/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6 mx-auto">
                <Trophy className="h-8 w-8 text-lightBlue" />
              </div>
              <h3 className="text-xl font-bold text-center mb-4">Amazing Prizes</h3>
              <p className="text-gray-300 text-center">Compete for cash prizes, internship opportunities, tech gadgets, and recognition from industry leaders.</p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <Link href="/register">
              <Button className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 px-6 py-3 rounded-md transition-all duration-300">
                Learn More About Tech Fusion 2.0
              </Button>
            </Link>
          </motion.div>
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
                <Card className="bg-darkBlue/40 border border-gray-700 overflow-hidden h-full hover:border-lightBlue/30 transition-all duration-300 shadow-lg hover:shadow-lightBlue/20">
                  <div className={`h-2 bg-gradient-to-r ${contest.color}`}></div>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-white">{contest.title}</CardTitle>
                      <div className="p-2 rounded-full bg-gray-800 text-white">{contest.icon}</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-300 mb-4">{contest.description}</CardDescription>
                    {contest.prize && (
                      <div className="flex items-center mt-2 bg-lightBlue/10 p-2 rounded-md">
                        <Trophy className="h-4 w-4 text-lightBlue mr-2" />
                        <span className="text-sm text-lightBlue font-medium">Prize: {contest.prize}</span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    {contest.title === "CTF / Cipher Hack" ? (
                      <Link href="https://ciphers.cyberburgs.com/" target="_blank" rel="noopener noreferrer" className="w-full">
                        <Button
                          variant="outline"
                          className="w-full border-lightBlue text-lightBlue hover:bg-lightBlue hover:text-white"
                        >
                          Register on Cyberburgs
                        </Button>
                      </Link>
                    ) : contest.title === "E-Sports" ? (
                      <Link href="https://forms.gle/gWZ7YWMZubRyHhySA" target="_blank" rel="noopener noreferrer" className="w-full">
                        <Button
                          variant="outline"
                          className="w-full border-lightBlue text-lightBlue hover:bg-lightBlue hover:text-white"
                        >
                          Register on Google Forms
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/register" className="w-full">
                        <Button
                          variant="outline"
                          className="w-full border-lightBlue text-lightBlue hover:bg-lightBlue hover:text-white"
                        >
                          Register Now
                        </Button>
                      </Link>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Speakers Section */}
      <SpeakersSection />

      {/* Cultural Events Section */}
      <EventsSection />

      {/* Timeline Section */}
      <section id="timeline" className="py-20 bg-gradient-to-b from-darkBlue/80 to-darkBlue/70 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Event Timeline</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-lightBlue mx-auto mb-6"></div>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Mark your calendar for these important dates and events.
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline Progress Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-700 hidden md:block">
              <motion.div
                className="absolute top-0 left-0 w-full bg-lightBlue animate-timeline-glow"
                initial={{ height: "0%" }}
                whileInView={{ height: "100%" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                viewport={{ once: true }}
              />
            </div>

            {/* Mobile Timeline - Only visible on small screens */}
            <div className="md:hidden mb-12">
              {timelineEvents.map((event, index) => {
                // Determine which icon to use based on the event title
                let EventIcon = Clock;
                if (event.title.includes("Registration Opens")) EventIcon = Calendar;
                else if (event.title.includes("Registration Closes")) EventIcon = Calendar;
                else if (event.title.includes("Opening Ceremony")) EventIcon = Calendar;
                else if (event.title.includes("Contest Days")) EventIcon = Trophy;
                else if (event.title.includes("Awards")) EventIcon = Trophy;

                return (
                  <motion.div
                    key={`mobile-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="relative pl-8 pb-10 border-l-2 border-lightBlue/30 last:border-transparent"
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-lightBlue animate-pulse"></div>

                    <motion.div
                      whileHover={{ scale: 1.02, y: -3 }}
                      className="glassmorphism p-5 rounded-lg border border-white/10 hover:border-lightBlue/30 transition-all duration-300"
                    >
                      <div className="flex items-center mb-3">
                        <div className="bg-lightBlue/20 p-2 rounded-full mr-3">
                          <EventIcon className="h-5 w-5 text-lightBlue" />
                        </div>
                        <h4 className="text-lg font-medium text-lightBlue">{event.date}</h4>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                      <p className="text-gray-300">{event.description}</p>

                      <div className="mt-4 pt-3 border-t border-white/10">
                        <div className="flex items-center text-lightBlue text-sm">
                          <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-blue-500 to-lightBlue"
                              initial={{ width: "0%" }}
                              whileInView={{ width: "100%" }}
                              transition={{ duration: 1, delay: 0.3 }}
                              viewport={{ once: true }}
                            />
                          </div>
                          <span className="ml-2 whitespace-nowrap font-medium">
                            {new Date(event.date) < new Date() ? "Completed" : "Coming soon"}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>

            {/* Desktop Timeline Events - Hidden on mobile */}
            <div className="hidden md:block space-y-16 md:space-y-24 relative">
              {timelineEvents.map((event, index) => {
                // Determine which icon to use based on the event title
                let EventIcon = Clock;
                if (event.title.includes("Registration Opens")) EventIcon = Calendar;
                else if (event.title.includes("Registration Closes")) EventIcon = Calendar;
                else if (event.title.includes("Opening Ceremony")) EventIcon = Calendar;
                else if (event.title.includes("Contest Days")) EventIcon = Trophy;
                else if (event.title.includes("Awards")) EventIcon = Trophy;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: index * 0.15 }}
                    viewport={{ once: true }}
                    className={`flex flex-col md:flex-row items-center ${
                      index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    <div className={`md:w-1/2 mb-6 md:mb-0 flex ${
                      index % 2 === 0 ? "justify-center md:justify-end md:pr-8" : "justify-center md:justify-start md:pl-8"
                    }`}>
                      <motion.div
                        whileHover={{
                          scale: 1.03,
                          boxShadow: "0 0 15px rgba(11, 94, 215, 0.3)",
                          borderColor: "rgba(11, 94, 215, 0.5)",
                          y: -5
                        }}
                        initial={{
                          opacity: 0,
                          x: index % 2 === 0 ? -20 : 20
                        }}
                        whileInView={{
                          opacity: 1,
                          x: 0
                        }}
                        transition={{
                          duration: 0.7,
                          delay: index * 0.1,
                          type: "spring",
                          stiffness: 100
                        }}
                        viewport={{ once: true }}
                        className={`glassmorphism p-6 rounded-xl max-w-md border border-white/10 transition-all duration-300 hover:border-lightBlue/30 ${
                          index % 2 === 0 ? "md:text-right" : "md:text-left"
                        }`}
                        style={{
                          transformStyle: "preserve-3d",
                          perspective: "1000px"
                        }}
                      >
                        <div className={`flex items-center mb-3 ${
                          index % 2 === 0 ? "justify-start md:justify-end" : "justify-start"
                        }`}>
                          <div className="bg-lightBlue/20 p-2 rounded-full mr-3 md:order-1">
                            <EventIcon className="h-5 w-5 text-lightBlue" />
                          </div>
                          <h4 className="text-lg font-medium text-lightBlue">{event.date}</h4>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">{event.title}</h3>
                        <p className="text-gray-300">{event.description}</p>

                        {/* Interactive element - only visible on hover */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          whileHover={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-4 pt-4 border-t border-white/10"
                        >
                          <div className="flex items-center text-lightBlue text-sm">
                            <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-blue-500 to-lightBlue animate-timeline-glow"
                                initial={{ width: "0%" }}
                                whileInView={{ width: "100%" }}
                                transition={{ duration: 1, delay: 0.5 }}
                                viewport={{ once: true }}
                              />
                            </div>
                            <span className="ml-2 whitespace-nowrap font-medium">
                              {new Date(event.date) < new Date() ? "Completed" : "Coming soon"}
                            </span>
                          </div>
                        </motion.div>
                      </motion.div>
                    </div>

                    {/* Timeline Node */}
                    <div className="hidden md:flex items-center justify-center z-10">
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.2 }}
                        viewport={{ once: true }}
                        whileHover={{ scale: 1.2 }}
                        className="relative cursor-pointer"
                      >
                        <div className="absolute -inset-4 bg-lightBlue rounded-full opacity-20 animate-timeline-pulse"></div>
                        <div className="w-10 h-10 rounded-full bg-darkBlue border-2 border-lightBlue flex items-center justify-center relative z-10 shadow-lg">
                          <EventIcon className="h-4 w-4 text-lightBlue" />
                        </div>
                      </motion.div>
                    </div>

                    {/* Empty Space for Alternating Layout */}
                    <div className="md:w-1/2"></div>
                  </motion.div>
                );
              })}
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
