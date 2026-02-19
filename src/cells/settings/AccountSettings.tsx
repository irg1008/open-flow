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
import { m } from "@/i18n/_generated/messages";
import { getLocale, Locale, locales, setLocale } from "@/i18n/_generated/runtime";
import { authClient } from "@/lib/auth-client";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export function AccountSettings() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [confirmValue, setConfirmValue] = useState("");

  const requiredText = m.settings_account_delete_action();
  const canDelete = confirmValue.trim() === requiredText;

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) setConfirmValue("");
  };

  const handleDelete = async () => {
    if (!canDelete) return;
    await authClient.deleteUser();
    await navigate({ to: "/" });
  };

  const handleSetLocale = async (newLocale: Locale) => {
    await setLocale(newLocale);
  };

  const getCountryName = (locale: Locale) => {
    const formatter = new Intl.DisplayNames([locale], { type: "language" });
    return formatter.of(locale) || locale;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent>
          <h2 className="font-medium">{m.settings_account_language_title()}</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            {m.settings_account_language_description()}
          </p>
        </CardContent>
        <CardFooter>
          <div className="w-full max-w-xs">
            <Select value={getLocale()} onValueChange={handleSetLocale}>
              <SelectTrigger id="account-language" size="sm" className="w-full capitalize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locales.map((currentLocale) => (
                  <SelectItem
                    key={currentLocale}
                    value={currentLocale}
                    data-active-locale={currentLocale === getLocale()}
                    className="capitalize"
                  >
                    {getCountryName(currentLocale)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardContent>
          <h2 className="font-medium">{m.settings_account_profile_title()}</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            {m.settings_account_delete_description()}
          </p>
        </CardContent>
        <CardFooter>
          <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">{m.settings_account_delete_action()}</Button>
            </AlertDialogTrigger>
            <AlertDialogContent asChild>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleDelete();
                }}
              >
                <AlertDialogHeader>
                  <AlertDialogTitle>{m.settings_account_delete_title()}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {m.settings_account_delete_confirm_description()}
                    <br />
                    {m.settings_account_delete_type_label({ value: requiredText })}
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <Input
                  value={confirmValue}
                  onChange={(event) => setConfirmValue(event.target.value)}
                  placeholder={requiredText}
                />

                <AlertDialogFooter>
                  <AlertDialogCancel>{m.common_cancel()}</AlertDialogCancel>
                  <AlertDialogAction
                    type="submit"
                    onClick={handleDelete}
                    variant="destructive"
                    disabled={!canDelete}
                  >
                    {m.settings_account_delete_action()}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </form>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
}
