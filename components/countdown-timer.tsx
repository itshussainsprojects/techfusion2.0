"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

type CountdownProps = {
  targetDate: Date
  onComplete?: () => void
}

const CountdownTimer = ({ targetDate, onComplete }: CountdownProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime()

      if (difference <= 0) {
        setIsComplete(true)
        if (onComplete) onComplete()
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        }
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate, onComplete])

  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-4">
        <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
          {isComplete ? "Event Has Started!" : "Event Starts In"}
        </h3>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <TimeUnit value={timeLeft.days} label="Days" />
        <TimeUnit value={timeLeft.hours} label="Hours" />
        <TimeUnit value={timeLeft.minutes} label="Minutes" />
        <TimeUnit value={timeLeft.seconds} label="Seconds" />
      </div>
    </div>
  )
}

const TimeUnit = ({ value, label }: { value: number; label: string }) => {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center"
    >
      <div className="glassmorphism w-20 h-20 md:w-24 md:h-24 rounded-lg flex items-center justify-center neon-border">
        <motion.span
          key={value}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          className="text-2xl md:text-3xl font-bold text-white"
        >
          {value.toString().padStart(2, "0")}
        </motion.span>
      </div>
      <span className="text-sm mt-2 text-gray-300">{label}</span>
    </motion.div>
  )
}

export default CountdownTimer
