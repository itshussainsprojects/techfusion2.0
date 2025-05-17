"use client"
import { motion } from "framer-motion"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "When and where is Tech Fusion 2.0 taking place?",
    answer:
      "Tech Fusion 2.0 will take place from August 1-4, 2025, at the University Campus. The event will be spread across multiple venues throughout the campus.",
  },
  {
    question: "How can I register for the event?",
    answer:
      "You can register for Tech Fusion 2.0 by clicking on the 'Register' button on our website. You'll need to create an account or sign in with Google, then select your preferred contest and complete the registration form.",
  },
  {
    question: "Is there a registration fee?",
    answer:
      "Registration for Tech Fusion 2.0 is completely free for all university students. External participants may have a nominal fee which will be communicated during registration.",
  },
  {
    question: "Can I participate in multiple contests?",
    answer:
      "Due to scheduling constraints, participants can only register for one main contest. However, there will be several mini-events and workshops that all attendees can participate in regardless of their main contest.",
  },
  {
    question: "What should I bring to the event?",
    answer:
      "Participants should bring their student ID, laptop, charger, and any specific equipment required for their contest (details will be emailed to registered participants). Food and refreshments will be provided during the event.",
  },
  {
    question: "Are there prizes for the winners?",
    answer:
      "Yes! Tech Fusion 2.0 has a total prize pool of $10,000 distributed across all contests. Winners will also receive certificates, internship opportunities, and tech gadgets from our sponsors.",
  },
  {
    question: "Can I volunteer for the event?",
    answer:
      "We're always looking for volunteers to help make Tech Fusion 2.0 a success. Please contact us at volunteers@techfusion.edu for more information on volunteering opportunities.",
  },
  {
    question: "Will there be accommodation for out-of-town participants?",
    answer:
      "Limited accommodation will be available on campus for participants coming from other cities. Please indicate your accommodation needs during registration, and our team will get back to you with details.",
  },
]

const FAQSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-darkBlue/70 to-darkBlue">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Frequently Asked Questions</h2>
          <div className="w-20 h-1 bg-lightBlue mx-auto mb-6"></div>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Find answers to common questions about Tech Fusion 2.0
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="glassmorphism border-lightBlue/20 rounded-lg overflow-hidden"
                >
                  <AccordionTrigger className="px-6 py-4 text-white hover:no-underline">
                    <span className="text-left">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-gray-300">{faq.answer}</AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}

export default FAQSection
