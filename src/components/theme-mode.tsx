import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { m } from "@/i18n/_generated/messages";
import { setTheme } from "@/lib/theme";
import { Moon, Sun } from "lucide-react";

export function ThemeMode() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">{m.theme_toggle()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>{m.theme_light()}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>{m.theme_dark()}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>{m.theme_system()}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
