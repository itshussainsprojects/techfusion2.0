'use client'

import { useState, useEffect } from 'react'
import { useFirebase } from '@/lib/firebase/firebase-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface PaymentSectionProps {
  participant: any // ParticipantData
  reloadParticipant: (updatedParticipant?: any) => void
  paymentDetails: {
    amount: number
    currency: string
    description: string
  }
  selectedContest?: string // Add selected contest prop
}

const WHATSAPP_NUMBER = '923319215005' // Updated WhatsApp number

export default function PaymentSection({ participant, reloadParticipant, paymentDetails, selectedContest }: PaymentSectionProps) {
  const { user, updateParticipant, createPaymentRecord, getPaymentsByParticipantId } = useFirebase()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string>('')
  const [paymentHistory, setPaymentHistory] = useState<any[]>([])

  // Create a safe version of paymentDetails with fallback values
  const safePaymentDetails = paymentDetails || {
    amount: 1000,
    currency: 'PKR',
    description: 'Registration Fee'
  }

  // Load payment history when component mounts or selected contest changes
  useEffect(() => {
    if (participant?.id) {
      loadPaymentHistory();
    }
  }, [participant?.id, selectedContest]);

  // Get the contest to display - either the selected one or the first one
  const contestToDisplay = selectedContest ||
    (participant.contests && participant.contests.length > 0 ? participant.contests[0] : participant.contest);

  // Debug participant data changes
  useEffect(() => {
    if (participant) {
      console.log("Participant data updated:", participant);
      console.log("Current contest data:",
        contestToDisplay ? participant.contestsData?.[contestToDisplay] : "No contest selected");
    }
  }, [participant, contestToDisplay]);

  const loadPaymentHistory = async () => {
    try {
      if (participant?.id) {
        const payments = await getPaymentsByParticipantId(participant.id);
        if (Array.isArray(payments)) {
          setPaymentHistory(payments);
          console.log("Loaded payment history:", payments);
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

    // Use the selected contest or the first contest in the list
    const contestName = selectedContest || participant.contest;

    if (!contestName) {
      setError('No contest selected.')
      toast.error('No contest selected. Please select a contest first.')
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
          contestName: contestName,
          amount: safePaymentDetails.amount,
          paymentMethod: 'WhatsApp', // Default method
          status: 'pending'
        });
        console.log("Payment record created successfully for contest:", contestName);
      } catch (error) {
        const paymentError = error as Error;
        console.error("Error creating payment record:", paymentError);
        // Continue with the process even if payment record creation fails
      }

      // 2. Update participant status
      try {
        // Create updated contestsData with the current contest marked as partial
        const updatedContestsData = { ...participant.contestsData || {} };

        // Ensure the contest data exists
        if (!updatedContestsData[contestName]) {
          updatedContestsData[contestName] = {
            contestName,
            registrationDate: new Date()
          };
        }

        // Update the payment status for this contest
        updatedContestsData[contestName] = {
          ...updatedContestsData[contestName],
          contestName,
          paymentStatus: 'partial',
        };

        console.log("Updating contest data:", updatedContestsData);

        // Update the participant record
        await updateParticipant(participant.id, {
          contestsData: updatedContestsData,
          // Only update overall status if not already paid
          ...(participant.paymentStatus !== 'paid' && { paymentStatus: 'partial' })
        });

        console.log("Contest payment status updated to partial for:", contestName);
      } catch (error) {
        const participantError = error as Error;
        console.error("Error updating participant status:", participantError);
        setError('Failed to update payment status: ' + (participantError.message || 'Unknown error'));
        toast.error('Failed to update payment status. Please try again or contact support.');
        setIsSubmitting(false);
        return;
      }

      // 3. Reload data and update local state immediately
      await loadPaymentHistory();

      // Update local state to show partial status immediately without waiting for reload
      const updatedParticipant = { ...participant };
      if (!updatedParticipant.contestsData) {
        updatedParticipant.contestsData = {};
      }

      if (!updatedParticipant.contestsData[contestName]) {
        updatedParticipant.contestsData[contestName] = {
          contestName,
          registrationDate: new Date()
        };
      }

      updatedParticipant.contestsData[contestName].paymentStatus = 'partial';

      // Only update overall status if not already paid
      if (updatedParticipant.paymentStatus !== 'paid') {
        updatedParticipant.paymentStatus = 'partial';
      }

      // Update the participant prop with the updated data
      reloadParticipant(updatedParticipant);

      // Show success message
      toast.success(`Marked ${contestName.replace(/-/g, ' ')} as under verification! Click the button below to send your payment screenshot on WhatsApp.`);

      // Don't automatically open WhatsApp here, let the user click the button in the partial payment section
      // This ensures they can see the updated status before leaving the page

      // Reload participant data from server after a short delay
      setTimeout(() => {
        reloadParticipant();
      }, 1000);
    } catch (error) {
      const err = error as Error;
      setError('Failed to mark as paid: ' + (err.message || 'Unknown error'))
      toast.error('Failed to mark as paid: ' + (err.message || 'Unknown error'))
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

  // We already defined contestToDisplay at the top of the component

  // Get the payment status for the specific contest
  const contestPaymentStatus = contestToDisplay && participant.contestsData && participant.contestsData[contestToDisplay]
    ? participant.contestsData[contestToDisplay].paymentStatus
    : participant.paymentStatus;

  // Find the payment records for this contest
  const contestPayments = paymentHistory.filter(p => p.contestName === contestToDisplay);

  // Find the verified payment for this contest if it exists
  const verifiedPayment = contestPayments.find(p => p.status === 'verified');

  // Find the pending payment for this contest if it exists
  const pendingPayment = contestPayments.find(p => p.status === 'pending');

  console.log("Contest to display:", contestToDisplay);
  console.log("Contest payment status:", contestPaymentStatus);
  console.log("Contest payments:", contestPayments);

  if (contestPaymentStatus === 'paid') {
    return (
      <Card className="glassmorphism border-lightBlue/20 mt-6">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl font-bold text-white">Payment Status</CardTitle>
          <CardDescription className="text-gray-300">
            {safePaymentDetails.description}: {safePaymentDetails.amount} {safePaymentDetails.currency}
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
                <p><span className="text-gray-400">Amount:</span> {safePaymentDetails.amount} {safePaymentDetails.currency}</p>
                <p><span className="text-gray-400">Contest:</span> {contestToDisplay.replace(/-/g, ' ')}</p>
                {verifiedPayment && verifiedPayment.timestamp && (
                  <p><span className="text-gray-400">Verified on:</span> {new Date(verifiedPayment.timestamp).toLocaleString()}</p>
                )}
                <p><span className="text-gray-400">Status:</span> <span className="text-green-500">Verified</span></p>
              </div>
            </div>

            <div className="bg-green-500/10 p-3 rounded-md border border-green-500/20 text-center">
              <p className="text-green-400">You're all set! Your registration for this contest is confirmed.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (contestPaymentStatus === 'partial') {
    return (
      <Card className="glassmorphism border-lightBlue/20 mt-6">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl font-bold text-white">Payment Status</CardTitle>
          <CardDescription className="text-gray-300">
            {safePaymentDetails.description}: {safePaymentDetails.amount} {safePaymentDetails.currency}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-yellow-500 mb-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Payment for {contestToDisplay.replace(/-/g, ' ')} is under verification. Admin will verify your payment soon.</span>
            </div>

            <div className="bg-darkBlue/30 p-4 rounded-md border border-yellow-500/20">
              <h3 className="text-white font-medium mb-2">Payment Details:</h3>
              <div className="text-gray-300 space-y-1">
                <p><span className="text-gray-400">Amount:</span> {safePaymentDetails.amount} {safePaymentDetails.currency}</p>
                <p><span className="text-gray-400">Contest:</span> {contestToDisplay.replace(/-/g, ' ')}</p>
                {pendingPayment && pendingPayment.timestamp && (
                  <p><span className="text-gray-400">Submitted on:</span> {new Date(pendingPayment.timestamp).toLocaleString()}</p>
                )}
                <p><span className="text-gray-400">Status:</span> <span className="text-yellow-500">Under Verification</span></p>
              </div>
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
                const message = encodeURIComponent(`Hello, I'm following up on my payment for the contest (${contestToDisplay.replace(/-/g, ' ')}) for ${safePaymentDetails.amount} ${safePaymentDetails.currency}. My name is ${participant.name}, email: ${participant.email}, roll number: ${participant.rollNumber}. Here is my payment screenshot.`)
                window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank')
              }}
              className="bg-yellow-600 hover:bg-yellow-700 text-white w-full py-6 text-sm sm:text-base"
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
        <span>JazzCash: +92 3319215005 - Easypaisa: +92 3319215005</span>
        <br></br>
          {safePaymentDetails.description}: {safePaymentDetails.amount} {safePaymentDetails.currency}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Show contest selection if multiple contests are registered */}
          {participant.contests && participant.contests.length > 1 && !selectedContest && (
            <div className="bg-darkBlue/30 p-4 rounded-md border border-lightBlue/20 mb-4">
              <h3 className="text-white font-medium mb-2">You are registered for multiple contests:</h3>
              <p className="text-gray-300 text-sm mb-3">Please make payment for each contest separately.</p>
              <div className="grid grid-cols-1 gap-2">
                {participant.contests.map((contestId: string) => {
                  const status = participant.contestsData[contestId]?.paymentStatus || 'not paid';
                  return (
                    <div key={contestId} className="flex justify-between items-center p-2 rounded border border-gray-700">
                      <span className="text-white capitalize">{contestId.replace(/-/g, ' ')}</span>
                      <span className={`text-sm ${
                        status === 'paid' ? 'text-green-500' :
                        status === 'partial' ? 'text-yellow-500' :
                        'text-red-500'
                      }`}>
                        {status === 'paid' ? 'Paid' :
                         status === 'partial' ? 'Under Verification' :
                         'Not Paid'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <Button
            onClick={handleMarkPaid}
            disabled={isSubmitting}
            className="bg-lightBlue hover:bg-lightBlue/80 text-white w-full py-6 text-sm sm:text-base"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center">
                <span className="whitespace-normal text-center">
                  Mark {contestToDisplay ? contestToDisplay.replace(/-/g, ' ') : 'Contest'} as Paid
                </span>
              </div>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
