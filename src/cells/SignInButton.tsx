import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { GithubIcon } from "@/components/ui/svgs/github";
import { UserAvatar } from "@/components/user-avatar";
import { useI18n } from "@/i18n/client";
import { authClient } from "@/lib/auth-client";
import { useReactMutation } from "@/lib/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { LogOut, Settings } from "lucide-react";

export const SignInButton = () => {
  const { t } = useI18n();

  const { mutate: signInWithGithub } = useReactMutation({
    mutationKey: ["signIn", "github"],
    mutationFn: () => authClient.signIn.social({ provider: "github" })
  });

  return (
    <>
      <AuthLoading>
        <Skeleton className="bg-muted size-6 rounded-full" />
      </AuthLoading>

      <Unauthenticated>
        <Button onClick={() => signInWithGithub()} variant="default" size="sm">
          <GithubIcon className="size-4" />
          <span className="hidden sm:inline">{t("auth.github-sign-in")}</span>
          <span className="sm:hidden">{t("auth.sign-in")}</span>
        </Button>
      </Unauthenticated>

      <Authenticated>
        <AvatarMenu />
      </Authenticated>
    </>
  );
};

const AvatarMenu = () => {
  const { t } = useI18n();
  const { data } = authClient.useSession();
  const navigate = useNavigate();

  const signOut = async () => {
    await authClient.signOut();
    await navigate({ to: "/" });
  };

  return (
    data?.user && (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="rounded-full">
            <UserAvatar user={data.user} size="sm" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="space-y-1">
            <p className="leading-none font-medium">{data.user.name}</p>
            <p className="text-muted-foreground text-xs font-normal">{data.user.email}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/settings/account">
              <Settings className="size-4" />
              {t("pages.settings.title")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={signOut}>
            <LogOut className="size-4" />
            {t("auth.sign-out")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  );
};
