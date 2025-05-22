"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Linkedin, Twitter, Globe } from "lucide-react"
import Link from "next/link"

const seminars = [
  {
    name: "Women in Engineering Seminar",
    date: "June 27, 2023",
    time: "10:00 AM - 1:00 PM",
    location: "Main Auditorium",
    image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Join us for an inspiring session highlighting the role of women in tech and society. Hear from accomplished female engineers about their journeys, challenges, and achievements in the industry.",
    speakers: [
      "Dr. Amina Khan - Electrical Engineering Professor",
      "Eng. Fatima Ahmed - Senior Software Engineer at Systems Limited",
     
    ],
    registerLink: "/register",
    price: "Free"
  },
  {
    name: "Artificial Intelligence Seminar",
    date: "June 27, 2023",
    time: "2:00 PM - 5:00 PM",
    location: "Computer Science Building, Room 201",
    image: "https://images.unsplash.com/photo-1591453089816-0fbb971b454c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Seminar on Artificial Intelligence and Robotics by Dr. Nosherwan Shoaib. This seminar will cover recent breakthroughs, ethical considerations, and future directions in AI research.",
    speakers: [
      "Dr. Nosherwan Shoaib - AI and Robotics Expert",
      "Prof. Muhammad Ali - AI Research Lead",
      "Dr. Lisa Chen - Machine Learning Expert"
    ],
    registerLink: "/register",
    price: "Free"
  },
  {
    name: "Eye Sight Camp",
    date: "June 29, 2023",
    time: "9:00 AM - 4:00 PM",
    location: "University Health Center",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Free eyesight testing camp for students by Dr. Anum. Get your vision checked and receive professional advice on eye care and health.",
    speakers: [
      "Dr. Anum - Ophthalmologist",
      "University Health Services Team"
    ],
    registerLink: "/register",
    price: "Free"
  }
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Featured Seminars</h2>
          <div className="w-20 h-1 bg-lightBlue mx-auto mb-6"></div>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Join our exclusive seminars led by industry experts and thought leaders
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {seminars.map((seminar, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="h-full"
            >
              <Card className="bg-darkBlue/40 border border-gray-700 overflow-hidden h-full hover:border-lightBlue/50 transition-all duration-300 shadow-lg hover:shadow-lightBlue/20">
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={seminar.image}
                      alt={seminar.name}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-darkBlue via-darkBlue/70 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-2xl font-bold text-white mb-2">{seminar.name}</h3>
                      <div className="flex flex-wrap gap-3 mb-3">
                        <span className="bg-lightBlue/20 text-lightBlue px-3 py-1 rounded-full text-sm">
                          {seminar.date}
                        </span>
                        <span className="bg-lightBlue/20 text-lightBlue px-3 py-1 rounded-full text-sm">
                          {seminar.time}
                        </span>
                        <span className="bg-lightBlue/20 text-lightBlue px-3 py-1 rounded-full text-sm">
                          {seminar.location}
                        </span>
                        {seminar.price && (
                          <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                            {seminar.price}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-300 mb-4">{seminar.description}</p>

                    <div className="mb-6">
                      <h4 className="text-white font-semibold mb-2">Featured Speakers:</h4>
                      <ul className="space-y-1">
                        {seminar.speakers.map((speaker, idx) => (
                          <li key={idx} className="text-gray-300 flex items-start">
                            <span className="text-lightBlue mr-2">•</span>
                            <span>{speaker}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Link href={seminar.registerLink}>
                      <button className="w-full bg-lightBlue hover:bg-lightBlue/80 text-white py-3 px-4 rounded-md transition-all duration-300 font-medium flex items-center justify-center group">
                        Register for this Seminar
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </Link>
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
