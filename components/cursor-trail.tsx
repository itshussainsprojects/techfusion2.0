"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface TrailPoint {
  id: number
  x: number
  y: number
  timestamp: number
}

export default function CursorTrail() {
  const [trail, setTrail] = useState<TrailPoint[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const trailRef = useRef<TrailPoint[]>([])
  const animationRef = useRef<number>()

  useEffect(() => {
    let mouseX = 0
    let mouseY = 0
    let isMouseMoving = false

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      isMouseMoving = true
      setIsVisible(true)

      // Add new point to trail
      const newPoint: TrailPoint = {
        id: Date.now() + Math.random(),
        x: mouseX,
        y: mouseY,
        timestamp: Date.now()
      }

      trailRef.current = [...trailRef.current, newPoint].slice(-15) // Keep last 15 points
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
      isMouseMoving = false
    }

    const updateTrail = () => {
      const now = Date.now()
      // Remove old points (older than 1 second)
      trailRef.current = trailRef.current.filter(point => now - point.timestamp < 1000)
      
      setTrail([...trailRef.current])

      if (isMouseMoving) {
        isMouseMoving = false
      } else if (trailRef.current.length === 0) {
        setIsVisible(false)
      }

      animationRef.current = requestAnimationFrame(updateTrail)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    animationRef.current = requestAnimationFrame(updateTrail)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {trail.map((point, index) => {
          const age = Date.now() - point.timestamp
          const opacity = Math.max(0, 1 - age / 1000) // Fade out over 1 second
          const scale = Math.max(0.1, 1 - age / 1000)
          const delay = index * 0.02

          return (
            <motion.div
              key={point.id}
              className="absolute w-3 h-3 rounded-full pointer-events-none"
              style={{
                left: point.x - 6,
                top: point.y - 6,
                background: `radial-gradient(circle, rgba(59, 130, 246, ${opacity * 0.8}) 0%, rgba(147, 51, 234, ${opacity * 0.4}) 50%, transparent 100%)`,
              }}
              initial={{ 
                scale: 0, 
                opacity: 0,
                rotate: 0
              }}
              animate={{ 
                scale: scale,
                opacity: opacity,
                rotate: 360
              }}
              exit={{ 
                scale: 0, 
                opacity: 0,
                transition: { duration: 0.2 }
              }}
              transition={{
                duration: 0.3,
                delay: delay,
                ease: "easeOut"
              }}
            >
              {/* Inner glow */}
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, rgba(255, 255, 255, ${opacity * 0.6}) 0%, transparent 70%)`,
                  filter: 'blur(1px)'
                }}
              />
              
              {/* Sparkle effect for first few points */}
              {index < 3 && (
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.5, 1]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div 
                    className="absolute w-1 h-1 bg-white rounded-full"
                    style={{
                      top: '-2px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      opacity: opacity
                    }}
                  />
                  <div 
                    className="absolute w-1 h-1 bg-white rounded-full"
                    style={{
                      bottom: '-2px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      opacity: opacity
                    }}
                  />
                  <div 
                    className="absolute w-1 h-1 bg-white rounded-full"
                    style={{
                      left: '-2px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      opacity: opacity
                    }}
                  />
                  <div 
                    className="absolute w-1 h-1 bg-white rounded-full"
                    style={{
                      right: '-2px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      opacity: opacity
                    }}
                  />
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Main cursor enhancement */}
      {trail.length > 0 && (
        <motion.div
          className="absolute w-8 h-8 rounded-full pointer-events-none"
          style={{
            left: trail[trail.length - 1]?.x - 16,
            top: trail[trail.length - 1]?.y - 16,
          }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360]
          }}
          transition={{
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 4, repeat: Infinity, ease: "linear" }
          }}
        >
          <div className="absolute inset-0 rounded-full border-2 border-blue-400/50 animate-pulse" />
          <div className="absolute inset-2 rounded-full border border-purple-400/30" />
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
            }}
          />
        </motion.div>
      )}
    </div>
  )
}
