'use client'

import { useState, useEffect } from 'react'
import { useFirebase } from '@/lib/firebase/firebase-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2, CheckCircle, XCircle, Download } from 'lucide-react'
import { toast } from 'sonner'
import type { PaymentData } from '@/lib/firebase/firebase-provider'

export function PaymentManagement() {
  const { getPayments, updatePaymentStatus, getParticipants } = useFirebase()
  const [payments, setPayments] = useState<PaymentData[]>([])
  const [participants, setParticipants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [rejectionReason, setRejectionReason] = useState('')
  const [selectedPayment, setSelectedPayment] = useState<PaymentData | null>(null)

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load payments data
      try {
        const paymentsData = await getPayments();
        if (Array.isArray(paymentsData)) {
          setPayments(paymentsData);
        } else {
          console.warn("Payments data is not an array:", paymentsData);
          setPayments([]);
        }
      } catch (paymentsError) {
        console.error('Error loading payments:', paymentsError);
        toast.error('Failed to load payments data');
        setPayments([]);
      }

      // Load participants data
      try {
        const participantsData = await getParticipants();
        if (Array.isArray(participantsData)) {
          setParticipants(participantsData);
        } else {
          console.warn("Participants data is not an array:", participantsData);
          setParticipants([]);
        }
      } catch (participantsError) {
        console.error('Error loading participants:', participantsError);
        toast.error('Failed to load participants data');
        setParticipants([]);
      }
    } catch (error) {
      console.error('Error in loadData:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (payment: PaymentData) => {
    try {
      await updatePaymentStatus(payment.id!, 'verified');
      toast.success(`Payment for ${payment.contestName.replace(/-/g, ' ')} verified successfully.`);
      loadData();
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Failed to verify payment');
    }
  };

  const handleReject = async (payment: PaymentData) => {
    if (!rejectionReason) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      await updatePaymentStatus(payment.id!, 'rejected', rejectionReason);
      toast.success(`Payment for ${payment.contestName.replace(/-/g, ' ')} rejected.`);
      setSelectedPayment(null);
      setRejectionReason('');
      loadData();
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast.error('Failed to reject payment');
    }
  };

  const downloadScreenshot = (url: string) => {
    window.open(url, '_blank')
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-lightBlue" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="glassmorphism border-lightBlue/20">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl font-bold text-white">Payment Management</CardTitle>
          <CardDescription className="text-gray-300">
            Verify or reject payment submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-300">User</TableHead>
                  <TableHead className="text-gray-300">Roll Number</TableHead>
                  <TableHead className="text-gray-300">Contest</TableHead>
                  <TableHead className="text-gray-300">Amount</TableHead>
                  <TableHead className="text-gray-300">Date</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => {
                  // Find the corresponding participant
                  const participant = participants.find(p => p.id === payment.participantId);

                  return (
                    <TableRow key={payment.id} className={payment.status === 'pending' ? 'bg-yellow-500/5' : ''}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-white font-medium">{payment.userName}</span>
                          <span className="text-gray-400 text-xs">{payment.userEmail}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-white">{payment.userRollNumber}</TableCell>
                      <TableCell className="text-white">
                        <div className="flex flex-col">
                          <span>{payment.contestName.replace(/-/g, ' ')}</span>
                          {participant && participant.contestsData && participant.contestsData[payment.contestName] && (
                            <span className={`text-xs ${
                              participant.contestsData[payment.contestName].paymentStatus === 'paid' ? 'text-green-500' :
                              participant.contestsData[payment.contestName].paymentStatus === 'partial' ? 'text-yellow-500' :
                              'text-red-500'
                            }`}>
                              Status: {participant.contestsData[payment.contestName].paymentStatus}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-white">{payment.amount} PKR</TableCell>
                      <TableCell className="text-gray-300 text-sm">
                        {payment.timestamp ? new Date(payment.timestamp).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {payment.status === 'verified' ? (
                          <span className="flex items-center gap-2 text-green-500">
                            <CheckCircle className="h-4 w-4" />
                            Verified
                          </span>
                        ) : payment.status === 'rejected' ? (
                          <span className="flex items-center gap-2 text-red-500">
                            <XCircle className="h-4 w-4" />
                            Rejected
                            {payment.rejectionReason && (
                              <span className="text-xs text-gray-400 ml-1">({payment.rejectionReason})</span>
                            )}
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-yellow-500">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Pending
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {payment.screenshotUrl && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => downloadScreenshot(payment.screenshotUrl!)}
                              className="hover:bg-lightBlue/20"
                              title="View Screenshot"
                            >
                              <Download className="h-4 w-4 text-lightBlue" />
                            </Button>
                          )}

                          {payment.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleVerify(payment)}
                                className="hover:bg-green-500/20"
                                title="Verify Payment"
                              >
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setSelectedPayment(payment)}
                                className="hover:bg-red-500/20"
                                title="Reject Payment"
                              >
                                <XCircle className="h-4 w-4 text-red-500" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedPayment && (
        <Card className="glassmorphism border-lightBlue/20">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">Reject Payment</CardTitle>
            <CardDescription className="text-gray-300">
              Please provide a reason for rejecting this payment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Rejection Reason</Label>
                <Input
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection"
                  className="bg-darkBlue/50 border-gray-700 text-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedPayment(null)
                    setRejectionReason('')
                  }}
                  className="border-gray-700 text-white hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleReject(selectedPayment)}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Reject Payment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}