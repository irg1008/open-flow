import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { authClient } from "@/lib/auth";
import { useI18n } from "@zachhandley/ez-i18n-react";
import { navigate } from "astro:transitions/client";
import { localeNames, locales } from "ez-i18n:config";
import { useState } from "react";

export function AccountSettings() {
  const { t, locale, setLocale } = useI18n();

  const [open, setOpen] = useState(false);
  const [confirmValue, setConfirmValue] = useState("");

  const requiredText = t("pages.settings.account.delete-action");
  const canDelete = confirmValue.trim() === requiredText;

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) setConfirmValue("");
  };

  const handleDelete = async () => {
    if (!canDelete) return;
    await authClient.deleteUser();
    await navigate("/");
  };

  const handleSetLocale = async (newLocale: string) => {
    setLocale(newLocale, { redirect: true });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent>
          <h2 className="font-medium">{t("pages.settings.account.language-title")}</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            {t("pages.settings.account.language-description")}
          </p>
        </CardContent>
        <CardFooter>
          <div className="w-full max-w-xs">
            <Select value={locale} onValueChange={handleSetLocale}>
              <SelectTrigger id="account-language" size="sm" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locales.map((currentLocale) => (
                  <SelectItem key={currentLocale} value={currentLocale}>
                    {localeNames[currentLocale] || currentLocale}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardContent>
          <h2 className="font-medium">{t("pages.settings.account.profile-title")}</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            {t("pages.settings.account.delete-description")}
          </p>
        </CardContent>
        <CardFooter>
          <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">{t("pages.settings.account.delete-action")}</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("pages.settings.account.delete-title")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("pages.settings.account.delete-confirm-description")}
                  <br />
                  {t("pages.settings.account.delete-type-label", { value: requiredText })}
                </AlertDialogDescription>
              </AlertDialogHeader>

              <Input
                value={confirmValue}
                onChange={(event) => setConfirmValue(event.target.value)}
                placeholder={requiredText}
              />

              <AlertDialogFooter>
                <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={!canDelete}
                  onClick={handleDelete}
                >
                  {t("pages.settings.account.delete-action")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
}
