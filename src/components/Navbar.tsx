import { SignInButton } from "@/cells/SignInButton";
import { ThemeMode } from "@/components/ThemeMode";
import { useI18n } from "@zachhandley/ez-i18n-react";

export const Navbar = () => {
  const { t } = useI18n();

  return (
    <header className="border-border/70 bg-background/90 sticky top-0 z-50 border-b backdrop-blur">
      <div className="container flex h-12 items-center justify-between gap-2 sm:h-14 sm:gap-3">
        <a href="/" className="font-display text-lg font-semibold sm:text-xl">
          {t("common.brand")}
        </a>

        <div className="flex items-center gap-2">
          <SignInButton />
          <ThemeMode />
        </div>
      </div>
    </header>
  );
};
