import React, { useState } from 'react';
import {
  LayoutGrid,
  TrendingUp,
  Landmark,
  Palette,
  Shield,
  KeyRound,
  GraduationCap,
  UserCheck,
  AlertTriangle,
  History,
  CheckCircle,
  Hourglass,
  ChevronDown,
  ChevronUp,
  Menu,
  ShieldAlert,
  Search,
} from 'lucide-react';
import { AdminTab } from '../types';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  pendingArtsCount: number;
  pendingStudentsCount: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  pendingArtsCount,
  pendingStudentsCount,
}) => {
  const [manageUsersOpen, setManageUsersOpen] = useState(true);
  const [studentVerificationOpen, setStudentVerificationOpen] = useState(true);

  const isManageUsersActive = [
    'users_admins',
    'users_students',
    'users_customers',
    'strikes_bans',
  ].includes(currentTab);

  const isStudentVerificationActive = [
    'student_verification_pending',
    'student_verification_verified',
  ].includes(currentTab);

  return (
    <aside className="w-64 bg-[#8E1B24] text-white min-h-[calc(100vh-4.5rem)] flex flex-col shrink-0 select-none rounded-tr-3xl shadow-xl">

      {/* Navigation menu list */}
      <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto text-sm">
        {/* Navigation Category Label */}
        <div className="px-3 py-2 text-white/70 text-xs font-semibold flex items-center gap-2 tracking-wide uppercase">
          <Menu className="w-4 h-4 text-white/70" />
          <span>Navigation</span>
        </div>

        {/* Dashboard */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all text-left cursor-pointer ${
            currentTab === 'dashboard'
              ? 'bg-white text-[#8E1B24] font-semibold shadow-md translate-x-1'
              : 'text-white/85 hover:text-white hover:bg-white/10'
          }`}
        >
          <LayoutGrid className="w-4 h-4 shrink-0" />
          <span>Dashboard</span>
        </button>

        {/* Sales */}
        <button
          onClick={() => onSelectTab('sales')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all text-left cursor-pointer ${
            currentTab === 'sales'
              ? 'bg-white text-[#8E1B24] font-semibold shadow-md translate-x-1'
              : 'text-white/85 hover:text-white hover:bg-white/10'
          }`}
        >
          <TrendingUp className="w-4 h-4 shrink-0" />
          <span>Sales</span>
        </button>

        {/* Bank Account & Escrow */}
        <button
          onClick={() => onSelectTab('bank_account')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all text-left cursor-pointer ${
            currentTab === 'bank_account'
              ? 'bg-white text-[#8E1B24] font-semibold shadow-md translate-x-1'
              : 'text-white/85 hover:text-white hover:bg-white/10'
          }`}
        >
          <Landmark className="w-4 h-4 shrink-0" />
          <span>Bank &amp; Escrow</span>
        </button>

        {/* Art Verification */}
        <button
          onClick={() => onSelectTab('art_verification')}
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-medium transition-all text-left cursor-pointer ${
            currentTab === 'art_verification'
              ? 'bg-white text-[#8E1B24] font-semibold shadow-md translate-x-1'
              : 'text-white/85 hover:text-white hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <Palette className="w-4 h-4 shrink-0" />
            <span>Art Verification</span>
          </div>
          {pendingArtsCount > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                currentTab === 'art_verification'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-white/20 text-white'
              }`}
            >
              {pendingArtsCount}
            </span>
          )}
        </button>

        {/* Check Artwork Authenticity */}
        <button
          onClick={() => onSelectTab('authenticity_check')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all text-left cursor-pointer ${
            currentTab === 'authenticity_check'
              ? 'bg-white text-[#8E1B24] font-semibold shadow-md translate-x-1'
              : 'text-white/85 hover:text-white hover:bg-white/10'
          }`}
        >
          <Search className="w-4 h-4 shrink-0" />
          <span>Check Artwork Authenticity</span>
        </button>

        {/* Manage Users Dropdown */}
        <div className="pt-2">
          <button
            onClick={() => setManageUsersOpen(!manageUsersOpen)}
            className="w-full flex items-center justify-between px-4 py-2 text-white/90 hover:text-white font-medium text-left cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 shrink-0" />
              <span>Manage Users</span>
            </div>
            {manageUsersOpen ? (
              <ChevronUp className="w-3.5 h-3.5 opacity-70" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            )}
          </button>

          {manageUsersOpen && (
            <div className="pl-4 pr-1 py-1 space-y-1">
              {/* Admins */}
              <button
                onClick={() => onSelectTab('users_admins')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                  currentTab === 'users_admins'
                    ? 'bg-white text-[#8E1B24] font-bold shadow-md translate-x-1'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5 shrink-0" />
                <span>Admins</span>
              </button>

              {/* Students */}
              <button
                onClick={() => onSelectTab('users_students')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                  currentTab === 'users_students'
                    ? 'bg-white text-[#8E1B24] font-bold shadow-md translate-x-1'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                <span>Students</span>
              </button>

              {/* Customers */}
              <button
                onClick={() => onSelectTab('users_customers')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                  currentTab === 'users_customers'
                    ? 'bg-white text-[#8E1B24] font-bold shadow-md translate-x-1'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Customers</span>
              </button>

              {/* Strikes & Bans */}
              <button
                onClick={() => onSelectTab('strikes_bans')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                  currentTab === 'strikes_bans'
                    ? 'bg-white text-[#8E1B24] font-bold shadow-md translate-x-1'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-300" />
                <span>Strikes & Bans</span>
              </button>
            </div>
          )}
        </div>

        {/* Student Verification Dropdown */}
        <div className="pt-2">
          <button
            onClick={() => setStudentVerificationOpen(!studentVerificationOpen)}
            className="w-full flex items-center justify-between px-4 py-2 text-white/90 hover:text-white font-medium text-left cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 shrink-0" />
              <span>Student Verification</span>
            </div>
            {studentVerificationOpen ? (
              <ChevronUp className="w-3.5 h-3.5 opacity-70" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            )}
          </button>

          {studentVerificationOpen && (
            <div className="pl-4 pr-1 py-1 space-y-1">
              <button
                onClick={() => onSelectTab('student_verification_pending')}
                className={`w-full flex items-center justify-between px-4 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                  currentTab === 'student_verification_pending'
                    ? 'bg-white text-[#8E1B24] font-bold shadow-md translate-x-1'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Hourglass className="w-3.5 h-3.5 shrink-0" />
                  <span>Pending</span>
                </div>
                {pendingStudentsCount > 0 && (
                  <span className="text-[10px] bg-amber-400 text-slate-900 font-bold px-1.5 py-0.2 rounded-full">
                    {pendingStudentsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => onSelectTab('student_verification_verified')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                  currentTab === 'student_verification_verified'
                    ? 'bg-white text-[#8E1B24] font-bold shadow-md translate-x-1'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Verified</span>
              </button>
            </div>
          )}
        </div>

        {/* Audit Logs */}
        <div className="pt-2">
          <button
            onClick={() => onSelectTab('audit_logs')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all text-left cursor-pointer ${
              currentTab === 'audit_logs'
                ? 'bg-white text-[#8E1B24] font-semibold shadow-md translate-x-1'
                : 'text-white/85 hover:text-white hover:bg-white/10'
            }`}
          >
            <History className="w-4 h-4 shrink-0" />
            <span>Audit Logs</span>
          </button>
        </div>
      </nav>

      {/* Sidebar bottom indicator */}
      <div className="p-4 border-t border-red-800/40 text-xs text-white/60 flex items-center justify-between">
        <span>RED NEXUS Admin</span>
        <span className="text-[10px] bg-white/10 text-white px-2 py-0.5 rounded-full font-mono">
          CAFA 2026
        </span>
      </div>
    </aside>
  );
};
