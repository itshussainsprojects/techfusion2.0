"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Linkedin, Twitter, Globe } from "lucide-react"
import Link from "next/link"

const speakers = [
  {
    name: "Dr. Sarah Chen",
    role: "AI Research Lead, Google",
    image: "/placeholder.svg?height=400&width=400",
    bio: "Leading researcher in artificial intelligence and machine learning with over 15 years of experience.",
    social: {
      linkedin: "#",
      twitter: "#",
      website: "#",
    },
  },
  {
    name: "Michael Rodriguez",
    role: "CTO, TechVentures",
    image: "/placeholder.svg?height=400&width=400",
    bio: "Serial entrepreneur and technology innovator specializing in blockchain and fintech solutions.",
    social: {
      linkedin: "#",
      twitter: "#",
      website: "#",
    },
  },
  {
    name: "Prof. Aisha Patel",
    role: "Robotics Department Chair",
    image: "/placeholder.svg?height=400&width=400",
    bio: "Award-winning academic with groundbreaking research in autonomous robotic systems.",
    social: {
      linkedin: "#",
      twitter: "#",
      website: "#",
    },
  },
  {
    name: "James Wilson",
    role: "Game Developer, Epic Games",
    image: "/placeholder.svg?height=400&width=400",
    bio: "Creative director behind several AAA game titles with expertise in immersive gaming experiences.",
    social: {
      linkedin: "#",
      twitter: "#",
      website: "#",
    },
  },
]

const SpeakersSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-darkBlue/80 to-darkBlue/70">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Featured Speakers</h2>
          <div className="w-20 h-1 bg-lightBlue mx-auto mb-6"></div>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Learn from industry experts and thought leaders in technology
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {speakers.map((speaker, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <Card className="bg-darkBlue/40 border border-gray-700 overflow-hidden h-full">
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={speaker.image || "/placeholder.svg"}
                      alt={speaker.name}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-darkBlue to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-xl font-bold text-white">{speaker.name}</h3>
                      <p className="text-lightBlue">{speaker.role}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-300 text-sm mb-4">{speaker.bio}</p>
                    <div className="flex space-x-3">
                      <Link
                        href={speaker.social.linkedin}
                        className="text-gray-400 hover:text-lightBlue transition-colors"
                      >
                        <Linkedin className="h-5 w-5" />
                      </Link>
                      <Link
                        href={speaker.social.twitter}
                        className="text-gray-400 hover:text-lightBlue transition-colors"
                      >
                        <Twitter className="h-5 w-5" />
                      </Link>
                      <Link
                        href={speaker.social.website}
                        className="text-gray-400 hover:text-lightBlue transition-colors"
                      >
                        <Globe className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SpeakersSection
