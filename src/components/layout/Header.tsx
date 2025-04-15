import { FC } from "react";
import UserMenu from "@/components/common/UserMenu";
import { useAuth } from "@/hooks/useAuth"; // Update import path

interface HeaderProps {
  title?: string;
}

const Header: FC<HeaderProps> = ({ title = "Rent Roster" }) => {
  const { user } = useAuth();

  return (
    <header className="bg-background border-b sticky top-0 z-40 w-full">
      <div className="container flex h-16 items-center justify-between px-4">
        <h1 className="text-xl font-bold">{title}</h1>
        {user && <UserMenu />}
      </div>
    </header>
  );
};

export default Header;
