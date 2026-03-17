"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Settings as SettingsIcon, LogOut, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="flex items-center justify-between px-10 py-5 bg-white/70 backdrop-blur-md sticky top-0 z-40 border-b border-white/50">
      <Link href="/" className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-[14px] flex items-center justify-center shadow-indigo-100 shadow-xl rotate-3">
          <Sparkles className="text-white w-5 h-5 fill-white/20" />
        </div>
        <span className="text-2xl font-black tracking-tight text-[#1E1B4B]">
          AI-Lawyer <span className="text-indigo-600">.</span>
        </span>
      </Link>
      
      <div className="flex items-center gap-10">
        <div className="hidden md:flex gap-8 text-[13px] font-bold text-slate-500 uppercase tracking-widest">
          <Link 
            href="/" 
            className={`${isActive("/") ? "text-indigo-600 border-b-2 border-indigo-600" : "hover:text-indigo-600"} pb-1 transition-colors`}
          >
            분석하기
          </Link>
          <Link 
            href="/dashboard" 
            className={`${isActive("/dashboard") ? "text-indigo-600 border-b-2 border-indigo-600" : "hover:text-indigo-600"} pb-1 transition-colors`}
          >
            대시보드
          </Link>
          <Link 
            href="/compare" 
            className={`${isActive("/compare") ? "text-indigo-600 border-b-2 border-indigo-600" : "hover:text-indigo-600"} pb-1 transition-colors`}
          >
            비교 분석
          </Link>
          <Link href="#" className="hover:text-indigo-600 transition-colors">가이드라인</Link>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full border border-indigo-100">
                <User className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-bold text-indigo-900">{user.nickname}님</span>
              </div>
              <button 
                onClick={logout}
                className="p-2.5 bg-slate-100 hover:bg-red-50 hover:text-red-500 rounded-full transition-all group"
                title="로그아웃"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link 
                href="/login" 
                className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors"
              >
                로그인
              </Link>
              <Link 
                href="/signup" 
                className="px-6 py-2.5 bg-[#1E1B4B] text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:-translate-y-0.5 transition-all"
              >
                회원가입
              </Link>
            </div>
          )}
          <button className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
            <SettingsIcon className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>
    </nav>
  );
}
