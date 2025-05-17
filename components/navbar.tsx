"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Menu, X, User, LogOut, Shield, ChevronDown } from "lucide-react"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { user, isAdmin, signOut } = useFirebase()
  const router = useRouter()

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Register", path: "/register" },
    { name: "Portal", path: "/portal", authRequired: true },
    { name: "Admin", path: "/admin", adminOnly: true },
  ]

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  const handleSignOut = async () => {
    await signOut()
    closeMenu()
    // If on admin page, redirect to home
    if (pathname === "/admin") {
      window.location.href = "/"
    }
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-darkBlue/80 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <motion.div whileHover={{ scale: 1.05 }} className="text-2xl font-bold text-white">
              <span className="gradient-text">Tech Fusion 2.0</span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              if (link.adminOnly && !isAdmin) return null
              if (link.authRequired && !user) return null
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`relative text-sm font-medium transition-colors ${
                    pathname === link.path ? "text-white" : "text-gray-300 hover:text-white"
                  }`}
                >
                  <motion.span whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300 }}>
                    {link.name}
                  </motion.span>
                  {pathname === link.path && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-lightBlue"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </Link>
              )
            })}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full border border-lightBlue relative">
                    <User className="h-5 w-5 text-white" />
                    {isAdmin && (
                      <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 py-0 rounded-full">
                        <Shield className="h-3 w-3" />
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="font-medium">{user.displayName}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                    {isAdmin && <Badge className="mt-1 bg-red-500 text-white">Admin</Badge>}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/portal")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>My Portal</span>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/admin")}>
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin Panel</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" className="bg-lightBlue hover:bg-lightBlue/80 text-white">
                    Sign In <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="cursor-pointer" onClick={() => (window.location.href = "/register")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Register</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => (window.location.href = "/login")}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Login</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>

          {/* Mobile Navigation Toggle */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu} className="text-white">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="md:hidden glassmorphism"
        >
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => {
                if (link.adminOnly && !isAdmin) return null
                if (link.authRequired && !user) return null
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    onClick={closeMenu}
                    className={`text-base font-medium transition-colors ${
                      pathname === link.path ? "text-white" : "text-gray-300 hover:text-white"
                    }`}
                  >
                    {link.name}
                  </Link>
                )
              })}
              {user ? (
                <div className="pt-2 border-t border-gray-700">
                  <div className="flex items-center mb-2">
                    <div className="mr-2 h-8 w-8 rounded-full bg-lightBlue/30 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{user.displayName}</div>
                      <div className="text-xs text-gray-400">{user.email}</div>
                    </div>
                    {isAdmin && <Badge className="ml-2 bg-red-500 text-white">Admin</Badge>}
                  </div>
                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="justify-start px-0 text-gray-300 hover:text-white w-full"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 pt-2 border-t border-gray-700">
                  <Link href="/register" onClick={closeMenu}>
                    <Button variant="default" className="w-full bg-lightBlue hover:bg-lightBlue/80 text-white">
                      Register
                    </Button>
                  </Link>
                  <Link href="/login" onClick={closeMenu}>
                    <Button variant="outline" className="w-full border-lightBlue text-lightBlue hover:bg-lightBlue/10">
                      Login
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}

export default Navbar
