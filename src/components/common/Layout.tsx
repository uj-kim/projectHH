import React from "react";
import { Outlet } from "react-router-dom";
import { Header } from "@/components/common";

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
