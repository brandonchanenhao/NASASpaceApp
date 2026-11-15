import { lazy, Suspense, useCallback, useState } from 'react'
import { Navbar } from './components/layout/Navbar'
import { Sidebar } from './components/layout/Sidebar'
import type { WorkspaceTab } from './components/layout/TabNavigation'
import { DualMapView } from './components/maps/DualMapView'
import { CitationDrawer } from './components/ui/CitationDrawer'
import { AboutModal } from './components/ui/AboutModal'
import { getSite } from './data/analogs_dataset'
import { useMapSync } from './hooks/useMapSync'
import type { DimensionWeights } from './types'
import { DEFAULT_WEIGHTS } from './utils/constants'
import { EarthHomeView } from './components/home/EarthHomeView'
import { SiteStoryView } from './components/story/SiteStoryView'

/**
 * The charting stack is only needed by the comparison dashboard, so it is
 * code-split away from the initial map bundle.
 */
const ComparisonDashboard = lazy(() =>
  import('./components/dashboard/ComparisonDashboard').then((module) => ({
    default: module.ComparisonDashboard,
  })),
)

/**
 * The configurator owns the 60-pairing ranking and the printable brief, so it
 * ships as its own chunk rather than inflating the initial map payload.
 */
const MissionConfigurator = lazy(() =>
  import('./components/configurator/MissionConfigurator').then((module) => ({
    default: module.MissionConfigurator,
  })),
)

type AppView = 'home' | 'story' | 'workspace'

/**
 * Application root.
 *
 * Features a permanently visible, top-level NASA-themed navigation bar
 * across all views, seamlessly bridging:
 *  1. Earth Map (Interactive full-screen realistic satellite analogue explorer)
 *  2. Storytelling Pages (Cinematic geological breakdowns & interactive models)
 *  3. Quantitative Science Suite (Dual Map, 7D Comparison, Mission Configurator)
 */
function App() {
  const [appView, setAppView] = useState<AppView>('home')
  const [storySiteId, setStorySiteId] = useState<string>('la-corona')
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('map')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [citationsOpen, setCitationsOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [weights, setWeights] = useState<DimensionWeights>({
    ...DEFAULT_WEIGHTS,
  })
  const sync = useMapSync(weights)

  const closeCitations = useCallback(() => setCitationsOpen(false), [])

  function selectSite(siteId: string) {
    const site = getSite(siteId)
    if (site.body === 'earth') {
      sync.selectEarthSite(siteId)
      return
    }
    sync.selectTargetSite(siteId)
  }

  function compareSite(siteId: string) {
    selectSite(siteId)
    setActiveTab('dashboard')
    setAppView('workspace')
  }

  function openPairing(earthSiteId: string, targetSiteId: string) {
    sync.selectPairing(earthSiteId, targetSiteId)
    setActiveTab('dashboard')
    setAppView('workspace')
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-void text-ink">
      {/* 1. Visible Navbar permanently placed on top */}
      <Navbar
        activeView={appView}
        activeTab={activeTab}
        onNavigateHome={() => setAppView('home')}
        onNavigateWorkspace={(tab) => {
          setActiveTab(tab)
          setAppView('workspace')
        }}
        onOpenCitations={() => setCitationsOpen(true)}
        onOpenInfo={() => setInfoOpen(true)}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((open) => !open)}
        citationsOpen={citationsOpen}
      />

      {/* Global Modals & Drawers */}
      <CitationDrawer open={citationsOpen} onClose={closeCitations} />
      <AboutModal open={infoOpen} onClose={() => setInfoOpen(false)} />

      {/* Main Viewport Container */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* VIEW 1: Earth Map Homepage */}
        {appView === 'home' && (
          <EarthHomeView
            onOpenStory={(siteId) => {
              setStorySiteId(siteId)
              selectSite(siteId)
              setAppView('story')
            }}
          />
        )}

        {/* VIEW 2: Immersive Storytelling View */}
        {appView === 'story' && (
          <div className="flex-1 overflow-y-auto">
            <SiteStoryView
              siteId={storySiteId}
              onBackToMap={() => setAppView('home')}
              onSelectSite={(id) => {
                setStorySiteId(id)
                selectSite(id)
              }}
              onOpenDualMap={(id) => {
                selectSite(id)
                setActiveTab('map')
                setAppView('workspace')
              }}
              onOpenDashboard={(id) => {
                selectSite(id)
                setActiveTab('dashboard')
                setAppView('workspace')
              }}
            />
          </div>
        )}

        {/* VIEW 3: Quantitative Science Workspace */}
        {appView === 'workspace' && (
          <div className="flex min-h-0 flex-1 overflow-hidden">
            <Sidebar
              open={sidebarOpen}
              sync={sync}
              weights={weights}
              onSelectSite={selectSite}
            />

            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
              <main
                key={activeTab}
                id="workspace-panel"
                role="tabpanel"
                aria-labelledby={`tab-${activeTab}`}
                data-workspace-tab={activeTab}
                className="workspace-panel flex-1 overflow-y-auto px-2 py-3 sm:px-3 xl:px-4"
              >
                {activeTab === 'map' ? (
                  <DualMapView
                    sync={sync}
                    onCompareSite={compareSite}
                    onOpenComparison={() => setActiveTab('dashboard')}
                  />
                ) : activeTab === 'dashboard' ? (
                  <Suspense
                    fallback={
                      <div
                        role="status"
                        className="rounded-xl border border-hairline bg-panel/70 px-5 py-12 text-center text-sm text-ink-muted"
                      >
                        Loading comparison workspace…
                      </div>
                    }
                  >
                    <ComparisonDashboard
                      earthSiteId={sync.selectedEarthId}
                      targetSiteId={sync.selectedTargetId}
                      weights={weights}
                      onOpenMap={() => setActiveTab('map')}
                    />
                  </Suspense>
                ) : (
                  <Suspense
                    fallback={
                      <div
                        role="status"
                        className="rounded-xl border border-hairline bg-panel/70 px-5 py-12 text-center text-sm text-ink-muted"
                      >
                        Loading mission configurator…
                      </div>
                    }
                  >
                    <MissionConfigurator
                      weights={weights}
                      onWeightsChange={setWeights}
                      onSelectPairing={openPairing}
                      selectedPairingId={sync.pairing.id}
                    />
                  </Suspense>
                )}
              </main>

              <footer className="border-t border-hairline bg-panel/80 px-4 py-2.5">
                <p className="text-[0.6875rem] text-ink-dim">
                  Built for the 2026 NASA Space Apps Challenge. All planetary data
                  courtesy of NASA science missions: GIBS, Moon Trek, Mars Trek and CMR.
                </p>
              </footer>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
