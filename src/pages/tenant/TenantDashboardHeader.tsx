
import { FC } from "react";
import UserMenu from "@/components/common/UserMenu";

const TenantDashboardHeader: FC = () => {
  return (
    <header className="bg-background border-b sticky top-0 z-40 w-full">
      <div className="container flex h-16 items-center justify-between px-4">
        <h1 className="text-xl font-bold">Tenant Portal</h1>
        <UserMenu />
      </div>
    </header>
  );
};

export default TenantDashboardHeader;
