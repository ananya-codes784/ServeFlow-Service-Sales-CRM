import PDFDocument from 'pdfkit';

const INR = (amount: number) => `\u20B9${Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const generateInvoicePDF = (invoiceData: any): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      const BRAND = '#4f46e5';
      const DARK = '#0f172a';
      const MUTED = '#64748b';
      const LIGHT_BG = '#f8fafc';

      // ── Header Band ──────────────────────────────────────────────────
      doc.rect(0, 0, 595, 90).fill(BRAND);
      doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold').text('SERVEWELL CRM', 50, 28);
      doc.fontSize(9).font('Helvetica').text('Enterprise Service & Sales Management System', 50, 54);
      doc.text('billing@servewell.com  |  +91 98765 43210', 50, 67);

      // Invoice title top-right
      doc.fontSize(28).font('Helvetica-Bold').fillColor('#ffffff').text('INVOICE', 0, 28, { align: 'right', width: 545 });
      doc.fontSize(10).font('Helvetica').text(`# ${invoiceData.invoiceNumber}`, 0, 60, { align: 'right', width: 545 });

      // ── Sub-Header Info ──────────────────────────────────────────────
      let y = 110;
      // Left: Billed To
      doc.fillColor(DARK).fontSize(9).font('Helvetica-Bold').text('BILLED TO', 50, y);
      doc.fontSize(11).font('Helvetica-Bold').fillColor(DARK).text(invoiceData.customerName || '', 50, y + 14);
      doc.fontSize(9).font('Helvetica').fillColor(MUTED).text(invoiceData.customerAddress || '', 50, y + 28, { width: 220 });
      if (invoiceData.customerGst) {
        doc.text(`GSTIN: ${invoiceData.customerGst}`, 50, y + 52);
      }

      // Right: Invoice meta
      const metaX = 380;
      const lineH = 15;
      doc.fontSize(9).font('Helvetica-Bold').fillColor(DARK).text('Issue Date:', metaX, y);
      doc.font('Helvetica').fillColor(MUTED).text(new Date(invoiceData.issueDate || Date.now()).toLocaleDateString('en-IN'), metaX + 80, y);
      doc.font('Helvetica-Bold').fillColor(DARK).text('Due Date:', metaX, y + lineH);
      doc.font('Helvetica').fillColor(MUTED).text(new Date(invoiceData.dueDate || Date.now()).toLocaleDateString('en-IN'), metaX + 80, y + lineH);
      doc.font('Helvetica-Bold').fillColor(DARK).text('Type:', metaX, y + lineH * 2);
      doc.font('Helvetica').fillColor(MUTED).text(invoiceData.relatedType || 'SERVICE', metaX + 80, y + lineH * 2);
      doc.font('Helvetica-Bold').fillColor(DARK).text('GST Type:', metaX, y + lineH * 3);
      doc.font('Helvetica').fillColor(MUTED).text(invoiceData.gstType === 'INTER_STATE' ? 'Inter-State (IGST)' : 'Intra-State (CGST+SGST)', metaX + 80, y + lineH * 3);
      doc.font('Helvetica-Bold').fillColor(DARK).text('Status:', metaX, y + lineH * 4);
      doc.font('Helvetica').fillColor(invoiceData.paymentStatus === 'PAID' ? '#16a34a' : '#dc2626').text(invoiceData.paymentStatus || 'UNPAID', metaX + 80, y + lineH * 4);

      // ── Line Items Table ──────────────────────────────────────────────
      y = 210;
      // Table header
      doc.rect(50, y, 495, 22).fill(BRAND);
      doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
      doc.text('#', 58, y + 7);
      doc.text('Description', 72, y + 7);
      doc.text('HSN', 290, y + 7);
      doc.text('Qty', 330, y + 7);
      doc.text('Rate', 365, y + 7);
      doc.text('Tax%', 415, y + 7);
      doc.text('Amount', 460, y + 7);

      y += 26;
      const items = invoiceData.items || [];
      items.forEach((item: any, idx: number) => {
        const rowBg = idx % 2 === 0 ? '#ffffff' : LIGHT_BG;
        doc.rect(50, y - 3, 495, 18).fill(rowBg);
        doc.fillColor(DARK).fontSize(9).font('Helvetica');
        doc.text(String(idx + 1), 58, y);
        doc.text(item.description || '', 72, y, { width: 210 });
        doc.text(item.hsnCode || '-', 290, y);
        doc.text(String(item.quantity || 1), 330, y);
        doc.text(INR(item.unitPrice || 0), 350, y);
        doc.text(`${item.taxRate || 18}%`, 415, y);
        doc.text(INR(item.amount || 0), 455, y);
        y += 20;
      });

      // ── Divider ──────────────────────────────────────────────────────
      doc.moveTo(50, y + 5).lineTo(545, y + 5).strokeColor('#e2e8f0').lineWidth(1).stroke();
      y += 15;

      // ── Tax Summary ───────────────────────────────────────────────────
      const summaryX = 360;
      doc.fontSize(9).font('Helvetica').fillColor(MUTED).text('Subtotal (Taxable Value):', summaryX, y, { width: 130 });
      doc.fillColor(DARK).text(INR(invoiceData.subtotal || 0), summaryX + 135, y, { align: 'right', width: 60 });
      y += 14;

      if (invoiceData.gstType === 'INTRA_STATE') {
        doc.fillColor(MUTED).text('CGST (9%):', summaryX, y, { width: 130 });
        doc.fillColor(DARK).text(INR(invoiceData.cgst || 0), summaryX + 135, y, { align: 'right', width: 60 });
        y += 14;
        doc.fillColor(MUTED).text('SGST (9%):', summaryX, y, { width: 130 });
        doc.fillColor(DARK).text(INR(invoiceData.sgst || 0), summaryX + 135, y, { align: 'right', width: 60 });
        y += 14;
      } else {
        doc.fillColor(MUTED).text('IGST (18%):', summaryX, y, { width: 130 });
        doc.fillColor(DARK).text(INR(invoiceData.igst || 0), summaryX + 135, y, { align: 'right', width: 60 });
        y += 14;
      }

      doc.fillColor(MUTED).text('Total Tax:', summaryX, y, { width: 130 });
      doc.fillColor(DARK).text(INR(invoiceData.taxAmount || 0), summaryX + 135, y, { align: 'right', width: 60 });
      y += 8;
      doc.moveTo(summaryX, y).lineTo(545, y).strokeColor('#cbd5e1').stroke();
      y += 8;

      // Grand Total row
      doc.rect(summaryX - 5, y - 3, 200, 22).fill(BRAND);
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#ffffff').text('GRAND TOTAL:', summaryX, y + 3, { width: 130 });
      doc.text(INR(invoiceData.totalAmount || 0), summaryX + 130, y + 3, { align: 'right', width: 65 });
      y += 35;

      // Paid amount if partial/paid
      if (invoiceData.paidAmount > 0) {
        doc.fontSize(9).font('Helvetica').fillColor('#16a34a').text(`Amount Received: ${INR(invoiceData.paidAmount)}`, summaryX, y);
        y += 13;
        doc.fillColor('#dc2626').text(`Balance Due: ${INR(invoiceData.totalAmount - invoiceData.paidAmount)}`, summaryX, y);
      }

      // ── Notes ─────────────────────────────────────────────────────────
      if (invoiceData.notes) {
        y += 20;
        doc.fontSize(9).font('Helvetica-Bold').fillColor(DARK).text('Notes:', 50, y);
        doc.font('Helvetica').fillColor(MUTED).text(invoiceData.notes, 50, y + 13, { width: 280 });
      }

      // ── Footer ─────────────────────────────────────────────────────────
      doc.rect(0, 790, 595, 52).fill(BRAND);
      doc.fontSize(8).font('Helvetica').fillColor('#c7d2fe')
        .text('Thank you for your business! This is a computer-generated invoice. No signature required.', 50, 802, { align: 'center', width: 495 });
      doc.text('ServeWell CRM | Enterprise Service & Sales Management | billing@servewell.com', 50, 818, { align: 'center', width: 495 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

export const generatePaymentReceiptPDF = (paymentData: any): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      const BRAND = '#16a34a'; // Green for payment receipt

      // ── Header ────────────────────────────────────────────────────────
      doc.rect(0, 0, 595, 90).fill(BRAND);
      doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold').text('SERVEWELL CRM', 50, 28);
      doc.fontSize(9).font('Helvetica').text('Payment Receipt', 50, 54);
      doc.fontSize(28).font('Helvetica-Bold').text('RECEIPT', 0, 28, { align: 'right', width: 545 });
      doc.fontSize(10).font('Helvetica').text(`# ${paymentData.paymentReference}`, 0, 60, { align: 'right', width: 545 });

      // ── Body ──────────────────────────────────────────────────────────
      let y = 120;
      doc.rect(50, y, 495, 140).fill('#f0fdf4').stroke('#bbf7d0');
      y += 15;

      const row = (label: string, value: string, yPos: number) => {
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#166534').text(label, 70, yPos);
        doc.font('Helvetica').fillColor('#15803d').text(value, 250, yPos);
      };

      row('Payment Reference:', paymentData.paymentReference, y);
      row('Invoice Number:', paymentData.invoiceNumber, y + 18);
      row('Customer Name:', paymentData.customerName, y + 36);
      row('Amount Received:', INR(paymentData.amount || 0), y + 54);
      row('Payment Method:', paymentData.paymentMethod || '', y + 72);
      row('Transaction ID:', paymentData.transactionId || 'N/A', y + 90);
      row('Payment Date:', new Date(paymentData.paymentDate || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }), y + 108);

      // ── Amount Box ────────────────────────────────────────────────────
      y += 175;
      doc.rect(150, y, 295, 60).fill(BRAND);
      doc.fontSize(13).font('Helvetica-Bold').fillColor('#ffffff').text('AMOUNT PAID', 150, y + 10, { align: 'center', width: 295 });
      doc.fontSize(22).text(INR(paymentData.amount || 0), 150, y + 28, { align: 'center', width: 295 });

      // ── Notes ─────────────────────────────────────────────────────────
      if (paymentData.notes) {
        y += 80;
        doc.fontSize(9).font('Helvetica').fillColor('#64748b').text(`Notes: ${paymentData.notes}`, 50, y, { align: 'center', width: 495 });
      }

      // ── Footer ─────────────────────────────────────────────────────────
      doc.rect(0, 790, 595, 52).fill(BRAND);
      doc.fontSize(8).font('Helvetica').fillColor('#bbf7d0')
        .text('This is an official payment receipt generated by ServeWell CRM.', 50, 802, { align: 'center', width: 495 });
      doc.text('Please retain this receipt for your records. | billing@servewell.com', 50, 818, { align: 'center', width: 495 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
