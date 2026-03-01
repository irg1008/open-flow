import { ThemeMode } from "@/components/theme-mode";
import { SignInButton } from "@/features/auth/SignInButton";
import { m } from "@/i18n/_generated/messages";
import { Link } from "@tanstack/react-router";

export const Navbar = () => {
  return (
    <header className="border-border/70 bg-background/90 sticky top-0 z-50 border-b backdrop-blur">
      <div className="container flex h-(--header-height) items-center justify-between gap-2 sm:gap-3">
        <Link to="/" className="font-display text-lg font-semibold sm:text-xl">
          {m.common_brand()}
        </Link>

        <div className="flex items-center gap-2">
          <SignInButton />
          <ThemeMode />
        </div>
      </div>
    </header>
  );
};
