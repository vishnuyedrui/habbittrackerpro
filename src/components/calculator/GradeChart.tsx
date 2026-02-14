import { GRADE_MAPPINGS } from "@/types/calculator";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Info, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export function GradeChart() {
  const [isExpanded, setIsExpanded] = useState(false);

  const gradeColorMap: Record<string, string> = {
    "grade-o": "bg-grade-o",
    "grade-a-plus": "bg-grade-a-plus",
    "grade-a": "bg-grade-a",
    "grade-b-plus": "bg-grade-b-plus",
    "grade-b": "bg-grade-b",
    "grade-c": "bg-grade-c",
    "grade-p": "bg-grade-p",
    "grade-f": "bg-grade-f"
  };

  const additionalGrades = [{
    letter: 'I',
    description: 'Incomplete (GP: 4 if both sessionals ≥ 25)',
    color: 'bg-grade-p'
  }, {
    letter: 'Ab/R',
    description: 'Absent/Repeat (GP: 0)',
    color: 'bg-grade-f'
  }, {
    letter: 'L/AB',
    description: 'LE Absent (GP: 0, Final: F)',
    color: 'bg-grade-f'
  }];

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-3 border-pop-yellow/30 rounded-3xl overflow-hidden hover-lift">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left"
      >
        <CardHeader className="pb-2 px-4 sm:px-6 bg-pop-yellow/10">
          <h2 className="text-sm sm:text-base flex items-center gap-2 text-foreground font-bold font-display">
            <div className="w-7 h-7 rounded-xl bg-pop-yellow flex items-center justify-center rotate-3">
              <Info className="w-4 h-4 text-foreground" aria-hidden="true" />
            </div>
            Grade Conversion Chart
            <span className="ml-auto">
              {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </span>
          </h2>
        </CardHeader>
      </button>
      {isExpanded && (
        <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pt-4 animate-fade-in">
          <div className="flex flex-wrap gap-1.5 sm:gap-3">
            {GRADE_MAPPINGS.map(grade => (
              <div key={grade.letter} className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-muted border-2 border-foreground/10 text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-105 hover:pop-shadow cursor-default">
                <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${gradeColorMap[grade.color]} border-2 border-white`} />
                <span className="font-bold font-display">{grade.letter}</span>
                <span className="text-muted-foreground hidden sm:inline">
                  {grade.letter === "F" ? "< 4.00" : grade.letter === "P" ? "= 4.00" : `> ${grade.min.toFixed(2)}`}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-3">
            {additionalGrades.map(grade => (
              <div key={grade.letter} className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-muted border-2 border-foreground/10 text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-105 cursor-default">
                <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${grade.color} border-2 border-white`} />
                <span className="font-bold font-display">{grade.letter}</span>
                <span className="text-muted-foreground hidden sm:inline">
                  {grade.description}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
