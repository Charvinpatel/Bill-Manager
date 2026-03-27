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

const drawBillsTable = (doc, bills, startY, title, subtitle, isSingleVendor = false) => {
  const rows = [];
  let rowCount = 1;

  bills.forEach((b) => {
    b.items.forEach((item, index) => {
      const row = [
        index === 0 ? rowCount++ : "",
        formatDate(b.billDate || b.createdAt),
      ];

      if (!isSingleVendor) {
        row.push(b.vendorName || "-");
      }

      row.push(
        item.designName,
        item.designType || "-",
        item.quantity,
        formatCurrency(item.price),
        formatCurrency(item.total)
      );

      rows.push(row);
    });
  });

  const head = [
    "#",
    "Date",
  ];

  if (!isSingleVendor) {
    head.push("Vendor");
  }

  head.push(
    "Design",
    "Type",
    "Qty",
    "Price",
    "Total"
  );

  autoTable(doc, {
    startY,
    margin: { top: 40, bottom: 20 },

    didDrawPage: (data) => {
      drawHeader(doc, title, subtitle);
      drawFooter(doc);
    },

    head: [head],

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

    columnStyles: isSingleVendor 
      ? {
          0: { cellWidth: 10, halign: "left" },
          1: { cellWidth: 35, halign: "left" },
          2: { cellWidth: "auto", halign: "left" },
          3: { cellWidth: 30, halign: "left" },
          4: { cellWidth: 20, halign: "left" },
          5: { cellWidth: 35, halign: "left" },
          6: {
            cellWidth: 35,
            halign: "left",
            fontStyle: "bold",
            textColor: [88, 28, 135],
          },
        }
      : {
          0: { cellWidth: 10, halign: "left" },
          1: { cellWidth: 30, halign: "left" },
          2: { cellWidth: 40, halign: "left", fontStyle: "bold" },
          3: { cellWidth: "auto", halign: "left" },
          4: { cellWidth: 30, halign: "left" },
          5: { cellWidth: 20, halign: "left" },
          6: { cellWidth: 35, halign: "left" },
          7: {
            cellWidth: 35,
            halign: "left",
            fontStyle: "bold",
            textColor: [88, 28, 135],
          },
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

  drawHeader(doc, "INVOICE");

  /* Vendor Info */

  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);

  doc.text(`Vendor: ${bill.vendorName}`, 14, 45);
  doc.text(`Date: ${formatDate(bill.billDate || bill.createdAt)}`, W - 14, 45, {
    align: "right",
  });

  if (bill.vendorPhone) doc.text(`Phone: ${bill.vendorPhone}`, 14, 52);

  if (bill.vendorAddress) doc.text(`Address: ${bill.vendorAddress}`, 14, 59);

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

  const boxWidth = 70;
  const boxX = W - boxWidth - 14; 

  doc.setFillColor(248, 246, 255);
  doc.setDrawColor(221, 214, 254);

  const hasTax = bill.items.some(i => i.taxRate > 0);
  const boxHeight = hasTax ? 38 : 26;

  doc.roundedRect(boxX, finalY, boxWidth, boxHeight, 3, 3, "FD");

  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);

  doc.text("SUB TOTAL", boxX + 8, finalY + 10);
  doc.text(formatCurrency(bill.subtotal), boxX + boxWidth - 8, finalY + 10, {
    align: "right",
  });

  if (hasTax) {
    doc.text(`TOTAL GST`, boxX + 8, finalY + 18);
    doc.text(formatCurrency(bill.taxAmount), boxX + boxWidth - 8, finalY + 18, {
      align: "right",
    });
  }

  doc.setFillColor(30, 10, 78);
  const grandY = hasTax ? finalY + 26 : finalY + 18;

  doc.roundedRect(boxX, grandY, boxWidth, 10, 2, 2, "F");

  const centerX = boxX + boxWidth / 2;

  doc.setTextColor(196, 181, 253);
  doc.text("GRAND TOTAL", boxX + 8, grandY + 6.5, { align: "left" });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text(formatCurrency(bill.grandTotal), boxX + boxWidth - 8, grandY + 6.5, {
    align: "right",
  });

  drawFooter(doc);

  doc.save(`${bill.billNumber}-${bill.vendorName}.pdf`);
};

/* ============================================================
   MONTHLY REPORT
============================================================ */

export const generateMonthlyPDF = (bills, year, month, summary, vendors) => {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const monthName = new Date(year, month - 1).toLocaleString("en-IN", {
    month: "long",
  });

  const title = "MONTHLY REPORT";
  const subtitle = `${monthName} ${year}`;

  const isSingleVendor = vendors && vendors.length === 1;
  let startY = 40;

  if (isSingleVendor) {
    const v = vendors[0];
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 10, 78);
    doc.text(`Vendor: ${v.vendorName}`, 14, 38);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(55, 65, 81);
    
    let infoX = 14;
    if (v.vendorPhone) {
      doc.text(`Phone: ${v.vendorPhone}`, infoX, 43);
      infoX += 50;
    }
    if (v.vendorAddress) {
      doc.text(`Address: ${v.vendorAddress}`, infoX, 43);
    }
    startY = 48;
  }

  const finalY = drawBillsTable(doc, bills, startY, title, subtitle, isSingleVendor);

  const total = bills.reduce((sum, b) => sum + b.grandTotal, 0);

  const H = doc.internal.pageSize.height;
  let summaryY = finalY + 6;

  if (summaryY + 12 > H - 15) {
    doc.addPage();
    drawHeader(doc, title, subtitle);
    drawFooter(doc);
    summaryY = 40;
  }

  doc.setFillColor(30, 10, 78);
  doc.roundedRect(200, summaryY, 80, 10, 2, 2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);

  doc.text("MONTH TOTAL", 205, summaryY + 6);
  doc.text(formatCurrency(total), 275, summaryY + 6, { align: "right" });

  doc.save(`Monthly-Report-${monthName}-${year}.pdf`);
};

/* ============================================================
   DAILY REPORT
============================================================ */

export const generateDailyPDF = (bills, date) => {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const day = formatDate(date);
  const title = "DAILY REPORT";
  const subtitle = day;

  const finalY = drawBillsTable(doc, bills, 40, title, subtitle);

  const total = bills.reduce((sum, b) => sum + b.grandTotal, 0);

  const H = doc.internal.pageSize.height;
  let summaryY = finalY + 6;

  if (summaryY + 12 > H - 15) {
    doc.addPage();
    drawHeader(doc, title, subtitle);
    drawFooter(doc);
    summaryY = 40;
  }

  doc.setFillColor(30, 10, 78);
  doc.roundedRect(200, summaryY, 80, 10, 2, 2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);

  doc.text("DAY TOTAL", 205, summaryY + 6);
  doc.text(formatCurrency(total), 275, summaryY + 6, { align: "right" });

  doc.save(`Daily-Report-${day}.pdf`);
};
