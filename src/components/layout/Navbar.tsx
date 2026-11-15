import {
  BarChart3,
  BookOpen,
  Globe,
  Info,
  Menu,
  Orbit,
  PanelLeftClose,
  PanelLeftOpen,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { ALL_CITATIONS } from '../../data/citations'
import type { WorkspaceTab } from './TabNavigation'

export function NasaLogo({ className = 'size-8' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="NASA Logo"
    >
      <defs>
        <clipPath id="nasaCircleNav">
          <circle cx="58" cy="50" r="46" />
        </clipPath>
      </defs>
      <circle cx="58" cy="50" r="46" fill="#0b3d91" />
      <g fill="#ffffff" opacity="0.95" clipPath="url(#nasaCircleNav)">
        <circle cx="28" cy="35" r="1.3" />
        <circle cx="38" cy="22" r="1" />
        <circle cx="52" cy="18" r="1.5" />
        <circle cx="78" cy="25" r="1.2" />
        <circle cx="88" cy="38" r="1.6" />
        <circle cx="24" cy="55" r="1.2" />
        <circle cx="34" cy="68" r="1.4" />
        <circle cx="75" cy="74" r="1.3" />
        <circle cx="86" cy="62" r="1.1" />
        <circle cx="48" cy="80" r="1" />
        <circle cx="64" cy="84" r="1.4" />
      </g>
      <ellipse
        cx="58"
        cy="50"
        rx="50"
        ry="21"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.2"
        transform="rotate(-28 58 50)"
      />
      <path
        d="M 14 62 L 68 24 L 62 44 L 108 34 L 56 60 L 60 48 Z"
        fill="#fc3d21"
      />
      <text
        x="58"
        y="58"
        fill="#ffffff"
        fontSize="24"
        fontWeight="900"
        fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
        letterSpacing="2"
        textAnchor="middle"
      >
        NASA
      </text>
    </svg>
  )
}

interface NavbarProps {
  activeView: 'home' | 'story' | 'workspace'
  activeTab?: WorkspaceTab
  onNavigateHome: () => void
  onNavigateWorkspace: (tab: WorkspaceTab) => void
  onOpenCitations: () => void
  onOpenInfo: () => void
  sidebarOpen?: boolean
  onToggleSidebar?: () => void
  citationsOpen?: boolean
}

export function Navbar({
  activeView,
  activeTab,
  onNavigateHome,
  onNavigateWorkspace,
  onOpenCitations,
  onOpenInfo,
  sidebarOpen,
  onToggleSidebar,
  citationsOpen,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const ToggleIcon = sidebarOpen ? PanelLeftClose : PanelLeftOpen

  return (
    <header className="relative z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-3 sm:px-4 lg:px-6">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          {activeView === 'workspace' && onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-expanded={sidebarOpen}
              aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              className="grid size-8 place-items-center rounded-md border border-slate-800 bg-slate-900 text-slate-400 transition-colors hover:border-slate-700 hover:text-slate-200"
            >
              <ToggleIcon className="size-4" strokeWidth={2} />
            </button>
          )}

          <button
            type="button"
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 text-left transition-opacity hover:opacity-90"
          >
            <NasaLogo className="size-8 shrink-0" />
            <div className="hidden h-5 w-px bg-slate-800 sm:block" />
            <div>
              <span className="block text-sm font-semibold tracking-tight text-white sm:text-base leading-tight">
                Terra Analogues
              </span>
              <span className="hidden text-[0.5625rem] font-medium uppercase tracking-widest text-slate-400 sm:block">
                LunaTerraMars Explorer
              </span>
            </div>
          </button>
        </div>

        {/* Center: Navigation Links / Tabs */}
        <nav
          aria-label="Main Navigation"
          className="hidden md:flex items-center gap-1 rounded-md border border-slate-800 bg-slate-900/80 p-1"
        >
          {/* 1. Earth Map */}
          <button
            type="button"
            onClick={onNavigateHome}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
              activeView === 'home'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
            }`}
          >
            <Globe className="size-3.5" />
            <span>Earth Map</span>
          </button>

          {/* 2. Dual Planetary Map */}
          <button
            type="button"
            onClick={() => onNavigateWorkspace('map')}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
              activeView === 'workspace' && activeTab === 'map'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
            }`}
          >
            <Orbit className="size-3.5" />
            <span>Dual Map</span>
          </button>

          {/* 3. Comparison Dashboard */}
          <button
            type="button"
            onClick={() => onNavigateWorkspace('dashboard')}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
              activeView === 'workspace' && activeTab === 'dashboard'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="size-3.5" />
            <span>Comparison</span>
          </button>

          {/* 4. Mission Configurator */}
          <button
            type="button"
            onClick={() => onNavigateWorkspace('configurator')}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
              activeView === 'workspace' && activeTab === 'configurator'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="size-3.5" />
            <span>Configurator</span>
          </button>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <span className="hidden rounded border border-slate-800 bg-slate-900 px-2.5 py-1 text-[0.625rem] font-medium text-slate-400 xl:inline-flex">
            NASA Space Apps
          </span>

          {/* Sources Button */}
          <button
            type="button"
            onClick={onOpenCitations}
            aria-haspopup="dialog"
            aria-expanded={citationsOpen}
            className="hidden sm:inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-800 bg-slate-900 px-2.5 text-slate-300 transition-colors hover:border-slate-700 hover:text-white text-xs font-medium"
            title="NASA Source Datasets & Citations"
          >
            <BookOpen className="size-3.5" />
            <span>Sources</span>
            <span className="rounded bg-slate-800 px-1.5 py-px font-mono text-[0.5625rem] text-slate-400">
              {ALL_CITATIONS.length}
            </span>
          </button>

          {/* Info Button (i) */}
          <button
            type="button"
            onClick={onOpenInfo}
            aria-label="About Terra Analogues"
            className="grid size-8 place-items-center rounded-md border border-slate-800 bg-slate-900 text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
            title="About Terra Analogues"
          >
            <Info className="size-4" />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="grid size-8 place-items-center rounded-lg border border-hairline bg-elevated text-slate-300 md:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-hairline bg-panel/95 p-3 md:hidden animate-in slide-in-from-top-2 duration-150">
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false)
                onNavigateHome()
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold ${
                activeView === 'home'
                  ? 'bg-plasma text-void'
                  : 'text-slate-300 hover:bg-elevated hover:text-white'
              }`}
            >
              <Globe className="size-4" />
              <span>Earth Map (Analogue Sites)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false)
                onNavigateWorkspace('map')
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold ${
                activeView === 'workspace' && activeTab === 'map'
                  ? 'bg-plasma text-void'
                  : 'text-slate-300 hover:bg-elevated hover:text-white'
              }`}
            >
              <Orbit className="size-4" />
              <span>Dual Map (Earth vs Moon/Mars)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false)
                onNavigateWorkspace('dashboard')
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold ${
                activeView === 'workspace' && activeTab === 'dashboard'
                  ? 'bg-plasma text-void'
                  : 'text-slate-300 hover:bg-elevated hover:text-white'
              }`}
            >
              <BarChart3 className="size-4" />
              <span>Comparison Dashboard (Physics Deltas)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false)
                onNavigateWorkspace('configurator')
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold ${
                activeView === 'workspace' && activeTab === 'configurator'
                  ? 'bg-plasma text-void'
                  : 'text-slate-300 hover:bg-elevated hover:text-white'
              }`}
            >
              <SlidersHorizontal className="size-4" />
              <span>Mission Configurator (Ranking)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false)
                onOpenCitations()
              }}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-300 hover:bg-elevated hover:text-white"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="size-4" />
                <span>NASA Source Datasets</span>
              </span>
              <span className="rounded-full bg-void px-2 py-0.5 font-mono text-[0.625rem]">
                {ALL_CITATIONS.length}
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

