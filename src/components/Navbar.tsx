import { NavLink } from "@/components/NavLink";
import { Calculator, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-center gap-2">
        <NavLink
          to="/"
          end
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-muted"
          activeClassName="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground pop-shadow"
        >
          <Calculator className="w-4 h-4" />
          <span>Grade Calculator</span>
        </NavLink>
        <NavLink
          to="/habits"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-muted"
          activeClassName="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground pop-shadow"
        >
          <CheckSquare className="w-4 h-4" />
          <span>Habit Tracker</span>
        </NavLink>
      </div>
    </nav>
  );
}
