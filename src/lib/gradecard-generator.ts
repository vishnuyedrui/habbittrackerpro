import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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

export function generateGradeCard(
  courses: Course[],
  sgpaResult: SGPAResult,
  cgpaData?: CGPAData
) {
  const doc = new jsPDF();
  const validCourses = courses.filter(c => c.finalGradePoint !== null && c.name.trim() !== "");

  // Title
  doc.setFillColor(255, 107, 157); // pop-pink
  doc.rect(0, 0, 210, 30, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("Grade Card", 105, 20, { align: "center" });

  // Table data
  const headers = [["Subject Name", "Sessional 1", "Sessional 2", "LE", "Final Grade", "Credits"]];
  const body = validCourses.map(course => [
    course.name,
    course.assessments[0]?.gradeLabel ?? "—",
    course.assessments[1]?.gradeLabel ?? "—",
    course.assessments[2]?.gradeLabel ?? "—",
    course.letterGrade ?? "—",
    String(course.credits),
  ]);

  autoTable(doc, {
    startY: 38,
    head: headers,
    body,
    theme: "grid",
    headStyles: {
      fillColor: [78, 205, 196], // pop-cyan
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 11,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 10,
      halign: "center",
    },
    columnStyles: {
      0: { halign: "left", fontStyle: "bold" },
    },
    alternateRowStyles: {
      fillColor: [240, 244, 255],
    },
  });

  // Summary section
  const finalY = (doc as any).lastAutoTable.finalY + 12;

  // SGPA box
  doc.setFillColor(16, 185, 129); // green
  doc.roundedRect(14, finalY, 182, 18, 4, 4, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("SGPA", 24, finalY + 12);
  doc.text(sgpaResult.sgpa.toFixed(2), 120, finalY + 12, { align: "center" });
  doc.setFontSize(11);
  doc.text(`Total Credits: ${sgpaResult.totalCredits}`, 186, finalY + 12, { align: "right" });

  // CGPA box if available
  if (cgpaData) {
    const cgpaY = finalY + 24;
    doc.setFillColor(168, 85, 247); // purple
    doc.roundedRect(14, cgpaY, 182, 18, 4, 4, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text("CGPA", 24, cgpaY + 12);
    doc.text(cgpaData.cgpa.toFixed(2), 120, cgpaY + 12, { align: "center" });
    doc.setFontSize(11);
    doc.text(`Total Credits: ${cgpaData.newTotalCredits}`, 186, cgpaY + 12, { align: "right" });
  }

  doc.save("grade-card.pdf");
}
