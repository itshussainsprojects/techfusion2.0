"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FaGoogle } from "react-icons/fa"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signInWithGoogle, signInWithEmail, checkIfRegistered } = useFirebase()
  const { toast } = useToast()
  const [emailLogin, setEmailLogin] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await signInWithGoogle()
      const isRegistered = await checkIfRegistered(result.user.email || "")
      if (isRegistered) {
        router.push("/portal")
      } else {
        router.push("/register")
      }
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.message)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign in with Google. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailLogin.email || !emailLogin.password) {
      setError("Please fill in all fields")
      return
    }

    try {
      setLoading(true)
      setError(null)
      const result = await signInWithEmail(emailLogin.email, emailLogin.password)
      const isRegistered = await checkIfRegistered(result.user.email || "")
      
      // Check if there's a redirect parameter
      const redirectTo = searchParams.get("redirect")
      if (redirectTo) {
        router.push(redirectTo)
      } else if (isRegistered) {
        router.push("/portal")
      } else {
        router.push("/register")
      }
    } catch (error: any) {
      console.error("Login error:", error)
      setError("Invalid email or password")
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign in. Please check your credentials.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-6 relative">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to continue to TechFusion</p>
        </div>

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="google">Google</TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4">
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={emailLogin.email}
                  onChange={(e) =>
                    setEmailLogin({ ...emailLogin, email: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={emailLogin.password}
                  onChange={(e) =>
                    setEmailLogin({ ...emailLogin, password: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="google" className="space-y-4">
            <Button
              onClick={handleGoogleSignIn}
              className="w-full"
              disabled={loading}
              variant="outline"
            >
              <FaGoogle className="mr-2" />
              {loading ? "Signing in..." : "Sign in with Google"}
            </Button>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <Separator />
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
