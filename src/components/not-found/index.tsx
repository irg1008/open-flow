import { useI18n } from "@/i18n/client";
import { Link } from "@tanstack/react-router";
import styles from "./not-found.module.css";

export function NotFound() {
  const { t } = useI18n();

  return (
    <div className="bg-background flex min-h-[calc(100svh-var(--header-height))] items-center justify-center px-4">
      <div className="text-center">
        <h1
          className={`${styles.glitch} text-foreground font-mono text-7xl font-bold tracking-tight sm:text-8xl md:text-9xl`}
          data-text="404"
        >
          404
        </h1>
        <p className="text-muted-foreground mt-4 font-mono text-sm">
          {t("pages.not-found.message")}
        </p>
        <Link to="/" className="mt-6 inline-block font-mono text-sm underline underline-offset-4">
          {t("pages.not-found.action")}
        </Link>
      </div>
    </div>
  );
}
