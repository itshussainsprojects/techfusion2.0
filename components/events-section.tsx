"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Music, Calendar, MapPin, Users } from "lucide-react"

const events = [
  {
    name: "Suffiyana 2.0",
    description: "Experience the magic of Sufi musical performances and Qawalli. Featuring renowned artists performing traditional Sufi music that will touch your soul and connect you to your cultural roots.",
    date: "June 3, 2025",
    time: "6:00 PM - 9:00 PM",
    location: "University Location (To be confirmed later)",
    capacity: "500 attendees",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    registerLink: "/register",
    color: "from-purple-600 to-pink-500",
    price: "Rs. 800"
  }
]

const EventsSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-darkBlue/70 to-darkBlue/80">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Cultural Events</h2>
          <div className="w-20 h-1 bg-lightBlue mx-auto mb-6"></div>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Immerse yourself in our vibrant cultural events celebrating music, poetry, and artistic expression
          </p>
        </motion.div>

        <div className="space-y-16">
          {events.map((event, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: index * 0.2 }}
              viewport={{ once: true }}
              className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 items-center`}
            >
              {/* Image Section */}
              <div className="md:w-1/2 w-full">
                <div className="relative group overflow-hidden rounded-xl">
                  <div className={`absolute inset-0 bg-gradient-to-r ${event.color} opacity-20 group-hover:opacity-30 transition-opacity duration-500`}></div>
                  <img
                    src={event.image}
                    alt={event.name}
                    className="w-full h-[400px] object-cover rounded-xl transform group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-darkBlue via-darkBlue/50 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex flex-wrap gap-3 mb-3">
                      <span className="bg-white/10 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {event.date}
                      </span>
                      <span className="bg-white/10 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm flex items-center">
                        <Music className="h-4 w-4 mr-1" />
                        {event.time}
                      </span>
                      {event.price && (
                        <span className="bg-lightBlue/20 backdrop-blur-sm text-lightBlue px-3 py-1 rounded-full text-sm flex items-center font-medium">
                          {event.price}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="md:w-1/2 w-full">
                <div className={`p-6 rounded-xl glassmorphism border-t-4 border-t-${event.color.split(' ')[1]} h-full`}>
                  <h3 className="text-3xl font-bold text-white mb-4">{event.name}</h3>
                  <p className="text-gray-300 mb-6 text-lg">{event.description}</p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-300">
                      <MapPin className="h-5 w-5 text-lightBlue mr-3" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Users className="h-5 w-5 text-lightBlue mr-3" />
                      <span>{event.capacity}</span>
                    </div>
                  </div>

                  <Link href={event.registerLink}>
                    <Button className={`bg-gradient-to-r ${event.color} hover:opacity-90 text-white px-6 py-3 rounded-md transition-all duration-300 w-full md:w-auto`}>
                      Register for {event.name}
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default EventsSection
