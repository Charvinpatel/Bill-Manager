import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ═══════════════════════════════════════════════════════════════
   SINGLE BILL PDF
═══════════════════════════════════════════════════════════════ */
export const generateBillPDF = (bill) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.width;
  const H = doc.internal.pageSize.height;

  doc.setFillColor(252, 251, 255);
  doc.rect(0, 0, W, H, "F");
  doc.setFillColor(251, 191, 36);
  doc.rect(0, 0, W, 3, "F");
  doc.setFillColor(30, 10, 78);
  doc.rect(0, 3, W, 52, "F");

  doc.setFillColor(251, 191, 36);
  doc.roundedRect(14, 11, 22, 22, 3, 3, "F");
  doc.setFillColor(253, 224, 71);
  doc.roundedRect(15, 12, 8, 8, 1.5, 1.5, "F");
  doc.setTextColor(30, 10, 78);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("SP", 25, 26, { align: "center" });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("SANNI PATEL", 42, 21);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(196, 181, 253);
  doc.text("JACQUARD DESIGN STUDIO", 42, 27);
  doc.setFillColor(251, 191, 36);
  doc.rect(42, 29, 52, 0.6, "F");
  doc.setTextColor(165, 180, 252);
  doc.setFontSize(8);
  doc.text("+91 97248 01763", 42, 35);
  doc.text("sannipatel7284@gmail.com", 42, 41);
  doc.text("Surat, Gujarat, India", 42, 47);

  doc.setTextColor(251, 191, 36);
  doc.setFontSize(30);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", W - 14, 26, { align: "right" });
  doc.setFillColor(251, 191, 36);
  doc.rect(W - 62, 28.5, 48, 0.6, "F");
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

  const bY = 63;
  doc.setFillColor(248, 246, 255);
  doc.roundedRect(14, bY - 4, 88, 42, 4, 4, "F");
  doc.setFontSize(7.8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(88, 28, 135);
  doc.text("BILL TO", 19, bY + 6);
  doc.setFontSize(13.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(17, 24, 39);
  doc.text(bill.vendorName, 19, bY + 17);
  doc.setFontSize(8.8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(75, 85, 99);
  let addrY = bY + 26;
  if (bill.vendorAddress) {
    doc.text(bill.vendorAddress, 19, addrY);
    addrY += 7.5;
  }
  if (bill.vendorPhone) doc.text("Ph: " + bill.vendorPhone, 19, addrY);

  const tableY = bY + 49;
  doc.setFontSize(8.6);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 10, 78);
  doc.text("DESIGN ITEMS", 14, tableY - 7);

  const tableData = bill.items.map((item) => [
    item.designName,
    item.designType || "-",
    String(item.quantity),
    "Rs. " + item.price.toLocaleString("en-IN", { minimumFractionDigits: 2 }),
    "Rs. " + item.total.toLocaleString("en-IN", { minimumFractionDigits: 2 }),
  ]);

  autoTable(doc, {
    startY: tableY,
    head: [["Design Name", "Type", "Qty", "Unit Price", "Total"]],
    body: tableData,
    headStyles: {
      fillColor: [30, 10, 78],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.7,
      cellPadding: { top: 6.5, bottom: 6.5, left: 6, right: 6 },
      lineWidth: 0,
      halign: "center",
      valign: "middle",
    },
    bodyStyles: {
      fillColor: [255, 255, 255],
      textColor: [55, 65, 81],
      fontSize: 9.1,
      cellPadding: { top: 6, bottom: 6, left: 6, right: 6 },
      lineColor: [243, 244, 246],
      lineWidth: 0.35,
      halign: "center",
      valign: "middle",
    },
    alternateRowStyles: { fillColor: [250, 247, 255] },
    columnStyles: {
      0: {
        cellWidth: 10,
        halign: "center",
        valign: "middle",
        textColor: [156, 163, 175],
      },
      1: {
        cellWidth: 32,
        fontStyle: "bold",
        textColor: [17, 24, 39],
        valign: "middle",
      },
      2: {
        cellWidth: 26,
        halign: "center",
        valign: "middle",
      },
      3: {
        cellWidth: "auto",
        fontSize: 6.5,
        textColor: [107, 114, 128],
        valign: "middle",
      },
      4: {
        cellWidth: 20,
        halign: "center",
        valign: "middle",
        fontStyle: "bold",
      },
      5: {
        cellWidth: 34,
        halign: "right",
        valign: "middle",
      },
      6: {
        cellWidth: 18,
        halign: "center",
        valign: "middle",
      },
      7: {
        cellWidth: 36,
        halign: "right",
        valign: "middle",
        fontStyle: "bold",
        textColor: [88, 28, 135],
      },
    },
    margin: { left: 14, right: 14 },
    tableLineColor: [221, 214, 254],
    tableLineWidth: 0.35,
  });

  const tY = doc.lastAutoTable.finalY + 8;
  const tW = 84;
  const tX = W - 14 - tW;

  doc.setFillColor(248, 246, 255);
  doc.setDrawColor(221, 214, 254);
  doc.setLineWidth(0.5);
  doc.roundedRect(tX, tY, tW, bill.taxRate > 0 ? 42 : 32, 4, 4, "FD");
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
  doc.setDrawColor(221, 214, 254);
  doc.setLineWidth(0.4);
  doc.line(tX + 7, tY + 16, W - 19, tY + 16);

  if (bill.taxRate > 0) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(75, 85, 99);
    doc.text("GST (" + bill.taxRate + "%)", tX + 8, tY + 23);
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
    doc.text(doc.splitTextToSize(bill.notes, noteWidth - 14), 20, tY + 17);
  }

  const fY = H - 20;
  doc.setDrawColor(221, 214, 254);
  doc.setLineWidth(0.5);
  doc.line(14, fY - 4, W - 14, fY - 4);
  doc.setFontSize(9.2);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(88, 28, 135);
  doc.text("Thank you for your business!", W / 2, fY + 2, { align: "center" });
  doc.setFontSize(7.6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(156, 163, 175);
  doc.text(
    "Sanni Patel - Jacquard Design Studio  |  +91 97248 01763  |  Surat, Gujarat",
    W / 2,
    fY + 9,
    { align: "center" },
  );
  doc.setFillColor(251, 191, 36);
  doc.rect(0, H - 3, W, 3, "F");

  doc.save(bill.billNumber + " - " + bill.vendorName + ".pdf");
};

/* ═══════════════════════════════════════════════════════════════
   MONTHLY SUMMARY PDF — vendor-wise sections
   
   vendors: array of { vendorName, bills, totalBills,
                        totalRevenue, paidRevenue, unpaidRevenue }
   summary: overall totals for the month
═══════════════════════════════════════════════════════════════ */
export const generateMonthlyPDF = (bills, year, month, summary, vendors) => {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.width; // 297
  const H = doc.internal.pageSize.height; // 210

  const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthName = MONTH_NAMES[month - 1];

  // ── Helper: draw page header ───────────────────────────────────────────────
  const drawHeader = (vendorLabel) => {
    doc.setFillColor(252, 251, 255);
    doc.rect(0, 0, W, H, "F");
    doc.setFillColor(251, 191, 36);
    doc.rect(0, 0, W, 3, "F");
    doc.setFillColor(30, 10, 78);
    doc.rect(0, 3, W, 34, "F");

    // Logo
    doc.setFillColor(251, 191, 36);
    doc.roundedRect(12, 8, 16, 16, 2, 2, "F");
    doc.setFillColor(253, 224, 71);
    doc.roundedRect(13, 9, 5, 5, 1, 1, "F");
    doc.setTextColor(30, 10, 78);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("SP", 20, 19, { align: "center" });

    // Company
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("SANNI PATEL - JACQUARD DESIGN STUDIO", 34, 16);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(196, 181, 253);
    doc.text(
      "+91 97248 01763  |  sannipatel7284@gmail.com  |  Surat, Gujarat",
      34,
      23,
    );

    // Right: title
    doc.setTextColor(251, 191, 36);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("MONTHLY REPORT", W - 12, 17, { align: "right" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(196, 181, 253);
    doc.text(monthName.toUpperCase() + " " + year, W - 12, 25, {
      align: "right",
    });

    // Gold divider
    doc.setFillColor(251, 191, 36);
    doc.rect(12, 34.5, W - 24, 0.5, "F");

    // Vendor label strip (if filtering by one vendor)
    if (vendorLabel) {
      doc.setFillColor(237, 233, 254);
      doc.roundedRect(12, 37, W - 24, 8, 2, 2, "F");
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(88, 28, 135);
      doc.text("VENDOR: " + vendorLabel.toUpperCase(), W / 2, 42.5, {
        align: "center",
      });
    }
  };

  // ── Helper: draw summary stat cards ───────────────────────────────────────
  const drawSummaryCards = (s, startY) => {
    const cardW = 56;
    const cardH = 16;
    const cards = [
      {
        label: "TOTAL BILLS",
        value: String(s.totalBills),
        bg: [237, 233, 254],
        text: [88, 28, 135],
      },
      {
        label: "TOTAL REVENUE",
        value:
          "Rs. " +
          s.totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 }),
        bg: [219, 234, 254],
        text: [29, 78, 216],
      },
      {
        label: "PAID",
        value:
          "Rs. " +
          s.paidRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 }),
        bg: [220, 252, 231],
        text: [22, 163, 74],
      },
      {
        label: "PENDING/UNPAID",
        value:
          "Rs. " +
          s.unpaidRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 }),
        bg: [254, 226, 226],
        text: [220, 38, 38],
      },
    ];
    cards.forEach(function (c, i) {
      const cx = 12 + i * (cardW + 4);
      doc.setFillColor(...c.bg);
      doc.roundedRect(cx, startY, cardW, cardH, 2.5, 2.5, "F");
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...c.text);
      doc.text(c.label, cx + cardW / 2, startY + 5.5, { align: "center" });
      doc.setFontSize(9);
      doc.text(c.value, cx + cardW / 2, startY + 12, { align: "center" });
    });
    return startY + cardH + 5;
  };

  // ── Helper: draw a bills table for a set of bills ─────────────────────────
  const drawBillsTable = (billsArr, startY, title) => {
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 10, 78);
    doc.text(title, 12, startY - 2);

    const rows = billsArr.map(function (b, idx) {
      return [
        String(idx + 1),
        b.billNumber,
        new Date(b.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        b.items
          .map(function (it) {
            return it.designType
              ? it.designName + " (" + it.designType + ") x" + it.quantity
              : it.designName + " x" + it.quantity;
          })
          .join(", "),
        b.status.toUpperCase(),
        "Rs. " +
          b.subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 }),
        b.taxRate > 0 ? b.taxRate + "%" : "-",
        "Rs. " +
          b.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 }),
      ];
    });

    autoTable(doc, {
      startY: startY,
      head: [
        [
          "#",
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
        fontSize: 7,
        cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
        lineWidth: 0,

        halign: "center",
        valign: "middle",
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
        textColor: [55, 65, 81],
        fontSize: 7.2,
        cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
        lineColor: [243, 244, 246],
        lineWidth: 0.3,
        halign: "center",
        valign: "middle",
      },
      alternateRowStyles: { fillColor: [250, 247, 255] },
      columnStyles: {
        0: {
          cellWidth: 10,
          halign: "center",
          valign: "middle",
          textColor: [156, 163, 175],
        },
        1: {
          cellWidth: 32,
          fontStyle: "bold",
          textColor: [17, 24, 39],
          valign: "middle",
        },
        2: {
          cellWidth: 26,
          halign: "center",
          valign: "middle",
        },
        3: {
          cellWidth: "auto",
          fontSize: 6.5,
          textColor: [107, 114, 128],
          halign: "left",
          valign: "middle",
        },
        4: {
          cellWidth: 20,
          halign: "center",
          valign: "middle",
          fontStyle: "bold",
        },
        5: {
          cellWidth: 34,
          halign: "center",
          valign: "middle",
        },
        6: {
          cellWidth: 18,
          halign: "center",
          valign: "middle",
        },
        7: {
          cellWidth: 36,
          halign: "center",
          valign: "middle",
          fontStyle: "bold",
          textColor: [88, 28, 135],
        },
      },
      didParseCell: function (data) {
        if (data.column.index === 4 && data.section === "body") {
          const val = data.cell.raw;
          if (val === "PAID") data.cell.styles.textColor = [22, 163, 74];
          else if (val === "UNPAID") data.cell.styles.textColor = [220, 38, 38];
          else data.cell.styles.textColor = [217, 119, 6];
        }
      },
      margin: { left: 12, right: 12 },
      tableLineColor: [221, 214, 254],
      tableLineWidth: 0.3,
    });

    return doc.lastAutoTable.finalY;
  };

  // ── Helper: draw vendor total bar ─────────────────────────────────────────
  const drawVendorTotal = (vendorData, afterY) => {
    const barY = afterY + 4;
    const barW = 90;
    const barX = W - 12 - barW;
    doc.setFillColor(30, 10, 78);
    doc.roundedRect(barX, barY, barW, 9, 2, 2, "F");
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(196, 181, 253);
    doc.text(
      "VENDOR TOTAL — " + vendorData.vendorName.toUpperCase(),
      barX + 5,
      barY + 6,
    );
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text(
      "Rs. " +
        vendorData.totalRevenue.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        }),
      W - 16,
      barY + 6,
      { align: "right" },
    );
    return barY + 9;
  };

  // ── Helper: draw footer ────────────────────────────────────────────────────
  const drawFooter = () => {
    const fY = H - 9;
    doc.setDrawColor(221, 214, 254);
    doc.setLineWidth(0.3);
    doc.line(12, fY - 2, W - 12, fY - 2);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(156, 163, 175);
    doc.text(
      "Sanni Patel - Jacquard Design Studio  |  Monthly Report: " +
        monthName +
        " " +
        year +
        "  |  Generated on " +
        new Date().toLocaleDateString("en-IN"),
      W / 2,
      fY + 2,
      { align: "center" },
    );
    doc.setFillColor(251, 191, 36);
    doc.rect(0, H - 3, W, 3, "F");
  };

  // ══════════════════════════════════════════════════════════════
  // CASE A: Single vendor  — clean single-vendor layout
  // ══════════════════════════════════════════════════════════════
  if (vendors && vendors.length === 1) {
    const v = vendors[0];
    drawHeader(v.vendorName);
    const cardStartY = 47;
    const tableStart = drawSummaryCards(
      {
        totalBills: v.totalBills,
        totalRevenue: v.totalRevenue,
        paidRevenue: v.paidRevenue,
        unpaidRevenue: v.unpaidRevenue,
      },
      cardStartY,
    );
    drawBillsTable(v.bills, tableStart, "BILL DETAILS");
    drawVendorTotal(v, doc.lastAutoTable.finalY);
    drawFooter();
  }

  // ══════════════════════════════════════════════════════════════
  // CASE B: All vendors — overall summary page, then per-vendor sections
  // ══════════════════════════════════════════════════════════════
  else {
    // PAGE 1 — Overall summary + all bills table
    drawHeader(null);
    const overallCards = {
      totalBills: summary.totalBills,
      totalRevenue: summary.totalRevenue,
      paidRevenue: summary.paidRevenue,
      unpaidRevenue: summary.unpaidRevenue,
    };

    // Summary cards + vendor index
    const cardStartY = 41;
    const tableStart = drawSummaryCards(overallCards, cardStartY);

    // Vendor index table (compact, top-right area)
    if (vendors && vendors.length > 0) {
      const indexX = 12 + 4 * 60;
      const indexY = cardStartY;
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 10, 78);
      doc.text("VENDORS THIS MONTH", indexX, indexY + 3);

      autoTable(doc, {
        startY: indexY + 5,
        head: [["Vendor", "Bills", "Total (Rs.)"]],
        body: vendors.map(function (v) {
          return [
            v.vendorName,
            String(v.totalBills),
            v.totalRevenue.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            }),
          ];
        }),
        headStyles: {
          fillColor: [30, 10, 78],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 6.5,
          cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
          lineWidth: 0,

          halign: "center",
          valign: "middle",
        },
        bodyStyles: {
          fillColor: [255, 255, 255],
          textColor: [55, 65, 81],
          fontSize: 6.8,
          cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
          lineColor: [243, 244, 246],
          lineWidth: 0.25,
          halign: "center",
          valign: "middle",
        },
        alternateRowStyles: { fillColor: [250, 247, 255] },
        columnStyles: {
          0: {
            cellWidth: 10,
            halign: "center",
            valign: "middle",
            textColor: [156, 163, 175],
          },
          1: {
            cellWidth: 32,
            fontStyle: "bold",
            textColor: [17, 24, 39],
            valign: "middle",
          },
          2: {
            cellWidth: 26,
            halign: "center",
            valign: "middle",
          },
          3: {
            cellWidth: "auto",
            fontSize: 6.5,
            textColor: [107, 114, 128],
            valign: "middle",
          },
          4: {
            cellWidth: 20,
            halign: "center",
            valign: "middle",
            fontStyle: "bold",
          },
          5: {
            cellWidth: 34,
            halign: "right",
            valign: "middle",
          },
          6: {
            cellWidth: 18,
            halign: "center",
            valign: "middle",
          },
          7: {
            cellWidth: 36,
            halign: "right",
            valign: "middle",
            fontStyle: "bold",
            textColor: [88, 28, 135],
          },
        },
        margin: { left: indexX, right: 12 },
        tableLineColor: [221, 214, 254],
        tableLineWidth: 0.25,
      });
    }

    // All bills combined table
    drawBillsTable(
      bills,
      tableStart,
      "ALL BILLS — " + monthName.toUpperCase() + " " + year,
    );

    // Month grand total bar
    const finalY = doc.lastAutoTable.finalY + 4;
    const barW = 90;
    const barX = W - 12 - barW;
    doc.setFillColor(30, 10, 78);
    doc.roundedRect(barX, finalY, barW, 9, 2, 2, "F");
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(196, 181, 253);
    doc.text("MONTH GRAND TOTAL", barX + 5, finalY + 6);
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text(
      "Rs. " +
        summary.totalRevenue.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        }),
      W - 16,
      finalY + 6,
      { align: "right" },
    );
    drawFooter();

    // ── One page per vendor ────────────────────────────────────────────────
    if (vendors && vendors.length > 0) {
      vendors.forEach(function (v) {
        doc.addPage();
        drawHeader(v.vendorName);

        const vCardStart = 47;
        const vTableStart = drawSummaryCards(
          {
            totalBills: v.totalBills,
            totalRevenue: v.totalRevenue,
            paidRevenue: v.paidRevenue,
            unpaidRevenue: v.unpaidRevenue,
          },
          vCardStart,
        );
        drawBillsTable(
          v.bills,
          vTableStart,
          "BILLS FOR: " + v.vendorName.toUpperCase(),
        );
        drawVendorTotal(v, doc.lastAutoTable.finalY);
        drawFooter();
      });
    }
  }

  doc.save("Monthly-Report-" + monthName + "-" + year + ".pdf");
};
