import React, { useState } from 'react';
import {
  Palette,
  Tag,
  CreditCard,
  Download,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { Artwork, AdminTab } from '../../types';
import { cafaDistribution } from '../../data/mockData';

interface AdminDashboardViewProps {
  artworks: Artwork[];
  onNavigateTab: (tab: AdminTab) => void;
  onSelectArtwork: (artwork: Artwork) => void;
  onExportData: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  artworks,
  onNavigateTab,
  onSelectArtwork,
  onExportData,
}) => {
  const [distMode, setDistMode] = useState<'artists' | 'artworks'>('artists');
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  const pendingArtworks = artworks.filter((a) => a.status === 'pending');
  const currentDistribution =
    distMode === 'artists' ? cafaDistribution.artists : cafaDistribution.artworks;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Top Stat Cards Row (Exact match to Home.png / Image 10) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* TOTAL ARTWORKS */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Total Artworks
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">5</div>
            <div className="text-xs text-neutral-500 mt-1">2 pending review</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Palette className="w-6 h-6" />
          </div>
        </div>

        {/* SOLD */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Sold
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">2</div>
            <div className="text-xs text-neutral-500 mt-1">Completed purchases</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Tag className="w-6 h-6" />
          </div>
        </div>

        {/* TOTAL SALES */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-xs flex items-center justify-between relative overflow-hidden">
          <div>
            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Total Sales
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">₱18,500</div>
            <div className="text-xs text-neutral-500 mt-1">Total revenue generated</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Top right export data button */}
      <div className="flex justify-end">
        <button
          onClick={onExportData}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#8E1B24] hover:bg-red-900 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Data</span>
        </button>
      </div>

      {/* 2. CAFA Program Distribution Card (Exact match to Home.png) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg text-slate-900">
                CAFA Program Distribution
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 tracking-wider">
                COLLEGE OF ARCHITECTURE & FINE ARTS
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Departmental breakdown of student artists & artwork catalog
            </p>
          </div>

          {/* Toggle By Artists / By Artworks */}
          <div className="flex items-center p-1 bg-neutral-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setDistMode('artists')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                distMode === 'artists'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-neutral-500 hover:text-slate-900'
              }`}
            >
              By Artists (6)
            </button>
            <button
              onClick={() => setDistMode('artworks')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                distMode === 'artworks'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-neutral-500 hover:text-slate-900'
              }`}
            >
              By Artworks (8)
            </button>
          </div>
        </div>

        {/* Donut Chart & Legend Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-2">
          {/* SVG Donut Chart */}
          <div className="md:col-span-5 flex flex-col items-center justify-center relative">
            <div className="relative w-52 h-52">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {/* BS Architecture: 33% */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#E52535"
                  strokeWidth="16"
                  strokeDasharray="78.8 238.7"
                  strokeDashoffset="0"
                  className="transition-all hover:stroke-width-18 cursor-pointer"
                  onMouseEnter={() => setHoveredSlice('BS Architecture (33%)')}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
                {/* BFA Painting: 17% */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#F59E0B"
                  strokeWidth="16"
                  strokeDasharray="40.5 238.7"
                  strokeDashoffset="-78.8"
                  className="transition-all hover:stroke-width-18 cursor-pointer"
                  onMouseEnter={() => setHoveredSlice('BFA Painting (17%)')}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
                {/* BFA Advertising Arts: 17% */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#8B5CF6"
                  strokeWidth="16"
                  strokeDasharray="40.5 238.7"
                  strokeDashoffset="-119.3"
                  className="transition-all hover:stroke-width-18 cursor-pointer"
                  onMouseEnter={() => setHoveredSlice('BFA Advertising Arts (17%)')}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
                {/* BS Interior Design: 17% */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#10B981"
                  strokeWidth="16"
                  strokeDasharray="40.5 238.7"
                  strokeDashoffset="-159.8"
                  className="transition-all hover:stroke-width-18 cursor-pointer"
                  onMouseEnter={() => setHoveredSlice('BS Interior Design (17%)')}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
                {/* BFA Industrial Design: 17% */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#06B6D4"
                  strokeWidth="16"
                  strokeDasharray="38.5 238.7"
                  strokeDashoffset="-200.3"
                  className="transition-all hover:stroke-width-18 cursor-pointer"
                  onMouseEnter={() => setHoveredSlice('BFA Industrial Design (17%)')}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
              </svg>
              {/* Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[10px] font-bold uppercase text-neutral-400">CAFA</span>
                <span className="text-xl font-black text-slate-900">6</span>
                <span className="text-[10px] font-medium text-neutral-500">Enrolled Artists</span>
              </div>
            </div>
            <p className="text-[11px] text-neutral-400 mt-2">
              {hoveredSlice || 'Hover or tap any sector to view program share'}
            </p>
          </div>

          {/* Department breakdown legend bars */}
          <div className="md:col-span-7 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              {currentDistribution.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="truncate">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-700 font-mono">{item.percent}%</span>
                  </div>
                  <div className="text-[11px] text-neutral-400 flex justify-between">
                    <span>{item.students} students</span>
                    <span>{item.arts} arts listed</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.percent}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* 100% Student Artist Proceeds Callout */}
            <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/90 rounded-2xl flex items-start gap-3 text-xs text-emerald-950 mt-4">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                ✓
              </div>
              <p className="leading-relaxed">
                <strong className="font-bold">100% Student Artist Proceeds (0% Platform Fee):</strong> RED NEXUS does not take any cut or commission from student transactions. Every peso generated from art sales directly supports and empowers CAFA creators across all architecture and fine arts departments.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Monthly Sales Velocity Curve Chart (Exact match to Home.png) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">Monthly Sales</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Transaction velocity across active academic quarters
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>2026 Volume</span>
          </div>
        </div>

        {/* Smooth Spline Wave Area Chart */}
        <div className="relative pt-6">
          <div className="h-64 w-full">
            <svg viewBox="0 0 600 220" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="0" y1="20" x2="600" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="0" y1="65" x2="600" y2="65" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="0" y1="110" x2="600" y2="110" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="0" y1="155" x2="600" y2="155" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="0" y1="200" x2="600" y2="200" stroke="#e2e8f0" />

              {/* Gradient Area Fill */}
              <defs>
                <linearGradient id="sales-area-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <path
                d="M 25 200 
                   C 50 200, 75 190, 100 170 
                   C 125 150, 150 175, 175 160 
                   C 200 145, 225 130, 250 150 
                   C 275 170, 300 140, 325 130 
                   C 350 120, 375 145, 400 120 
                   C 425 95, 450 130, 475 110 
                   C 500 90, 525 80, 550 50 
                   L 550 200 Z"
                fill="url(#sales-area-grad)"
              />

              {/* Spline Line */}
              <path
                d="M 25 200 
                   C 50 200, 75 190, 100 170 
                   C 125 150, 150 175, 175 160 
                   C 200 145, 225 130, 250 150 
                   C 275 170, 300 140, 325 130 
                   C 350 120, 375 145, 400 120 
                   C 425 95, 450 130, 475 110 
                   C 500 90, 525 80, 550 50"
                fill="none"
                stroke="#DC2626"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Data points */}
              {[
                { cx: 25, cy: 200 },
                { cx: 60, cy: 200 },
                { cx: 100, cy: 170 },
                { cx: 145, cy: 175 },
                { cx: 190, cy: 145 },
                { cx: 240, cy: 155 },
                { cx: 285, cy: 135 },
                { cx: 330, cy: 145 },
                { cx: 375, cy: 120 },
                { cx: 425, cy: 130 },
                { cx: 480, cy: 105 },
                { cx: 550, cy: 50 },
              ].map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.cx}
                  cy={pt.cy}
                  r="4"
                  fill="#ffffff"
                  stroke="#DC2626"
                  strokeWidth="2.5"
                  className="hover:r-6 cursor-pointer transition-all"
                />
              ))}
            </svg>
          </div>

          {/* Month labels */}
          <div className="flex justify-between text-[11px] text-neutral-400 font-medium px-4 mt-2">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
            <span>Aug</span>
            <span>Sep</span>
            <span>Oct</span>
            <span>Nov</span>
            <span>Dec</span>
          </div>
        </div>
      </div>

      {/* 4. Bottom Row: Artworks Pending Verification & Recent System Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Artworks Pending Verification */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-red-600" />
              <h3 className="font-extrabold text-sm text-slate-900">
                Artworks Pending Verification
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('art_verification')}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-neutral-100 space-y-3">
            {pendingArtworks.slice(0, 2).map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectArtwork(item)}
                className="pt-3 first:pt-0 flex items-center justify-between cursor-pointer hover:bg-neutral-50 p-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-12 h-12 rounded-xl object-cover bg-neutral-100"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{item.title}</h4>
                    <p className="text-[11px] text-neutral-500">By {item.artist.split(' ')[0]}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-xs text-slate-900">
                    ₱{item.price.toLocaleString()}
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    Pending
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent System Activity */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-600" />
              <h3 className="font-extrabold text-sm text-slate-900">Recent System Activity</h3>
            </div>
            <button
              onClick={() => onNavigateTab('audit_logs')}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
            >
              <span>All logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-50">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-medium text-slate-800">Admin logged in</span>
              </div>
              <span className="text-[11px] text-neutral-400">9/4/2026</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-50">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-medium text-slate-800">Admin logged out</span>
              </div>
              <span className="text-[11px] text-neutral-400">9/3/2026</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-50">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-medium text-slate-800">Admin logged in</span>
              </div>
              <span className="text-[11px] text-neutral-400">9/3/2026</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-50">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-medium text-slate-800">Admin logged out</span>
              </div>
              <span className="text-[11px] text-neutral-400">9/3/2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
