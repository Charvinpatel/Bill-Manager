import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateBillPDF = (bill) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.width; // 210
  const H = doc.internal.pageSize.height; // 297

  /* ═══════════════════════════════════════════════
     PAGE BACKGROUND — clean white
  ═══════════════════════════════════════════════ */
  doc.setFillColor(252, 251, 255);
  doc.rect(0, 0, W, H, "F");

  /* ═══════════════════════════════════════════════
     HEADER — deep indigo with gold top stripe
  ═══════════════════════════════════════════════ */
  // Gold top stripe
  doc.setFillColor(251, 191, 36);
  doc.rect(0, 0, W, 3, "F");

  // Indigo header block
  doc.setFillColor(30, 10, 78);
  doc.rect(0, 3, W, 52, "F");

  // ── Logo Badge ──
  doc.setFillColor(251, 191, 36);
  doc.roundedRect(14, 11, 22, 22, 3, 3, "F");
  // Logo shine
  doc.setFillColor(253, 224, 71);
  doc.roundedRect(15, 12, 8, 8, 1.5, 1.5, "F");
  // "SP" text
  doc.setTextColor(30, 10, 78);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("SP", 25, 26, { align: "center" });

  // ── Company name ──
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("SANNI PATEL", 42, 21);

  // Tagline
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(196, 181, 253);
  doc.text("JACQUARD DESIGN STUDIO", 42, 27);

  // Gold underline
  doc.setFillColor(251, 191, 36);
  doc.rect(42, 29, 52, 0.6, "F");

  // Contact info
  doc.setTextColor(165, 180, 252);
  doc.setFontSize(8);
  doc.text("+91 97248 01763", 42, 35);
  doc.text("sannipatel7284@gmail.com", 42, 41);
  doc.text("Surat, Gujarat, India", 42, 47);

  // ── INVOICE label (right) ──
  doc.setTextColor(251, 191, 36);
  doc.setFontSize(30);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", W - 14, 26, { align: "right" });

  // Gold underline
  doc.setFillColor(251, 191, 36);
  doc.rect(W - 62, 28.5, 48, 0.6, "F");

  // Bill meta
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(196, 181, 253);
  doc.text("BILL NO:", W - 62, 36);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text(bill.billNumber, W - 14, 36, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setTextColor(196, 181, 253);
  doc.text("DATE:", W - 62, 43);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text(
    new Date(bill.createdAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    W - 14,
    43,
    { align: "right" },
  );

  // ── Status pill ──
  const sc =
    bill.status === "paid"
      ? [22, 163, 74]
      : bill.status === "unpaid"
        ? [220, 38, 38]
        : [217, 119, 6];
  const scText =
    bill.status === "paid"
      ? [220, 252, 231]
      : bill.status === "unpaid"
        ? [254, 226, 226]
        : [254, 243, 199];
  doc.setFillColor(...sc);
  doc.roundedRect(W - 38, 47, 24, 7, 2, 2, "F");
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...scText);
  doc.text(bill.status.toUpperCase(), W - 26, 52, { align: "center" });

  /* ═══════════════════════════════════════════════
   BILL TO SECTION — Improved spacing & background
═══════════════════════════════════════════════ */

  const bY = 62;

  // Visible soft lavender background
  doc.setFillColor(237, 233, 254);
  doc.setDrawColor(221, 214, 254);
  doc.setLineWidth(0.4);
  doc.roundedRect(14, bY - 3, 86, 34, 3, 3, "FD");

  // Accent vertical line
  doc.setFillColor(124, 58, 237);
  doc.roundedRect(14, bY - 3, 3, 34, 1, 1, "F");

  // BILL TO title
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(79, 70, 229);
  doc.text("BILL TO", 20, bY + 5);

  // Vendor Name
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(17, 24, 39);
  doc.text(bill.vendorName, 20, bY + 14);

  // Address
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(75, 85, 99);

  let addrY = bY + 21;

  if (bill.vendorAddress) {
    const addrLines = doc.splitTextToSize(bill.vendorAddress, 70);
    doc.text(addrLines, 20, addrY);
    addrY += addrLines.length * 5;
  }

  // Phone
  if (bill.vendorPhone) {
    doc.text("Phone: " + bill.vendorPhone, 20, addrY + 2);
  }

  /* ═══════════════════════════════════════════════
     ITEMS TABLE
  ═══════════════════════════════════════════════ */
  const tableY = bY + 49; // increased spacing after vendor section

  // Table title — perfectly aligned with table content
  doc.setFontSize(8.6);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 10, 78);
  doc.text("DESIGN ITEMS", 14, tableY - 7);

  const tableData = bill.items.map((item, i) => [
    item.designName,
    String(item.quantity),
    "Rs. " + item.price.toLocaleString("en-IN", { minimumFractionDigits: 2 }),
    "Rs. " + item.total.toLocaleString("en-IN", { minimumFractionDigits: 2 }),
  ]);

  autoTable(doc, {
    startY: tableY,
    head: [["Design Name", "Qty", "Unit Price", "Total"]],
    body: tableData,
    headStyles: {
      fillColor: [30, 10, 78],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.7,
      cellPadding: { top: 6.5, bottom: 6.5, left: 6, right: 6 },
      lineWidth: 0,
    },
    bodyStyles: {
      fillColor: [255, 255, 255],
      textColor: [55, 65, 81],
      fontSize: 9.1,
      cellPadding: { top: 6, bottom: 6, left: 6, right: 6 },
      lineColor: [243, 244, 246],
      lineWidth: 0.35,
    },
    alternateRowStyles: { fillColor: [250, 247, 255] },
    columnStyles: {
      0: { cellWidth: "auto", fontStyle: "medium", textColor: [17, 24, 39] },
      1: { cellWidth: 22, halign: "start" },
      2: { cellWidth: 38, halign: "end" },
      3: {
        cellWidth: 46,
        halign: "end",
        fontStyle: "bold",
        textColor: [88, 28, 135],
      },
    },
    margin: { left: 14, right: 14 },
    tableLineColor: [221, 214, 254],
    tableLineWidth: 0.35,
  });

  /* ═══════════════════════════════════════════════
     TOTALS
  ═══════════════════════════════════════════════ */
  const tY = doc.lastAutoTable.finalY + 8;
  const tW = 84;
  const tX = W - 14 - tW;

  // Totals card background
  doc.setFillColor(248, 246, 255);
  doc.setDrawColor(221, 214, 254);
  doc.setLineWidth(0.5);
  doc.roundedRect(tX, tY, tW, bill.taxRate > 0 ? 42 : 32, 4, 4, "FD");

  // Subtotal
  doc.setFontSize(8.7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(75, 85, 99);
  doc.text("Subtotal", tX + 8, tY + 11);
  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "bold");
  doc.text(
    "Rs. " +
      bill.subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 }),
    W - 19,
    tY + 11,
    { align: "right" },
  );

  // Divider
  doc.setDrawColor(221, 214, 254);
  doc.setLineWidth(0.4);
  doc.line(tX + 7, tY + 16, W - 19, tY + 16);

  if (bill.taxRate > 0) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(75, 85, 99);
    doc.text(`GST (${bill.taxRate}%)`, tX + 8, tY + 23);
    doc.setTextColor(17, 24, 39);
    doc.setFont("helvetica", "bold");
    doc.text(
      "Rs. " +
        bill.taxAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 }),
      W - 19,
      tY + 23,
      { align: "right" },
    );
    doc.setDrawColor(221, 214, 254);
    doc.line(tX + 7, tY + 27.5, W - 19, tY + 27.5);
  }

  // Grand Total bar
  const gtOffset = bill.taxRate > 0 ? 30 : 20;
  doc.setFillColor(30, 10, 78);
  doc.roundedRect(tX, tY + gtOffset, tW, 13, 3, 3, "F");
  doc.setFontSize(8.8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(196, 181, 253);
  doc.text("GRAND TOTAL", tX + 8, tY + gtOffset + 8.5);
  doc.setFontSize(11.5);
  doc.setTextColor(255, 255, 255);
  doc.text(
    "Rs. " +
      bill.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 }),
    W - 19,
    tY + gtOffset + 8.5,
    { align: "right" },
  );

  /* ═══════════════════════════════════════════════
     NOTES (left of totals)
  ═══════════════════════════════════════════════ */
  if (bill.notes) {
    const noteWidth = tX - 26;
    doc.setFillColor(255, 251, 235);
    doc.setDrawColor(253, 230, 138);
    doc.setLineWidth(0.5);
    doc.roundedRect(14, tY, noteWidth, bill.taxRate > 0 ? 42 : 32, 4, 4, "FD");

    doc.setFillColor(245, 158, 11);
    doc.roundedRect(14, tY, 3.5, bill.taxRate > 0 ? 42 : 32, 1.5, 1.5, "F");

    doc.setFontSize(7.7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(146, 64, 14);
    doc.text("NOTE", 20, tY + 9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 85, 15);
    const noteLines = doc.splitTextToSize(bill.notes, noteWidth - 14);
    doc.text(noteLines, 20, tY + 17);
  }

  /* ═══════════════════════════════════════════════
     FOOTER
  ═══════════════════════════════════════════════ */
  const fY = H - 20;

  // Footer divider
  doc.setDrawColor(221, 214, 254);
  doc.setLineWidth(0.5);
  doc.line(14, fY - 4, W - 14, fY - 4);

  // Thank you message
  doc.setFontSize(9.2);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(88, 28, 135);
  doc.text("Thank you for your business!", W / 2, fY + 2, { align: "center" });

  doc.setFontSize(7.6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(156, 163, 175);
  doc.text(
    "Sanni Patel — Jacquard Design Studio  |  +91 97248 01763  |  Surat, Gujarat",
    W / 2,
    fY + 9,
    { align: "center" },
  );

  // Gold bottom stripe
  doc.setFillColor(251, 191, 36);
  doc.rect(0, H - 3, W, 3, "F");

  /* ═══════════════════════════════════════════════
     SAVE
  ═══════════════════════════════════════════════ */
  doc.save(`${bill.billNumber} - ${bill.vendorName}.pdf`);
};
