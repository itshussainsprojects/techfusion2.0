import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Define a type for the contest details
interface ContestDetails {
  title: string;
  description: string;
  date: string;
  location: string;
  teamSize: string;
  duration: string;
  prizes: string[];
  requirements: string[];
  schedule: { time: string; event: string }[];
  [key: string]: any; // Allow for any additional properties
}

export const generateEventDetailsPDF = async (
  contestName: string,
  eventDetails: ContestDetails,
  participantName: string,
  participantEmail: string,
  participantRollNumber: string
) => {
  try {
    // Validate input parameters
    if (!contestName || !eventDetails || !participantName || !participantEmail) {
      throw new Error('Missing required parameters for PDF generation');
    }

    // Check if eventDetails has the required properties
    if (!eventDetails.title || !eventDetails.description || !eventDetails.date) {
      throw new Error('Event details are incomplete');
    }

    // Create a new PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Set font styles
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.setTextColor(0, 102, 204); // Light blue color

    // Add title
    pdf.text('TECH FUSION 2025', 105, 20, { align: 'center' });
    pdf.text(eventDetails.title, 105, 30, { align: 'center' });

    // Add participant info
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');

    const participantInfo = [
      `Participant: ${participantName}`,
      `Email: ${participantEmail}`,
      `Roll Number: ${participantRollNumber}`,
      `Contest: ${contestName}`,
    ];

    pdf.text(participantInfo, 20, 45);

    // Add horizontal line
    pdf.setDrawColor(0, 102, 204);
    pdf.setLineWidth(0.5);
    pdf.line(20, 55, 190, 55);

    // Add event description
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('Event Description', 20, 65);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);

    // Handle long description with text wrapping
    const splitDescription = pdf.splitTextToSize(eventDetails.description, 170);
    pdf.text(splitDescription, 20, 72);

    // Add event details
    let yPosition = 72 + splitDescription.length * 7;

    pdf.setFont('helvetica', 'bold');
    pdf.text('Event Details', 20, yPosition);
    yPosition += 7;

    pdf.setFont('helvetica', 'normal');
    const details = [
      `Date: ${eventDetails.date}`,
      `Location: ${eventDetails.location}`,
      `Team Size: ${eventDetails.teamSize}`,
      `Duration: ${eventDetails.duration}`,
    ];

    pdf.text(details, 20, yPosition);
    yPosition += details.length * 7 + 5;

    // Add prizes
    pdf.setFont('helvetica', 'bold');
    pdf.text('Prizes', 20, yPosition);
    yPosition += 7;

    pdf.setFont('helvetica', 'normal');
    eventDetails.prizes.forEach((prize: string) => {
      pdf.text(`• ${prize}`, 20, yPosition);
      yPosition += 7;
    });
    yPosition += 5;

    // Add requirements
    pdf.setFont('helvetica', 'bold');
    pdf.text('Requirements', 20, yPosition);
    yPosition += 7;

    pdf.setFont('helvetica', 'normal');
    eventDetails.requirements.forEach((requirement: string) => {
      pdf.text(`• ${requirement}`, 20, yPosition);
      yPosition += 7;
    });
    yPosition += 5;

    // Check if we need a new page for the schedule
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    // Add schedule
    pdf.setFont('helvetica', 'bold');
    pdf.text('Event Schedule', 20, yPosition);
    yPosition += 7;

    pdf.setFont('helvetica', 'normal');
    eventDetails.schedule.forEach((item: { time: string; event: string }) => {
      pdf.text(`${item.time}: ${item.event}`, 20, yPosition);
      yPosition += 7;
    });

    // Add footer
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Generated from Tech Fusion Portal - ' + new Date().toLocaleDateString(), 105, 285, { align: 'center' });

    // Save the PDF
    pdf.save(`${contestName.toLowerCase().replace(/\s+/g, '-')}-event-details.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF: ' + (error instanceof Error ? error.message : String(error)));
  }
};
