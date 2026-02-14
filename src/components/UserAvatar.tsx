import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "better-auth";
import type { ComponentProps } from "react";

const getInitials = (name?: string | null, email?: string | null) => {
  const source = (name || email || "U").trim();
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
};

type UserAvatarProps = {
  user?: User;
  size?: ComponentProps<typeof Avatar>;
};

export const UserAvatar = ({ user, ...props }: UserAvatarProps & ComponentProps<typeof Avatar>) => {
  return (
    <Avatar {...props}>
      <AvatarImage src={user?.image || undefined} alt={user?.name || "User"} />
      <AvatarFallback>{getInitials(user?.name, user?.email)}</AvatarFallback>
    </Avatar>
  );
};
