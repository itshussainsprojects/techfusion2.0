'use client'

import { useState } from 'react'
import { useFirebase } from '@/lib/firebase/firebase-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface PaymentSectionProps {
  participant: any // ParticipantData
  reloadParticipant: () => void
  paymentDetails: {
    amount: number
    currency: string
    description: string
  }
}

const WHATSAPP_NUMBER = '923001234567' // sample Pakistani number

export default function PaymentSection({ participant, reloadParticipant, paymentDetails }: PaymentSectionProps) {
  const { user, updateParticipant } = useFirebase()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string>('')

  const handleMarkPaid = async () => {
    setError('')
    if (!user) {
      setError('You must be logged in to mark as paid.')
      toast.error('You must be logged in to mark as paid.')
      return
    }
    setIsSubmitting(true)
    try {
      await updateParticipant(participant.id, {
        paymentStatus: 'paid',
      })
      toast.success('Marked as paid! Please send your payment screenshot on WhatsApp.')
      reloadParticipant()
      // Open WhatsApp with pre-filled message
      const message = encodeURIComponent(`Hello, I have paid for the contest (${participant.contest}) for ${paymentDetails.amount} ${paymentDetails.currency}. My name is ${participant.name}, email: ${participant.email}, roll number: ${participant.rollNumber}. Here is my payment screenshot.`)
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank')
    } catch (err: any) {
      setError('Failed to mark as paid: ' + (err?.message || 'Unknown error'))
      toast.error('Failed to mark as paid: ' + (err?.message || 'Unknown error'))
      console.error('Error marking as paid:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (error) {
    return (
      <Card className="glassmorphism border-lightBlue/20 mt-6">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl font-bold text-white">Payment Error</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 mb-4">{error}</div>
          <Button onClick={() => setError('')}>Try Again</Button>
        </CardContent>
      </Card>
    )
  }

  if (participant.paymentStatus === 'paid') {
    return (
      <Card className="glassmorphism border-lightBlue/20 mt-6">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl font-bold text-white">Payment Status</CardTitle>
          <CardDescription className="text-gray-300">
            {paymentDetails.description}: {paymentDetails.amount} {paymentDetails.currency}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle className="h-5 w-5" />
              <span>Payment Marked as Paid. Please send your screenshot on WhatsApp.</span>
            </div>
            <Button
              onClick={() => {
                const message = encodeURIComponent(`Hello, I have paid for the contest (${participant.contest}) for ${paymentDetails.amount} ${paymentDetails.currency}. My name is ${participant.name}, email: ${participant.email}, roll number: ${participant.rollNumber}. Here is my payment screenshot.`)
                window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank')
              }}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Send Screenshot on WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glassmorphism border-lightBlue/20 mt-6">
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl font-bold text-white">Payment Details</CardTitle>
        <CardDescription className="text-gray-300">
          {paymentDetails.description}: {paymentDetails.amount} {paymentDetails.currency}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Button
            onClick={handleMarkPaid}
            disabled={isSubmitting}
            className="bg-lightBlue hover:bg-lightBlue/80 text-white w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>Mark as Paid &amp; Send Screenshot on WhatsApp</>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 