import {
  BookOpen,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Rocket,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { allSites } from '../../data/analogs_dataset'
import { ALL_CITATIONS } from '../../data/citations'
import { DIMENSION_KEYS } from '../../utils/constants'

interface HeaderProps {
  sidebarOpen: boolean
  onToggleSidebar: () => void
  /** True while the NASA source catalog drawer is open. */
  citationsOpen: boolean
  onOpenCitations: () => void
  onBackToEarthMap?: () => void
}

/**
 * Mission header: identity, dataset scale, and the two global controls.
 *
 * Below `lg` the metadata chips collapse into a disclosure menu so the header
 * never wraps onto a third line on narrow screens; the citation and catalog
 * buttons stay visible at every width because they gate the two primary
 * navigation surfaces.
 */
export function Header({
  sidebarOpen,
  onToggleSidebar,
  citationsOpen,
  onOpenCitations,
  onBackToEarthMap,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const ToggleIcon = sidebarOpen ? PanelLeftClose : PanelLeftOpen
  const MenuIcon = menuOpen ? X : Menu

  return (
    <header className="relative border-b border-hairline bg-panel/70 backdrop-blur">
      <div className="flex flex-wrap items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4 xl:px-6">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-expanded={sidebarOpen}
          aria-controls="site-sidebar"
          aria-label={
            sidebarOpen ? 'Collapse site catalog' : 'Expand site catalog'
          }
          title={
            sidebarOpen ? 'Collapse site catalog' : 'Expand site catalog'
          }
          className="grid size-9 shrink-0 place-items-center rounded-lg border border-hairline bg-elevated text-ink-muted transition-colors hover:border-plasma/40 hover:text-plasma"
        >
          <ToggleIcon className="size-4" strokeWidth={2} aria-hidden="true" />
        </button>

        {onBackToEarthMap && (
          <button
            type="button"
            onClick={onBackToEarthMap}
            className="flex items-center gap-1.5 rounded-lg border border-plasma/50 bg-plasma/10 px-3 py-1.5 text-xs font-semibold text-plasma transition-all hover:bg-plasma/20"
          >
            <span aria-hidden="true">←</span>
            <span>Earth Map</span>
          </button>
        )}

        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-plasma/40 bg-plasma/10 text-plasma">
            <Rocket className="size-5" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold tracking-tight sm:text-lg">
              LunaTerraMars Analog Explorer
            </h1>
            <p className="hidden truncate text-[0.6875rem] text-ink-muted sm:block sm:text-xs">
              Quantitative Earth analog discovery for permanent lunar and
              Martian base siting
            </p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden rounded-full border border-solar/40 bg-solar/10 px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-solar md:inline-flex">
            NASA Space Apps 2026
          </span>

          <button
            type="button"
            onClick={onOpenCitations}
            aria-haspopup="dialog"
            aria-expanded={citationsOpen}
            aria-controls="citation-drawer"
            aria-label="Open NASA source citations"
            title="NASA source citations"
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-hairline bg-elevated px-2.5 text-ink-muted transition-colors hover:border-plasma/40 hover:text-plasma"
          >
            <BookOpen className="size-4" strokeWidth={2} aria-hidden="true" />
            <span className="hidden text-[0.6875rem] font-semibold sm:inline">
              Sources
            </span>
            <span className="rounded-full bg-panel px-1.5 py-px font-mono text-[0.5625rem] text-ink-dim">
              {ALL_CITATIONS.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="header-metadata-menu"
            aria-label={
              menuOpen
                ? 'Close dataset summary menu'
                : 'Open dataset summary menu'
            }
            title="Dataset summary"
            className="grid size-9 shrink-0 place-items-center rounded-lg border border-hairline bg-elevated text-ink-muted transition-colors hover:border-plasma/40 hover:text-plasma lg:hidden"
          >
            <MenuIcon className="size-4" strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        id="header-metadata-menu"
        hidden={!menuOpen}
        className="absolute right-3 top-full z-40 mt-1 w-64 space-y-1.5 rounded-xl border border-hairline-strong bg-abyss p-2.5 shadow-[0_18px_42px_rgb(0_0_0/0.6)] lg:hidden"
      >
        <p className="text-[0.5625rem] font-semibold uppercase tracking-[0.14em] text-ink-dim">
          Dataset summary
        </p>
        <p className="rounded-lg border border-hairline bg-panel/70 px-2 py-1.5 text-[0.6875rem] text-ink-muted">
          {allSites.length} benchmark sites · {DIMENSION_KEYS.length} similarity
          dimensions
        </p>
        <p className="rounded-lg border border-solar/40 bg-solar/10 px-2 py-1.5 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-solar">
          NASA Space Apps 2026
        </p>
      </div>
    </header>
  )
}
