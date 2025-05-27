"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Zap, Star, Rocket, Code, Trophy } from "lucide-react"

interface Particle {
  id: number
  x: number
  y: number
  color: string
  icon: React.ReactNode
  delay: number
}

export default function InteractiveFAB() {
  const [isHovered, setIsHovered] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  const [showParticles, setShowParticles] = useState(false)

  const icons = [
    <Sparkles key="sparkles" className="h-4 w-4" />,
    <Zap key="zap" className="h-4 w-4" />,
    <Star key="star" className="h-4 w-4" />,
    <Rocket key="rocket" className="h-4 w-4" />,
    <Code key="code" className="h-4 w-4" />,
    <Trophy key="trophy" className="h-4 w-4" />
  ]

  const colors = [
    "text-blue-400",
    "text-purple-400", 
    "text-pink-400",
    "text-cyan-400",
    "text-yellow-400",
    "text-green-400"
  ]

  useEffect(() => {
    if (isHovered) {
      const newParticles: Particle[] = []
      for (let i = 0; i < 12; i++) {
        const angle = (i * 30) * (Math.PI / 180)
        const radius = 60 + Math.random() * 40
        newParticles.push({
          id: i,
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          color: colors[Math.floor(Math.random() * colors.length)],
          icon: icons[Math.floor(Math.random() * icons.length)],
          delay: i * 0.05
        })
      }
      setParticles(newParticles)
      setShowParticles(true)
    } else {
      setShowParticles(false)
    }
  }, [isHovered])

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <motion.div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Floating particles */}
        <AnimatePresence>
          {showParticles && particles.map((particle) => (
            <motion.div
              key={particle.id}
              className={`absolute pointer-events-none ${particle.color}`}
              initial={{ 
                x: 0, 
                y: 0, 
                opacity: 0, 
                scale: 0,
                rotate: 0
              }}
              animate={{ 
                x: particle.x, 
                y: particle.y, 
                opacity: [0, 1, 0],
                scale: [0, 1.2, 0],
                rotate: [0, 360, 720]
              }}
              exit={{ 
                opacity: 0, 
                scale: 0,
                transition: { duration: 0.2 }
              }}
              transition={{
                duration: 2,
                delay: particle.delay,
                ease: "easeOut",
                repeat: Infinity,
                repeatDelay: 1
              }}
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              {particle.icon}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Main FAB */}
        <motion.button
          className="relative w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg overflow-hidden group"
          whileHover={{ 
            scale: 1.1,
            boxShadow: "0 0 30px rgba(59, 130, 246, 0.6)"
          }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: [
              "0 0 20px rgba(59, 130, 246, 0.3)",
              "0 0 40px rgba(147, 51, 234, 0.5)",
              "0 0 20px rgba(59, 130, 246, 0.3)"
            ]
          }}
          transition={{
            boxShadow: {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        >
          {/* Animated background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100"
            transition={{ duration: 0.3 }}
          />
          
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ["-100%", "100%"]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
              ease: "easeInOut"
            }}
          />

          {/* Icon */}
          <motion.div
            className="relative z-10 flex items-center justify-center h-full text-white"
            animate={{
              rotate: isHovered ? 360 : 0
            }}
            transition={{ duration: 0.5 }}
          >
            <Rocket className="h-6 w-6" />
          </motion.div>

          {/* Ripple effect on click */}
          <motion.div
            className="absolute inset-0 bg-white/30 rounded-full"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 0, opacity: 1 }}
            whileTap={{ 
              scale: 2, 
              opacity: 0,
              transition: { duration: 0.4 }
            }}
          />
        </motion.button>

        {/* Tooltip */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-black/80 text-white text-sm rounded-lg whitespace-nowrap"
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              Back to Top
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80"></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Orbital rings */}
        <motion.div
          className="absolute inset-0 border-2 border-blue-400/30 rounded-full pointer-events-none"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{
            rotate: { duration: 8, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{
            width: '80px',
            height: '80px',
            left: '-8px',
            top: '-8px'
          }}
        />

        <motion.div
          className="absolute inset-0 border border-purple-400/20 rounded-full pointer-events-none"
          animate={{
            rotate: [360, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{
            rotate: { duration: 12, repeat: Infinity, ease: "linear" },
            scale: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
          }}
          style={{
            width: '100px',
            height: '100px',
            left: '-18px',
            top: '-18px'
          }}
        />
      </motion.div>
    </div>
  )
}
