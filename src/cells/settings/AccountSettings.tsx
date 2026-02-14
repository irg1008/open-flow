import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useI18n } from "@zachhandley/ez-i18n-react";

export function AccountSettings() {
  const { t } = useI18n();

  const deleteAccount = () => {};

  return (
    <Card>
      <CardContent>
        <h2 className="font-medium">{t("pages.settings.account.profile-title")}</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          {t("pages.settings.account.delete-description")}
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="destructive">{t("pages.settings.account.delete-action")}</Button>
      </CardFooter>
    </Card>
  );
}
