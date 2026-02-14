import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "better-auth";

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
};

export const UserAvatar = ({ user }: UserAvatarProps) => {
  return (
    <Avatar size="sm">
      <AvatarImage src={user?.image || undefined} alt={user?.name || "User"} />
      <AvatarFallback>{getInitials(user?.name, user?.email)}</AvatarFallback>
    </Avatar>
  );
};
