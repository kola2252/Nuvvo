import { jsPDF } from 'jspdf';
import { Order } from '../types';

/**
 * Generates and downloads a beautifully formatted, print-ready PDF tax invoice for customers.
 * Featuring customized brand colors (Orange/Amber), structured billing table, tax breakdowns (CGST/SGST),
 * rider tip details, loyalty point redemptions, and an authentic digital PAID/CANCELLED stamp.
 */
export function downloadOrderInvoice(order: Order) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // A4 Page Size: 210mm x 297mm
  const margin = 15;
  let y = 15;

  // --- 1. BRAND HEADER (Nuvvo Orange Accent) ---
  doc.setFillColor(249, 115, 22); // Orange 500
  doc.rect(0, 0, 210, 42, 'F');

  // Custom Geometric Logo (Circle with stylized "N" logo fork)
  doc.setFillColor(255, 255, 255);
  doc.circle(25, 21, 9, 'F');
  
  doc.setFillColor(249, 115, 22); // Orange inner
  doc.triangle(21, 26, 21, 16, 25, 21, 'F');
  doc.triangle(29, 16, 29, 26, 25, 21, 'F');

  // Brand Name & Slogan
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('NUVVO GOURMET', 38, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 237, 213); // Orange 100
  doc.text('CHIRALA REGIONAL FLAVOURS & HYPERLOCAL DELIVERY', 38, 26);
  doc.text('GSTIN: 37AAECN9912F1Z8 • REGIONAL TAX COMPLIANT', 38, 31);

  // Document Type / Metadata on Top Right
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('OFFICIAL TAX INVOICE', 142, 19);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const formattedRef = `INV-2026-${order.id.slice(-6).toUpperCase()}`;
  doc.text(`REF: ${formattedRef}`, 142, 24);
  doc.text(`DATE: ${new Date(order.date).toLocaleDateString()}`, 142, 28);
  doc.text(`STATUS: ${order.status.toUpperCase()}`, 142, 32);

  // Move cursor below header
  y = 55;

  // --- 2. BILL TO & METADATA CARDS ---
  doc.setFillColor(250, 250, 250); // Zinc 50
  doc.rect(margin, y, 180, 38, 'F');
  doc.setDrawColor(244, 244, 245); // Zinc 100
  doc.setLineWidth(0.3);
  doc.rect(margin, y, 180, 38, 'D');

  // Left Column: Customer details (Billed To)
  doc.setTextColor(161, 161, 170); // Zinc 400
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('BILLED TO / CUSTOMER', margin + 6, y + 6);

  doc.setTextColor(24, 24, 27); // Zinc 900
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.text(order.customerName || 'Nuvvo Guest', margin + 6, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(82, 82, 91); // Zinc 600
  doc.text(`Mobile: +91 ${order.customerPhone || 'N/A'}`, margin + 6, y + 19);
  
  // Clean multiline address handling
  const rawAddress = order.address 
    ? `${order.address.flatNo}, ${order.address.area}, ${order.address.city}`
    : 'Chirala Delivery Point';
  const splitAddress = doc.splitTextToSize(rawAddress, 85);
  doc.text('Delivery Address:', margin + 6, y + 25);
  doc.text(splitAddress, margin + 32, y + 25);

  // Right Column: Payment & Order Info
  doc.setTextColor(161, 161, 170); // Zinc 400
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('PAYMENT METRICS', margin + 115, y + 6);

  doc.setTextColor(249, 115, 22); // Orange 500
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`₹${order.finalAmount}`, margin + 115, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(82, 82, 91); // Zinc 600
  doc.text(`Method: ${order.paymentMethod}`, margin + 115, y + 19);
  doc.text(`Status: ${order.paymentStatus.toUpperCase()}`, margin + 115, y + 24);
  doc.text(`Time: ${new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, margin + 115, y + 29);

  y += 48;

  // --- 3. ITEMIZED CHARGES TABLE ---
  doc.setTextColor(24, 24, 27); // Zinc 900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('ITEMIZED BILLING STATEMENT', margin, y);
  y += 5;

  // Table header background
  doc.setFillColor(244, 244, 245); // Zinc 100
  doc.rect(margin, y, 180, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(113, 113, 122); // Zinc 500
  doc.text('FOOD ITEMS & DESCRIPTION', margin + 3, y + 5.5);
  doc.text('PRICE', margin + 110, y + 5.5);
  doc.text('QTY', margin + 138, y + 5.5);
  doc.text('NET AMOUNT', margin + 160, y + 5.5);

  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(39, 39, 42); // Zinc 800

  // Draw Items
  order.items.forEach((item) => {
    const itemPrice = item.foodItem.discountPrice || item.foodItem.price;
    const itemTotal = itemPrice * item.quantity;
    
    // Check height constraints (add pages if necessary, though typical orders easily fit on 1 page)
    doc.text(item.foodItem.name, margin + 3, y + 5);
    
    // Small subtext for customizations if any exist
    if (item.selectedCustomizations && Object.keys(item.selectedCustomizations).length > 0) {
      const customizationsText = Object.values(item.selectedCustomizations).map((v: any) => v.name || v).join(', ');
      doc.setFontSize(7);
      doc.setTextColor(249, 115, 22);
      doc.text(`└ Custom: ${customizationsText}`, margin + 5, y + 9);
      doc.setFontSize(8.5);
      doc.setTextColor(39, 39, 42);
    }

    doc.text(`₹${itemPrice}`, margin + 110, y + 5);
    doc.text(`x ${item.quantity}`, margin + 138, y + 5);
    doc.text(`₹${itemTotal}`, margin + 160, y + 5);
    
    // Border line below item
    y += (item.selectedCustomizations && Object.keys(item.selectedCustomizations).length > 0) ? 12 : 8;
    doc.setDrawColor(244, 244, 245);
    doc.setLineWidth(0.2);
    doc.line(margin, y, margin + 180, y);
  });

  y += 5;

  // --- 4. FINANCIAL BREAKDOWN BLOCK ---
  // We'll place the breakdown on the right side and optionally tax declarations or a stamp on the left side
  const breakdownX = 115;
  const labelsX = margin + 5;
  
  // Box for financial aggregates
  doc.setFillColor(252, 252, 253); // Zinc 50 very light
  doc.rect(margin, y, 180, 52, 'F');
  doc.setDrawColor(244, 244, 245);
  doc.rect(margin, y, 180, 52, 'D');

  // Let's print subtotal & ancillary charges
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(113, 113, 122); // Zinc 500

  let breakdownY = y + 6;
  
  // Left Column of breakdown: Tax computations & Stamp space
  const itemsSubtotal = order.subtotal;
  const cgst = parseFloat((itemsSubtotal * 0.025).toFixed(2));
  const sgst = parseFloat((itemsSubtotal * 0.025).toFixed(2));

  doc.text('TAX & REGULATORY DECLARATION', labelsX, breakdownY);
  doc.setFontSize(7);
  doc.text(`• Composite SGST (2.5%): ₹${sgst}`, labelsX + 2, breakdownY + 6);
  doc.text(`• Composite CGST (2.5%): ₹${cgst}`, labelsX + 2, breakdownY + 11);
  doc.text('• Packaging & Container Charge included', labelsX + 2, breakdownY + 16);
  doc.text('• Hyperlocal dynamic delivery route pricing', labelsX + 2, breakdownY + 21);

  // Right Column of breakdown: Values
  doc.setFontSize(8.5);
  doc.text('Items Subtotal:', breakdownX, breakdownY);
  doc.text(`₹${order.subtotal}`, breakdownX + 50, breakdownY);

  breakdownY += 5;
  doc.text('Packaging Charge:', breakdownX, breakdownY);
  doc.text(`₹${order.packagingFee || 10}`, breakdownX + 50, breakdownY);

  breakdownY += 5;
  doc.text('Delivery Fee:', breakdownX, breakdownY);
  doc.text(`₹${order.deliveryFee || 20}`, breakdownX + 50, breakdownY);

  if (order.tip > 0) {
    breakdownY += 5;
    doc.setTextColor(16, 185, 129); // Green 500
    doc.text('Rider Gratuity (Tip):', breakdownX, breakdownY);
    doc.text(`+ ₹${order.tip}`, breakdownX + 50, breakdownY);
    doc.setTextColor(113, 113, 122);
  }

  if (order.discount > 0) {
    breakdownY += 5;
    doc.setTextColor(249, 115, 22); // Orange 500
    doc.text('Coupon Discount:', breakdownX, breakdownY);
    doc.text(`- ₹${order.discount}`, breakdownX + 50, breakdownY);
    doc.setTextColor(113, 113, 122);
  }

  if (order.pointsRedeemed && order.pointsRedeemed > 0) {
    breakdownY += 5;
    doc.setTextColor(79, 70, 229); // Indigo 600
    doc.text('Cashback Redeemed:', breakdownX, breakdownY);
    doc.text(`- ₹${order.pointsRedeemed}`, breakdownX + 50, breakdownY);
    doc.setTextColor(113, 113, 122);
  }

  // Grand Total Row
  breakdownY += 7;
  doc.setDrawColor(228, 228, 231);
  doc.line(breakdownX, breakdownY - 2, breakdownX + 65, breakdownY - 2);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(24, 24, 27); // Zinc 900
  doc.text('Grand Total:', breakdownX, breakdownY + 2);
  doc.setTextColor(249, 115, 22); // Orange 500
  doc.text(`₹${order.finalAmount}`, breakdownX + 48, breakdownY + 2);

  y += 58;

  // --- 5. COMPLIMENTARY STAMP & COMPLIANCE ---
  // Draw an authentic stamp on the left side
  const isPaid = order.status !== 'cancelled';
  doc.setLineWidth(0.8);
  if (isPaid) {
    doc.setDrawColor(16, 185, 129); // Green 500
    doc.rect(margin + 5, y, 42, 14, 'D');
    doc.setTextColor(16, 185, 129);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('PAID IN FULL', margin + 11, y + 6);
    doc.setFontSize(6.5);
    doc.text('NUVVO PAYMENT SYS', margin + 9, y + 11);
  } else {
    doc.setDrawColor(239, 68, 68); // Red 500
    doc.rect(margin + 5, y, 42, 14, 'D');
    doc.setTextColor(239, 68, 68);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('CANCELLED', margin + 13, y + 6);
    doc.setFontSize(6.5);
    doc.text('REFUND INITIATED', margin + 11, y + 11);
  }

  // Support / Help meta
  doc.setTextColor(113, 113, 122);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Need help with this order? Speak to support at help@nuvvogourmet.com', margin + 55, y + 4);
  doc.text('Alternatively, open Nuvvo app > Account > Help Desk for instantaneous resolution.', margin + 55, y + 8);
  doc.text('This document is a digitally synchronized valid tax invoice under Indian GST Acts.', margin + 55, y + 12);

  // --- 6. FOOTER BRAND PROMISE ---
  doc.setLineWidth(0.2);
  doc.setDrawColor(244, 244, 245);
  doc.line(margin, 280, margin + 180, 280);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(161, 161, 170); // Zinc 400
  doc.text('Thank you for dining with Nuvvo Gourmet • Powered by Hyperlocal Chirala Nodes', 105, 286, { align: 'center' });

  // Save/Download PDF file
  doc.save(`nuvvo-invoice-${formattedRef.toLowerCase()}.pdf`);
}
