import React from "react";
import { Outlet } from "react-router-dom";
import { Header } from "@/components/common";

const Layout: React.FC = () => {
  return (
    <div className="min-w-[1024px] max-w-[1440px] w-full mx-auto min-h-screen">
      <Header />
      <main className="px-12">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
