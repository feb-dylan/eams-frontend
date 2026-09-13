import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ExportButtons = ({
  fileName = "report",
  title = "Report",
  columns = [],
  rows = [],
  disabled = false,
}) => {
  // Convert rows to plain objects based on columns
  const buildData = () =>
    rows.map((row) => {
      const obj = {};
      columns.forEach((col) => {
        obj[col.header] =
          typeof col.accessor === "function"
            ? col.accessor(row)
            : row[col.accessor];
      });
      return obj;
    });

  const handleCSV = () => {
    const data = buildData();
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(worksheet);

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const handleExcel = () => {
    const data = buildData();
    const worksheet = XLSX.utils.json_to_sheet(data);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const handlePDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(16);
    doc.text(title, 14, 15);

    doc.setFontSize(10);
    doc.text(
      `Generated: ${new Date().toLocaleString()}`,
      14,
      22
    );

    const head = [columns.map((c) => c.header)];

    const body = rows.map((row) =>
      columns.map((col) =>
        typeof col.accessor === "function"
          ? String(col.accessor(row) ?? "")
          : String(row[col.accessor] ?? "")
      )
    );

    autoTable(doc, {
      head,
      body,
      startY: 28,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [13, 110, 253] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
    });

    doc.save(`${fileName}.pdf`);
  };

  return (
    <div className="d-flex gap-2">
      <button
        className="btn btn-outline-secondary"
        onClick={handleCSV}
        disabled={disabled || rows.length === 0}
      >
        <i className="bi bi-filetype-csv me-1"></i>
        CSV
      </button>

      <button
        className="btn btn-outline-success"
        onClick={handleExcel}
        disabled={disabled || rows.length === 0}
      >
        <i className="bi bi-file-earmark-excel me-1"></i>
        Excel
      </button>

      <button
        className="btn btn-outline-danger"
        onClick={handlePDF}
        disabled={disabled || rows.length === 0}
      >
        <i className="bi bi-file-earmark-pdf me-1"></i>
        PDF
      </button>
    </div>
  );
};

export default ExportButtons;