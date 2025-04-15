
import { FC } from "react";
import { User, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth"; // Update import path
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const UserMenu: FC = () => {
  const { user, profile, userType, signOut } = useAuth();

  if (!user) return null;

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : user.email?.substring(0, 2).toUpperCase() || "U";

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-2">
          <Avatar className="h-8 w-8">
            {profile?.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt={profile.full_name || "User"} />
            ) : (
              <AvatarFallback>{initials}</AvatarFallback>
            )}
          </Avatar>
          <span className="hidden md:inline-block max-w-[150px] truncate">
            {profile?.full_name || user.email}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{profile?.full_name || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>
          <span className="flex items-center gap-2 text-xs font-semibold capitalize">
            <User className="h-3 w-3" />
            {userType} Account
          </span>
        </DropdownMenuLabel>
        {profile?.property_id && userType === "tenant" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>
              <div className="text-xs space-y-1">
                {profile.unit_number && <p>Unit: {profile.unit_number}</p>}
                {profile.rent_amount && <p>Rent: ${profile.rent_amount}</p>}
                {profile.balance !== null && profile.balance !== undefined && (
                  <p>Balance: ${profile.balance}</p>
                )}
              </div>
            </DropdownMenuLabel>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
