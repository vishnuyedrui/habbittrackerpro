import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Course } from "@/types/calculator";

interface SGPAResult {
  sgpa: number;
  totalCredits: number;
  totalGradePoints: number;
}

interface CGPAData {
  cgpa: number;
  previousCGPA: number;
  previousCredits: number;
  newTotalCredits: number;
}

export async function generateGradeCard(
  courses: Course[],
  sgpaResult: SGPAResult,
  cgpaData?: CGPAData
) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Grade Card");

  const validCourses = courses.filter(c => c.finalGradePoint !== null && c.name.trim() !== "");

  // Title row
  const titleRow = sheet.addRow(["Grade Card"]);
  sheet.mergeCells("A1:E1");
  titleRow.getCell(1).font = { bold: true, size: 18, color: { argb: "FFFFFFFF" } };
  titleRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFF6B9D" } };
  titleRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
  titleRow.height = 36;

  // Blank row
  sheet.addRow([]);

  // Header row
  const headers = ["Subject Name", "Sessional 1", "Sessional 2", "Final Grade", "Credits"];
  const headerRow = sheet.addRow(headers);
  headerRow.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
  headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4ECDC4" } };
  headerRow.alignment = { horizontal: "center", vertical: "middle" };
  headerRow.height = 28;
  headerRow.eachCell(cell => {
    cell.border = {
      top: { style: "thin" }, left: { style: "thin" },
      bottom: { style: "thin" }, right: { style: "thin" },
    };
  });

  // Data rows
  validCourses.forEach((course, i) => {
    const s1 = course.assessments[0]?.gradeLabel ?? "—";
    const s2 = course.assessments[1]?.gradeLabel ?? "—";
    const row = sheet.addRow([course.name, s1, s2, course.letterGrade ?? "—", course.credits]);
    row.alignment = { horizontal: "center", vertical: "middle" };
    row.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
    row.getCell(1).font = { size: 11, bold: true };

    const bgColor = i % 2 === 0 ? "FFF0F4FF" : "FFFFFFFF";
    row.eachCell(cell => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
      cell.border = {
        top: { style: "thin", color: { argb: "FFD0D5DD" } },
        left: { style: "thin", color: { argb: "FFD0D5DD" } },
        bottom: { style: "thin", color: { argb: "FFD0D5DD" } },
        right: { style: "thin", color: { argb: "FFD0D5DD" } },
      };
    });
  });

  // Spacer
  sheet.addRow([]);

  // SGPA row
  const sgpaRow = sheet.addRow(["SGPA", "", "", sgpaResult.sgpa.toFixed(2), sgpaResult.totalCredits]);
  sheet.mergeCells(sgpaRow.number, 1, sgpaRow.number, 3);
  sgpaRow.getCell(1).value = "SGPA";
  sgpaRow.getCell(1).font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
  sgpaRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF10B981" } };
  sgpaRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
  sgpaRow.getCell(4).font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
  sgpaRow.getCell(4).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF10B981" } };
  sgpaRow.getCell(4).alignment = { horizontal: "center", vertical: "middle" };
  sgpaRow.getCell(5).font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
  sgpaRow.getCell(5).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF10B981" } };
  sgpaRow.getCell(5).alignment = { horizontal: "center", vertical: "middle" };
  sgpaRow.height = 30;

  // CGPA row if available
  if (cgpaData) {
    const cgpaRow = sheet.addRow(["CGPA", "", "", cgpaData.cgpa.toFixed(2), cgpaData.newTotalCredits]);
    sheet.mergeCells(cgpaRow.number, 1, cgpaRow.number, 3);
    cgpaRow.getCell(1).value = "CGPA";
    cgpaRow.getCell(1).font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
    cgpaRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFA855F7" } };
    cgpaRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
    cgpaRow.getCell(4).font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
    cgpaRow.getCell(4).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFA855F7" } };
    cgpaRow.getCell(4).alignment = { horizontal: "center", vertical: "middle" };
    cgpaRow.getCell(5).font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
    cgpaRow.getCell(5).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFA855F7" } };
    cgpaRow.getCell(5).alignment = { horizontal: "center", vertical: "middle" };
    cgpaRow.height = 30;
  }

  // Column widths
  sheet.getColumn(1).width = 28;
  sheet.getColumn(2).width = 14;
  sheet.getColumn(3).width = 14;
  sheet.getColumn(4).width = 14;
  sheet.getColumn(5).width = 12;

  // Download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, "grade-card.xlsx");
}
