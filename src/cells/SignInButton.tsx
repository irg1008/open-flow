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
import { UserAvatar } from "@/components/UserAvatar";
import { authClient } from "@/lib/auth";
import { withConvex } from "@/lib/convex";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { LogOut } from "lucide-react";

export const SignInButton = withConvex(() => {
  const signInWithGithub = async () => {
    await authClient.signIn.social({ provider: "github" });
  };

  return (
    <>
      <AuthLoading>
        <Skeleton className="bg-muted size-6 rounded-full" />
      </AuthLoading>

      <Unauthenticated>
        <Button onClick={signInWithGithub} variant="default" size="sm">
          <GithubIcon className="size-4" />
          <span className="hidden sm:inline">Sign in with GitHub</span>
          <span className="sm:hidden">Sign in</span>
        </Button>
      </Unauthenticated>

      <Authenticated>
        <AvatarMenu />
      </Authenticated>
    </>
  );
});

const AvatarMenu = () => {
  const { data } = authClient.useSession();

  const signOut = async () => {
    await authClient.signOut();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="rounded-full">
          <UserAvatar user={data?.user} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="space-y-1">
          <p className="leading-none font-medium">{data?.user?.name || "User"}</p>
          <p className="text-muted-foreground text-xs font-normal">{data?.user?.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
