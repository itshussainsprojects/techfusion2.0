"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Mail } from "lucide-react"
import { FaInstagram, FaFacebook, FaTwitter, FaLinkedin } from "react-icons/fa"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-darkBlue text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-4"
            >
              <img
                src="/images/techfusion-logo.png"
                alt="Tech Fusion Logo"
                className="h-16 sm:h-20 w-auto"
              />
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-300 mb-4"
            >
              A premier university tech event organized by IEEE SSCIT, bringing together innovation, technology, and
              talent.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex space-x-4"
            >
              <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <FaInstagram className="h-5 w-5 text-gray-300 hover:text-lightBlue transition-colors" />
              </Link>
              <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <FaFacebook className="h-5 w-5 text-gray-300 hover:text-lightBlue transition-colors" />
              </Link>
              <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <FaTwitter className="h-5 w-5 text-gray-300 hover:text-lightBlue transition-colors" />
              </Link>
              <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <FaLinkedin className="h-5 w-5 text-gray-300 hover:text-lightBlue transition-colors" />
              </Link>
            </motion.div>
          </div>

          <div>
            <motion.h3
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl font-bold mb-4"
            >
              Quick Links
            </motion.h3>
            <motion.ul
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-2"
            >
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-gray-300 hover:text-white transition-colors">
                  Register
                </Link>
              </li>
              <li>
                <Link href="/#events" className="text-gray-300 hover:text-white transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/#timeline" className="text-gray-300 hover:text-white transition-colors">
                  Timeline
                </Link>
              </li>
            </motion.ul>
          </div>

          <div>
            <motion.h3
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xl font-bold mb-4"
            >
              Contact Us
            </motion.h3>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="space-y-2"
            >
              <p className="text-gray-300 flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <a href="mailto:info@techfusion.edu" className="hover:text-white transition-colors">
                  info@techfusion.edu
                </a>
              </p>
              <p className="text-gray-300">
                IEEE SSCIT Student Branch,
                <br />
                Street 33, Block A
                <br />
               Multi Gardens B-17, Islamabad
              </p>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm"
        >
          <p>&copy; {currentYear} Tech Fusion 2.0 | IEEE SSCIT. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer
