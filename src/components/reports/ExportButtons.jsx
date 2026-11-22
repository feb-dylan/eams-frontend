import { useState } from "react";

/**
 * CSV / Excel / PDF export of a table.
 * The Excel and PDF libraries are loaded only when a button is clicked,
 * so they are not part of the app's first download.
 */
const ExportButtons = ({ fileName = "report", title = "Report", columns = [], rows = [], disabled = false }) => {
  const [busy, setBusy] = useState(null);

  const cell = (row, col) => {
    const value = typeof col.accessor === "function" ? col.accessor(row) : row[col.accessor];
    return value === null || value === undefined ? "" : value;
  };

  const download = (blob, name) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const exportCsv = () => {
    const escape = (v) => {
      const s = String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [
      columns.map((c) => escape(c.header)).join(","),
      ...rows.map((r) => columns.map((c) => escape(cell(r, c))).join(",")),
    ];
    // BOM so Excel opens UTF-8 correctly
    download(new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" }), `${fileName}.csv`);
  };

  const exportExcel = async () => {
    setBusy("excel");
    try {
      const { default: ExcelJS } = await import("exceljs");
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Report");
      sheet.columns = columns.map((c) => ({ header: c.header, key: c.header, width: Math.max(12, c.header.length + 4) }));
      rows.forEach((r) => {
        const values = {};
        columns.forEach((c) => {
          values[c.header] = cell(r, c);
        });
        sheet.addRow(values);
      });
      sheet.getRow(1).font = { bold: true };
      const buffer = await workbook.xlsx.writeBuffer();
      download(new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }), `${fileName}.xlsx`);
    } finally {
      setBusy(null);
    }
  };

  const exportPdf = async () => {
    setBusy("pdf");
    try {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);
      const doc = new jsPDF({ orientation: "landscape" });
      doc.setFontSize(16);
      doc.text(title, 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);
      autoTable(doc, {
        head: [columns.map((c) => c.header)],
        body: rows.map((r) => columns.map((c) => String(cell(r, c)))),
        startY: 28,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [13, 110, 253] },
        alternateRowStyles: { fillColor: [245, 247, 250] },
      });
      doc.save(`${fileName}.pdf`);
    } finally {
      setBusy(null);
    }
  };

  const off = disabled || rows.length === 0 || busy !== null;

  return (
    <div className="d-flex gap-2">
      <button className="btn btn-outline-secondary btn-sm" onClick={exportCsv} disabled={off}>
        <i className="bi bi-filetype-csv me-1"></i> CSV
      </button>
      <button className="btn btn-outline-success btn-sm" onClick={exportExcel} disabled={off}>
        <i className="bi bi-file-earmark-excel me-1"></i> {busy === "excel" ? "..." : "Excel"}
      </button>
      <button className="btn btn-outline-danger btn-sm" onClick={exportPdf} disabled={off}>
        <i className="bi bi-file-earmark-pdf me-1"></i> {busy === "pdf" ? "..." : "PDF"}
      </button>
    </div>
  );
};

export default ExportButtons;
