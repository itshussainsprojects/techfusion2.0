'use client'

import { useState, useEffect } from 'react'
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
  const { user, updateParticipant, createPaymentRecord, getPaymentsByParticipantId } = useFirebase()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string>('')
  const [paymentHistory, setPaymentHistory] = useState<any[]>([])

  // Load payment history when component mounts
  useEffect(() => {
    if (participant?.id) {
      loadPaymentHistory();
    }
  }, [participant?.id]);

  const loadPaymentHistory = async () => {
    try {
      if (participant?.id) {
        const payments = await getPaymentsByParticipantId(participant.id);
        if (Array.isArray(payments)) {
          setPaymentHistory(payments);
        } else {
          console.warn("Payments data is not an array:", payments);
          setPaymentHistory([]);
        }
      }
    } catch (error) {
      console.error("Error loading payment history:", error);
      setPaymentHistory([]);
    }
  };

  const handleMarkPaid = async () => {
    setError('')
    if (!user) {
      setError('You must be logged in to mark as paid.')
      toast.error('You must be logged in to mark as paid.')
      return
    }
    setIsSubmitting(true)
    try {
      // 1. First create a payment record
      try {
        await createPaymentRecord({
          userEmail: participant.email,
          userName: participant.name,
          userRollNumber: participant.rollNumber,
          participantId: participant.id,
          contestName: participant.contest,
          amount: paymentDetails.amount,
          paymentMethod: 'WhatsApp', // Default method
          status: 'pending'
        });
        console.log("Payment record created successfully");
      } catch (paymentError) {
        console.error("Error creating payment record:", paymentError);
        // Continue with the process even if payment record creation fails
      }

      // 2. Update participant status to partial
      try {
        await updateParticipant(participant.id, {
          paymentStatus: 'partial',
        });
        console.log("Participant status updated to partial");
      } catch (participantError) {
        console.error("Error updating participant status:", participantError);
        setError('Failed to update payment status: ' + (participantError?.message || 'Unknown error'));
        toast.error('Failed to update payment status. Please try again or contact support.');
        setIsSubmitting(false);
        return;
      }

      // 3. Reload data
      await loadPaymentHistory();
      toast.success('Marked as under verification! Please send your payment screenshot on WhatsApp.')
      reloadParticipant()

      // 4. Open WhatsApp with pre-filled message
      const message = encodeURIComponent(`Hello, I have made a payment for the contest (${participant.contest}) for ${paymentDetails.amount} ${paymentDetails.currency}. My name is ${participant.name}, email: ${participant.email}, roll number: ${participant.rollNumber}. Here is my payment screenshot.`)
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
    // Find the verified payment if it exists
    const verifiedPayment = paymentHistory.find(p => p.status === 'verified');

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
            <div className="flex items-center gap-2 text-green-500 mb-2">
              <CheckCircle className="h-5 w-5" />
              <span>Payment Verified. Thank you for your payment!</span>
            </div>

            <div className="bg-darkBlue/30 p-4 rounded-md border border-green-500/20">
              <h3 className="text-white font-medium mb-2">Payment Details:</h3>
              <div className="text-gray-300 space-y-1">
                <p><span className="text-gray-400">Amount:</span> {paymentDetails.amount} {paymentDetails.currency}</p>
                <p><span className="text-gray-400">Contest:</span> {participant.contest}</p>
                {verifiedPayment && verifiedPayment.timestamp && (
                  <p><span className="text-gray-400">Verified on:</span> {new Date(verifiedPayment.timestamp).toLocaleString()}</p>
                )}
                <p><span className="text-gray-400">Status:</span> <span className="text-green-500">Verified</span></p>
              </div>
            </div>

            <div className="bg-green-500/10 p-3 rounded-md border border-green-500/20 text-center">
              <p className="text-green-400">You're all set! Your registration is confirmed.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (participant.paymentStatus === 'partial') {
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
            <div className="flex items-center gap-2 text-yellow-500 mb-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Payment is under verification. Admin will verify your payment soon.</span>
            </div>

            <div className="bg-darkBlue/30 p-4 rounded-md border border-yellow-500/20">
              <h3 className="text-white font-medium mb-2">Payment Verification Process:</h3>
              <ol className="list-decimal list-inside text-gray-300 space-y-1">
                <li>Your payment is currently under review by our admin team</li>
                <li>Please ensure you've sent your payment screenshot on WhatsApp</li>
                <li>Verification usually takes 24-48 hours</li>
                <li>You'll receive a confirmation once verified</li>
              </ol>
            </div>

            <Button
              onClick={() => {
                const message = encodeURIComponent(`Hello, I'm following up on my payment for the contest (${participant.contest}) for ${paymentDetails.amount} ${paymentDetails.currency}. My name is ${participant.name}, email: ${participant.email}, roll number: ${participant.rollNumber}. Here is my payment screenshot.`)
                window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank')
              }}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
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
        <span>JazzCash: 0300-1234567 - Easypaisa: 0300-1234567</span>
        <br></br>
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