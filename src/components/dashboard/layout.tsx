import type React from "react";
import { Outlet } from "react-router-dom";
import { DashboardSidebar } from "./side-bar";

const DashBoardLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-screen">
      <DashboardSidebar />
      <div className="flex-1 overflow-auto p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default DashBoardLayout;
