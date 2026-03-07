import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ============================================================
   FORMAT HELPERS
============================================================ */

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatCurrency = (num) =>
  "Rs. " + Number(num).toLocaleString("en-IN", { minimumFractionDigits: 2 });

const itemsToText = (items) =>
  items
    .map((i) =>
      i.designType
        ? `${i.designName} (${i.designType}) x${i.quantity}`
        : `${i.designName} x${i.quantity}`,
    )
    .join(", ");

/* ============================================================
   HEADER
============================================================ */

const drawHeader = (doc, title, subtitle) => {
  const W = doc.internal.pageSize.width;

  doc.setFillColor(30, 10, 78);
  doc.rect(0, 0, W, 32, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);

  doc.text("SANNI PATEL - JACQUARD DESIGN STUDIO", 12, 14);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("+91 97248 01763 | Surat, Gujarat", 12, 21);

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(title, W - 12, 14, { align: "right" });

  if (subtitle) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(subtitle, W - 12, 21, { align: "right" });
  }

  doc.setFillColor(251, 191, 36);
  doc.rect(0, 30, W, 2, "F");
};

/* ============================================================
   FOOTER
============================================================ */

const drawFooter = (doc) => {
  const W = doc.internal.pageSize.width;
  const H = doc.internal.pageSize.height;

  const y = H - 12;

  doc.setDrawColor(221, 214, 254);
  doc.line(12, y, W - 12, y);

  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);

  doc.text(
    "Sanni Patel - Jacquard Design Studio | Surat, Gujarat | +91 97248 01763",
    W / 2,
    y + 5,
    { align: "center" },
  );

  doc.setFillColor(251, 191, 36);
  doc.rect(0, H - 3, W, 3, "F");
};

/* ============================================================
   BILL TABLE
============================================================ */

const drawBillsTable = (doc, bills, startY) => {
  const rows = bills.map((b, i) => [
    i + 1,
    b.vendorName || "-",
    b.billNumber,
    formatDate(b.createdAt),
    itemsToText(b.items),
    b.status.toUpperCase(),
    formatCurrency(b.subtotal),
    b.taxRate > 0 ? `${b.taxRate}%` : "-",
    formatCurrency(b.grandTotal),
  ]);

  autoTable(doc, {
    startY,

    head: [
      [
        "#",
        "Vendor",
        "Bill No.",
        "Date",
        "Items",
        "Status",
        "Subtotal",
        "GST",
        "Grand Total",
      ],
    ],

    body: rows,

    headStyles: {
      fillColor: [30, 10, 78],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },

    bodyStyles: {
      fontSize: 8,
      textColor: [55, 65, 81],
    },

    alternateRowStyles: {
      fillColor: [248, 246, 255],
    },

    columnStyles: {
      0: { cellWidth: 10, halign: "left" },
      1: { cellWidth: 40, halign: "left", fontStyle: "bold" },
      2: { cellWidth: 32, halign: "left", fontStyle: "bold" },
      3: { cellWidth: 28, halign: "left" },
      4: { cellWidth: "auto", halign: "left", fontSize: 7 },
      5: { cellWidth: 22, halign: "left", fontStyle: "bold" },
      6: { cellWidth: 32, halign: "left" },
      7: { cellWidth: 18, halign: "left" },
      8: {
        cellWidth: 36,
        halign: "left",
        fontStyle: "bold",
        textColor: [88, 28, 135],
      },
    },

    didParseCell: (data) => {
      if (data.column.index === 5 && data.section === "body") {
        const val = data.cell.raw;

        if (val === "PAID") data.cell.styles.textColor = [22, 163, 74];
        else if (val === "UNPAID") data.cell.styles.textColor = [220, 38, 38];
        else data.cell.styles.textColor = [217, 119, 6];
      }
    },
  });

  return doc.lastAutoTable.finalY;
};

/* ============================================================
   SINGLE BILL PDF
============================================================ */

export const generateBillPDF = (bill) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const W = doc.internal.pageSize.width;
  const H = doc.internal.pageSize.height;

  drawHeader(doc, "INVOICE", `Bill No: ${bill.billNumber}`);

  /* Vendor Info */

  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);

  doc.text(`Vendor: ${bill.vendorName}`, 14, 45);
  doc.text(`Date: ${formatDate(bill.createdAt)}`, W - 14, 45, {
    align: "right",
  });

  if (bill.vendorPhone) doc.text(`Phone: ${bill.vendorPhone}`, 14, 52);

  if (bill.vendorAddress) doc.text(`Address: ${bill.vendorAddress}`, 14, 59);

  doc.text(`Status: ${bill.status.toUpperCase()}`, W - 14, 52, {
    align: "right",
  });

  /* Items Table */

  const rows = bill.items.map((i) => [
    i.designName,
    i.designType || "-",
    i.quantity,
    formatCurrency(i.price),
    bill.taxRate > 0 ? `${bill.taxRate}%` : "-",
    formatCurrency(i.total),
  ]);

  autoTable(doc, {
    startY: 70,

    head: [["Design", "Type", "Qty", "Unit Price", "GST", "Total"]],
    body: rows,

    headStyles: {
      fillColor: [30, 10, 78],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },

    alternateRowStyles: {
      fillColor: [248, 246, 255],
    },

    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 30 },
      2: { cellWidth: 20, halign: "left" },
      3: { cellWidth: 30, halign: "left" },
      4: { cellWidth: 20, halign: "left" },
      5: {
        cellWidth: 30,
        halign: "left",
        fontStyle: "bold",
        textColor: [88, 28, 135],
      },
    },
  });

  const finalY = doc.lastAutoTable.finalY + 10;

  /* Totals */

  const boxX = W - 90;

  doc.setFillColor(248, 246, 255);
  doc.setDrawColor(221, 214, 254);

  const boxHeight = bill.taxRate > 0 ? 38 : 26;

  doc.roundedRect(boxX, finalY, 76, boxHeight, 3, 3, "FD");

  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);

  doc.text("SUB TOTAL", boxX + 6, finalY + 10);
  doc.text(formatCurrency(bill.subtotal), W - 18, finalY + 10, {
    align: "right",
  });

  if (bill.taxRate > 0) {
    doc.text(`GST (${bill.taxRate}%)`, boxX + 6, finalY + 18);
    doc.text(formatCurrency(bill.taxAmount), W - 18, finalY + 18, {
      align: "right",
    });
  }

  doc.setFillColor(30, 10, 78);
  const grandY = bill.taxRate > 0 ? finalY + 26 : finalY + 18;

  doc.roundedRect(boxX, grandY, 76, 10, 2, 2, "F");

  const centerX = boxX + 76 / 2;

doc.setTextColor(196, 181, 253);
doc.text("GRAND TOTAL", centerX, grandY + 4, { align: "center" });


  doc.setTextColor(255, 255, 255);
  doc.text(formatCurrency(bill.grandTotal), W - 18, finalY + 29, {
    align: "right",
  });

  drawFooter(doc);

  doc.save(`${bill.billNumber}-${bill.vendorName}.pdf`);
};

/* ============================================================
   MONTHLY REPORT
============================================================ */

export const generateMonthlyPDF = (bills, year, month) => {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const monthName = new Date(year, month - 1).toLocaleString("en-IN", {
    month: "long",
  });

  drawHeader(doc, "MONTHLY REPORT", `${monthName} ${year}`);

  const finalY = drawBillsTable(doc, bills, 40);

  const total = bills.reduce((sum, b) => sum + b.grandTotal, 0);

  doc.setFillColor(30, 10, 78);
  doc.roundedRect(200, finalY + 6, 80, 10, 2, 2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);

  doc.text("MONTH TOTAL", 205, finalY + 12);
  doc.text(formatCurrency(total), 275, finalY + 12, { align: "right" });

  drawFooter(doc);

  doc.save(`Monthly-Report-${monthName}-${year}.pdf`);
};

/* ============================================================
   DAILY REPORT
============================================================ */

export const generateDailyPDF = (bills, date) => {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const day = formatDate(date);

  drawHeader(doc, "DAILY REPORT", day);

  const finalY = drawBillsTable(doc, bills, 40);

  const total = bills.reduce((sum, b) => sum + b.grandTotal, 0);

  doc.setFillColor(30, 10, 78);
  doc.roundedRect(200, finalY + 6, 80, 10, 2, 2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);

  doc.text("DAY TOTAL", 205, finalY + 12);
  doc.text(formatCurrency(total), 275, finalY + 12, { align: "right" });

  drawFooter(doc);

  doc.save(`Daily-Report-${day}.pdf`);
};
