import {
  BarChart3,
  Map as MapIcon,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react'
import { useRef, type KeyboardEvent } from 'react'

/** Workspaces available in the main analysis shell. */
export type WorkspaceTab = 'discover' | 'map' | 'dashboard' | 'configurator'

interface TabNavigationProps {
  activeTab: WorkspaceTab
  onTabChange: (tab: WorkspaceTab) => void
}

interface TabDefinition {
  id: WorkspaceTab
  label: string
  caption: string
  Icon: LucideIcon
}

const TABS: readonly TabDefinition[] = [
  {
    id: 'map',
    label: '1 · Dual Map',
    caption: 'Earth vs Moon/Mars',
    Icon: MapIcon,
  },
  {
    id: 'dashboard',
    label: '2 · Compare',
    caption: 'Physics deltas',
    Icon: BarChart3,
  },
  {
    id: 'configurator',
    label: '3 · Rank',
    caption: 'Mission weighting',
    Icon: SlidersHorizontal,
  },
]

/**
 * Top-level workspace tabs.
 *
 * The active underline is a scale transform, so the only animated property is
 * GPU-composited and the global reduced-motion rule can neutralise it. Keyboard
 * behaviour follows the ARIA tabs pattern: a roving tabindex (only the selected
 * tab is in the tab order) with Arrow/Home/End moving both selection and focus.
 */
export function TabNavigation({
  activeTab,
  onTabChange,
}: TabNavigationProps) {
  const tabRefs = useRef(new Map<WorkspaceTab, HTMLButtonElement>())

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const currentIndex = TABS.findIndex((tab) => tab.id === activeTab)
    if (currentIndex < 0) return

    let nextIndex: number | null = null
    if (event.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % TABS.length
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + TABS.length) % TABS.length
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = TABS.length - 1
    }
    if (nextIndex === null) return

    event.preventDefault()
    const nextTab = TABS[nextIndex]
    onTabChange(nextTab.id)
    tabRefs.current.get(nextTab.id)?.focus()
  }

  return (
    <nav
      aria-label="Analysis workspaces"
      className="sticky top-0 z-30 border-b border-hairline bg-void/90 backdrop-blur"
    >
      <div
        className="flex gap-1 px-2 sm:px-3"
        role="tablist"
        aria-orientation="horizontal"
        onKeyDown={handleKeyDown}
      >
        {TABS.map(({ id, label, caption, Icon }) => {
          const isActive = id === activeTab
          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={`tab-${id}`}
              aria-selected={isActive}
              aria-controls="workspace-panel"
              tabIndex={isActive ? 0 : -1}
              ref={(element) => {
                if (element) tabRefs.current.set(id, element)
                else tabRefs.current.delete(id)
              }}
              onClick={() => onTabChange(id)}
              className={`group relative flex items-center gap-2 px-3 pb-2.5 pt-2.5 text-left transition-colors duration-200 ${
                isActive ? 'text-plasma' : 'text-ink-muted hover:text-ink'
              }`}
            >
              <Icon className="size-4" strokeWidth={2} aria-hidden="true" />
              <span className="flex flex-col leading-tight">
                <span className="text-xs font-semibold sm:text-sm">{label}</span>
                <span className="hidden text-[0.5625rem] uppercase tracking-[0.12em] text-ink-dim sm:block">
                  {caption}
                </span>
              </span>
              <span
                aria-hidden="true"
                className={`absolute inset-x-2 -bottom-px h-0.5 origin-left rounded-full bg-plasma transition-transform duration-300 ease-out ${
                  isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-50'
                }`}
              />
            </button>
          )
        })}
      </div>
    </nav>
  )
}
