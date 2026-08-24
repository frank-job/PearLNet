"use client";

import Link from "next/link";
import NavLinks from "./NavLinks";
import SettingsMenu from '@/app/components/SettingsMenu';
import { PowerIcon, } from "lucide-react";
// import PearLNet from "@/app/ui/Pealnet";
import RatLogo from "../RatLogo";
export default function Sidebar() {
  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <div className="
        hidden lg:flex lg:flex-col 
        lg:w-64 lg:h-screen 
        lg:fixed lg:top-0 lg:left-0 
        bg-white border-r
      ">
        <Link
          href="/PearLNet/home"
          className="flex items-end justify-start rounded-lg p-4 lg:h-40"
        >
          {/* Logo area */}
        </Link>

        <div className="p-4 lg:flex lg:flex-col lg:space-y-4">
          <RatLogo />
          {/* <PearLNet /> */}

          <NavLinks />

          <div className="hidden lg:block grow" />

          <button
            onClick={() => console.log("Signing out...")}
            className="flex h-[48px] items-center justify-center gap-2 
              rounded-md p-3 text-sm font-medium text-slate-500 
              hover:bg-red-50 hover:text-red-600 
               lg:justify-start lg:bg-gray-50  "
          >
            <PowerIcon className="w-6" />
            <span className="hidden lg:block">Sign Out</span>
          </button>
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div className="
        fixed bottom-0 left-0 right-0 
        bg-white border-t 
        flex justify-around items-center 
        p-2 lg:hidden
      ">
        <NavLinks />
        <SettingsMenu />

        <button
          onClick={() => console.log("Signing out...")}
          className="flex flex-col items-center text-slate-600 hover:text-red-600"
        >
          <PowerIcon className="w-6" />
        </button>
      </div>
    </>
  );
}
