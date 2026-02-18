import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/i18n/client";

export function IntegrationsSettings() {
  const { t } = useI18n();

  return (
    <Card>
      <CardContent>
        <h2 className="font-medium">{t("pages.settings.integrations.list-title")}</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          {t("pages.settings.integrations.empty")}
        </p>
      </CardContent>
    </Card>
  );
}
