import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"

interface InvestmentReceiptData {
  investmentId: number
  cycleName: string
  cycleStatus: string
  userName: string
  shares: number
  pricePerShare: bigint
  amountInvested: bigint
  profitEarned: bigint
  investedAt: Date
  cycleStartDate: Date | null
  cycleEndDate: Date | null
}

export const generateInvestmentReceiptPDF = async (data: InvestmentReceiptData) => {
  // Dynamic import to reduce bundle size
  const { jsPDF } = await import('jspdf')
  
  const doc = new jsPDF()
  
  // Colors
  const primaryColor: [number, number, number] = [16, 185, 129] // Emerald-500
  const darkGray: [number, number, number] = [55, 65, 81]
  const lightGray: [number, number, number] = [156, 163, 175]
  
  // Header
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 40, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('INVESTMENT RECEIPT', 105, 20, { align: 'center' })
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Shababul khair Halal Investment Ltd', 105, 30, { align: 'center' })
  
  // Reset text color
  doc.setTextColor(...darkGray)
  
  // Receipt Number
  doc.setFontSize(10)
  doc.setTextColor(...lightGray)
  doc.text(`Receipt #${data.investmentId}`, 20, 55)
  doc.text(`Generated: ${format(new Date(), "MMM dd, yyyy 'at' h:mm a")}`, 20, 62)
  
  // Investor Information
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...darkGray)
  doc.text('INVESTOR INFORMATION', 20, 80)
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Name: ${data.userName}`, 20, 90)
  doc.text(`Investment Date: ${format(data.investedAt, "MMMM dd, yyyy")}`, 20, 97)
  
  // Cycle Information
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('INVESTMENT CYCLE', 20, 115)
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Cycle: ${data.cycleName}`, 20, 125)
  doc.text(`Status: ${data.cycleStatus.toUpperCase()}`, 20, 132)
  if (data.cycleStartDate && data.cycleEndDate) {
    doc.text(`Period: ${format(new Date(data.cycleStartDate), "MMM dd")} - ${format(new Date(data.cycleEndDate), "MMM dd, yyyy")}`, 20, 139)
  }
  
  // Investment Details Box
  doc.setDrawColor(...primaryColor)
  doc.setLineWidth(0.5)
  doc.rect(20, 155, 170, 60)
  
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('INVESTMENT DETAILS', 25, 165)
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  
  // Left column
  doc.text('Price Per Share:', 25, 180)
  doc.text('Number of Shares:', 25, 190)
  doc.text('Total Investment:', 25, 200)
  
  // Right column (values)
  doc.setFont('helvetica', 'bold')
  doc.text(formatCurrency(data.pricePerShare), 110, 180)
  doc.text(data.shares.toString(), 110, 190)
  doc.text(formatCurrency(data.amountInvested), 110, 200)
  
  // Performance Section (if completed)
  if (data.cycleStatus === 'completed' && data.profitEarned > 0n) {
    doc.setFillColor(240, 253, 244) // Light green background
    doc.rect(20, 225, 170, 35, 'F')
    
    doc.setDrawColor(...primaryColor)
    doc.rect(20, 225, 170, 35)
    
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...primaryColor)
    doc.text('PROFIT EARNED', 25, 235)
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...darkGray)
    doc.text('Net Profit:', 25, 248)
    
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...primaryColor)
    doc.setFontSize(14)
    doc.text(`+${formatCurrency(data.profitEarned)}`, 110, 248)
    
    const totalReturn = data.amountInvested + data.profitEarned
    doc.setFontSize(11)
    doc.setTextColor(...darkGray)
    doc.text('Total Return:', 25, 255)
    doc.text(formatCurrency(totalReturn), 110, 255)
  }
  
  // Footer
  const footerY = data.cycleStatus === 'completed' ? 275 : 235
  doc.setFontSize(9)
  doc.setTextColor(...lightGray)
  doc.text('This is an official investment receipt from Shababulkhair Halal Investment Platform.', 105, footerY, { align: 'center' })
  doc.text('For inquiries, please contact shababulkhairskb@gmail.com', 105, footerY + 5, { align: 'center' })
  
  // Divider line
  doc.setDrawColor(...lightGray)
  doc.line(20, footerY - 5, 190, footerY - 5)
  
  // Save the PDF
  doc.save(`Investment-Receipt-${data.investmentId}-${format(new Date(), "yyyy-MM-dd")}.pdf`)
}