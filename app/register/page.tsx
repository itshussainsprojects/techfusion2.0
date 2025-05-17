"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import ParticlesBackground from "@/components/particles-background"

export default function RegisterPage() {
  const router = useRouter()
  const { user, loading, signInWithGoogle, registerWithEmail, registerParticipant, checkIfRegistered } = useFirebase()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rollNumber: "",
    department: "",
    contest: "",
  })

  const [emailRegister, setEmailRegister] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [formState, setFormState] = useState<{
    isSubmitting: boolean
    isSuccess: boolean
    isError: boolean
    errorMessage: string
    alreadyRegistered: boolean
  }>({
    isSubmitting: false,
    isSuccess: false,
    isError: false,
    errorMessage: "",
    alreadyRegistered: false,
  })

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.displayName || "",
        email: user.email || "",
      }))

      // Check if user is already registered
      const checkRegistration = async () => {
        if (user.email) {
          const isRegistered = await checkIfRegistered(user.email)
          setFormState((prev) => ({
            ...prev,
            alreadyRegistered: isRegistered,
          }))
        }
      }

      checkRegistration()
    }
  }, [user, checkIfRegistered])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleEmailRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEmailRegister((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Update the handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!formData.name || !formData.email || !formData.rollNumber || !formData.department || !formData.contest) {
      setFormState({
        isSubmitting: false,
        isSuccess: false,
        isError: true,
        errorMessage: "Please fill in all fields",
        alreadyRegistered: formState.alreadyRegistered,
      })
      return
    }

    setFormState((prev) => ({
      ...prev,
      isSubmitting: true,
      isError: false,
      errorMessage: "",
    }))

    try {
      // Register participant in Firestore
      await registerParticipant(formData)

      setFormState({
        isSubmitting: false,
        isSuccess: true,
        isError: false,
        errorMessage: "",
        alreadyRegistered: true,
      })

      // Reset form
      setFormData({
        name: user?.displayName || "",
        email: user?.email || "",
        rollNumber: "",
        department: "",
        contest: "",
      })

      // Redirect to portal after successful registration
      setTimeout(() => {
        router.push("/portal")
      }, 2000)
    } catch (error) {
      console.error("Error registering participant:", error)
      setFormState({
        isSubmitting: false,
        isSuccess: false,
        isError: true,
        errorMessage: "Failed to register. Please try again.",
        alreadyRegistered: formState.alreadyRegistered,
      })
    }
  }

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!emailRegister.name || !emailRegister.email || !emailRegister.password || !emailRegister.confirmPassword) {
      setFormState({
        ...formState,
        isError: true,
        errorMessage: "Please fill in all fields",
      })
      return
    }

    if (emailRegister.password !== emailRegister.confirmPassword) {
      setFormState({
        ...formState,
        isError: true,
        errorMessage: "Passwords do not match",
      })
      return
    }

    if (emailRegister.password.length < 6) {
      setFormState({
        ...formState,
        isError: true,
        errorMessage: "Password must be at least 6 characters",
      })
      return
    }

    setFormState({
      ...formState,
      isSubmitting: true,
      isError: false,
      errorMessage: "",
    })

    try {
      await registerWithEmail(emailRegister.name, emailRegister.email, emailRegister.password)

      // Update form data with the new user info
      setFormData({
        name: emailRegister.name,
        email: emailRegister.email,
        rollNumber: "",
        department: "",
        contest: "",
      })

      setFormState({
        ...formState,
        isSubmitting: false,
      })

      // Reset email register form
      setEmailRegister({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      })
    } catch (error: any) {
      console.error("Error registering with email:", error)

      setFormState({
        ...formState,
        isSubmitting: false,
        isError: true,
        errorMessage:
          error.code === "auth/email-already-in-use"
            ? "Email already in use. Please login instead."
            : "Failed to register. Please try again.",
      })
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setFormState({
        ...formState,
        isSubmitting: true,
        isError: false,
        errorMessage: "",
      })

      await signInWithGoogle()

      setFormState({
        ...formState,
        isSubmitting: false,
      })
    } catch (error: any) {
      console.error("Error signing in with Google:", error)

      setFormState({
        ...formState,
        isSubmitting: false,
        isError: true,
        errorMessage:
          error.code === "auth/unauthorized-domain"
            ? "This domain is not authorized in Firebase. In production, add this domain to your Firebase console."
            : "Failed to sign in with Google. Please try again.",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-darkBlue">
        <Loader2 className="h-8 w-8 animate-spin text-lightBlue" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-10 flex items-center justify-center relative bg-darkBlue">
      <ParticlesBackground />

      <div className="container mx-auto px-4 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto"
        >
          <Card className="glassmorphism border-lightBlue/20">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center text-white">Register for Tech Fusion 2.0</CardTitle>
              <CardDescription className="text-center text-gray-300">
                Join us for the biggest tech event of the year
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formState.isError && (
                <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-2 rounded-md flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {formState.errorMessage}
                </div>
              )}

              {!user ? (
                <Tabs defaultValue="email" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-darkBlue/50">
                    <TabsTrigger value="email" className="text-white">
                      Email
                    </TabsTrigger>
                    <TabsTrigger value="google" className="text-white">
                      Google
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="email" className="space-y-4 mt-4">
                    <form onSubmit={handleEmailRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-name" className="text-white">
                          Full Name
                        </Label>
                        <Input
                          id="register-name"
                          name="name"
                          value={emailRegister.name}
                          onChange={handleEmailRegisterChange}
                          placeholder="John Doe"
                          className="bg-darkBlue/50 border-gray-700 text-white"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-email" className="text-white">
                          Email
                        </Label>
                        <Input
                          id="register-email"
                          name="email"
                          type="email"
                          value={emailRegister.email}
                          onChange={handleEmailRegisterChange}
                          placeholder="john@example.com"
                          className="bg-darkBlue/50 border-gray-700 text-white"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-password" className="text-white">
                          Password
                        </Label>
                        <Input
                          id="register-password"
                          name="password"
                          type="password"
                          value={emailRegister.password}
                          onChange={handleEmailRegisterChange}
                          placeholder="••••••••"
                          className="bg-darkBlue/50 border-gray-700 text-white"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-confirm-password" className="text-white">
                          Confirm Password
                        </Label>
                        <Input
                          id="register-confirm-password"
                          name="confirmPassword"
                          type="password"
                          value={emailRegister.confirmPassword}
                          onChange={handleEmailRegisterChange}
                          placeholder="••••••••"
                          className="bg-darkBlue/50 border-gray-700 text-white"
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-lightBlue hover:bg-lightBlue/80 text-white"
                        disabled={formState.isSubmitting}
                      >
                        {formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="google" className="space-y-4 mt-4">
                    <div className="text-center text-gray-300 mb-4">Sign in with your Google account to register</div>
                    <Button
                      onClick={handleGoogleSignIn}
                      disabled={loading || formState.isSubmitting}
                      className="w-full bg-white text-gray-800 hover:bg-gray-100"
                    >
                      {loading || formState.isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                            <path
                              fill="#FFC107"
                              d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                            />
                            <path
                              fill="#FF3D00"
                              d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                            />
                            <path
                              fill="#4CAF50"
                              d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                            />
                            <path
                              fill="#1976D2"
                              d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                            />
                          </svg>
                          Sign in with Google
                        </>
                      )}
                    </Button>
                  </TabsContent>
                </Tabs>
              ) : formState.alreadyRegistered ? (
                <div className="space-y-4 text-center">
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                  <h3 className="text-xl font-bold text-white">You're Already Registered!</h3>
                  <p className="text-gray-300">
                    Thank you for registering for Tech Fusion 2.0. We look forward to seeing you at the event!
                  </p>
                  <Button
                    onClick={() => router.push("/portal")}
                    className="bg-lightBlue hover:bg-lightBlue/80 text-white"
                  >
                    Go to My Portal
                  </Button>
                </div>
              ) : formState.isSuccess ? (
                <div className="space-y-4 text-center">
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                  <h3 className="text-xl font-bold text-white">Registration Successful!</h3>
                  <p className="text-gray-300">
                    Thank you for registering for Tech Fusion 2.0. We look forward to seeing you at the event!
                  </p>
                  <p className="text-gray-300">Redirecting to your portal...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className="bg-darkBlue/50 border-gray-700 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rollNumber" className="text-white">
                      Roll Number
                    </Label>
                    <Input
                      id="rollNumber"
                      name="rollNumber"
                      value={formData.rollNumber}
                      onChange={handleInputChange}
                      placeholder="Enter your roll number"
                      className="bg-darkBlue/50 border-gray-700 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      className="bg-darkBlue/50 border-gray-700 text-white"
                      required
                      readOnly
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-white">
                      Department
                    </Label>
                    <Input
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      placeholder="Computer Science"
                      className="bg-darkBlue/50 border-gray-700 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contest" className="text-white">
                      Contest
                    </Label>
                    <Select
                      value={formData.contest}
                      onValueChange={(value) => handleSelectChange("contest", value)}
                      required
                    >
                      <SelectTrigger className="bg-darkBlue/50 border-gray-700 text-white">
                        <SelectValue placeholder="Select a contest" />
                      </SelectTrigger>
                      <SelectContent className="bg-darkBlue border-gray-700">
                        <SelectItem value="hackathon">Hackathon</SelectItem>
                        <SelectItem value="robotics">Robotics</SelectItem>
                        <SelectItem value="gaming">Gaming</SelectItem>
                        <SelectItem value="ai-challenge">AI Challenge</SelectItem>
                        <SelectItem value="startup-pitch">Startup Pitch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-lightBlue hover:bg-lightBlue/80 text-white"
                    disabled={formState.isSubmitting}
                  >
                    {formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Register"}
                  </Button>
                </form>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <div className="text-center text-sm text-gray-400">
                {!user ? (
                  <>
                    Already have an account?{" "}
                    <Link href="/login" className="text-lightBlue hover:underline">
                      Login
                    </Link>
                  </>
                ) : (
                  "By registering, you agree to our terms and conditions."
                )}
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
