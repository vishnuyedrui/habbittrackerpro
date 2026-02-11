import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export async function generateExcel(
  habits: string[],
  checkData: boolean[][]
) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Habit Tracker");

  // -- Header row --
  const headerRow = sheet.addRow(["Habit Name", ...DAYS]);
  headerRow.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1B2A4A" },
  };
  headerRow.alignment = { horizontal: "center", vertical: "middle" };
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // -- Data rows --
  habits.forEach((habit, hIdx) => {
    const rowData: (string | boolean)[] = [habit];
    DAYS.forEach((_, dIdx) => {
      rowData.push(checkData[hIdx]?.[dIdx] ?? false);
    });
    const row = sheet.addRow(rowData);
    row.alignment = { horizontal: "center", vertical: "middle" };
    row.getCell(1).alignment = { horizontal: "left", vertical: "middle" };

    // alternating fill
    if (hIdx % 2 === 0) {
      row.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF0F4FF" },
      };
    }

    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFD0D5DD" } },
        left: { style: "thin", color: { argb: "FFD0D5DD" } },
        bottom: { style: "thin", color: { argb: "FFD0D5DD" } },
        right: { style: "thin", color: { argb: "FFD0D5DD" } },
      };
    });
  });

  const lastDataRow = habits.length + 1; // 1-indexed, header is row 1

  // -- Blank spacer row --
  sheet.addRow([]);

  // -- Daily Percentage Row --
  const pctRowNum = lastDataRow + 2;
  const pctRow = sheet.addRow(["Daily %"]);
  pctRow.font = { bold: true, size: 11 };
  pctRow.alignment = { horizontal: "center", vertical: "middle" };

  for (let d = 0; d < 7; d++) {
    const col = String.fromCharCode(66 + d); // B..H
    const cell = pctRow.getCell(d + 2);
    cell.value = {
      formula: `COUNTIF(${col}2:${col}${lastDataRow},TRUE)/COUNTA(A2:A${lastDataRow})`,
      date1904: false,
    } as any;
    cell.numFmt = "0.0%";
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE8F5E9" },
    };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  }

  // -- Weekly Average Row --
  const avgRowNum = pctRowNum + 1;
  const avgRow = sheet.addRow(["Weekly Avg"]);
  avgRow.font = { bold: true, size: 11 };
  avgRow.alignment = { horizontal: "center", vertical: "middle" };
  const avgCell = avgRow.getCell(2);
  avgCell.value = {
    formula: `AVERAGE(B${pctRowNum}:H${pctRowNum})`,
    date1904: false,
  } as any;
  avgCell.numFmt = "0.0%";
  avgCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFFF9C4" },
  };
  avgCell.font = { bold: true, size: 13 };
  avgCell.border = {
    top: { style: "medium" },
    left: { style: "medium" },
    bottom: { style: "medium" },
    right: { style: "medium" },
  };

  // -- Column widths --
  sheet.getColumn(1).width = 25;
  for (let i = 2; i <= 8; i++) {
    sheet.getColumn(i).width = 14;
  }

  // -- Freeze top row --
  sheet.views = [{ state: "frozen", ySplit: 1, xSplit: 0 }];

  // -- Chart (ExcelJS doesn't natively support charts, so we skip embedded chart) --
  // The bar chart is shown live in the app UI via Recharts.

  // -- Download --
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, "habit-tracker.xlsx");
}
