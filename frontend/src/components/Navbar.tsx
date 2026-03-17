"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Settings as SettingsIcon, LogOut, User, Bell, Trash2, Calendar } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [notifications, setNotifications] = React.useState<any[]>([]);

  React.useEffect(() => {
    const loadNotifications = () => {
      const stored = localStorage.getItem("notifications");
      if (stored) {
        setNotifications(JSON.parse(stored));
      }
    };

    loadNotifications();
    window.addEventListener("storage", loadNotifications);
    // 폴링으로 로컬스토리지 변화 감지 (같은 탭 내 변화용)
    const interval = setInterval(loadNotifications, 2000);

    return () => {
      window.removeEventListener("storage", loadNotifications);
      clearInterval(interval);
    };
  }, []);

  const deleteNotification = (id: number) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    localStorage.setItem("notifications", JSON.stringify(updated));
  };

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
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-full transition-all relative"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 text-sm">계약 마감 알림</h3>
                  <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {notifications.length}건
                  </span>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Bell className="w-5 h-5 text-slate-300" />
                      </div>
                      <p className="text-xs text-slate-400 font-medium">새로운 알림이 없습니다</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {notifications.map((n) => (
                        <div key={n.id} className="p-4 hover:bg-slate-50 transition-colors group">
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-bold text-slate-800 truncate mb-1">{n.fileName}</p>
                              <div className="flex items-center gap-1.5 text-rose-500">
                                <Calendar className="w-3 h-3" />
                                <span className="text-[11px] font-black">마감일: {n.deadline}</span>
                              </div>
                            </div>
                            <button 
                              onClick={() => deleteNotification(n.id)}
                              className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <button className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
            <SettingsIcon className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>
    </nav>
  );
}
