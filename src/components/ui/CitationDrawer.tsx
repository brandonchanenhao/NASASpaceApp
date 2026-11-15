import {
  BookOpen,
  Database,
  ExternalLink,
  Globe,
  Mars,
  Moon,
  Orbit,
  Satellite,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useRef } from 'react'
import { allSites } from '../../data/analogs_dataset'
import { ALL_CITATIONS } from '../../data/citations'
import type { CelestialBody, Citation } from '../../types'
import { bodyColors } from '../../utils/colors'
import { BODY_LABELS } from '../../utils/constants'

interface CitationDrawerProps {
  open: boolean
  onClose: () => void
}

interface CitationGroup {
  body: CelestialBody
  citations: readonly Citation[]
}

interface ArchiveLink {
  label: string
  detail: string
  url: string
  Icon: LucideIcon
}

const BODY_ORDER: readonly CelestialBody[] = ['earth', 'moon', 'mars']

const BODY_ICONS: Record<CelestialBody, LucideIcon> = {
  earth: Globe,
  moon: Moon,
  mars: Mars,
}

/**
 * Primary NASA archives that distribute the datasets cited by the explorer.
 * Every URL is a public landing page, so the drawer stays useful without an
 * Earthdata Login session.
 */
const ARCHIVE_LINKS: readonly ArchiveLink[] = [
  {
    label: 'NASA Worldview',
    detail: 'Browse corrected-reflectance and LST imagery at any coordinate',
    url: 'https://worldview.earthdata.nasa.gov/',
    Icon: Satellite,
  },
  {
    label: 'Earthdata Search',
    detail: 'Download the LP DAAC and NSIDC products behind each Earth value',
    url: 'https://search.earthdata.nasa.gov/',
    Icon: Database,
  },
  {
    label: 'PDS Geosciences Node',
    detail: 'Planetary Data System archive for LRO, MGS, MRO and Mars Express',
    url: 'https://pds-geosciences.wustl.edu/',
    Icon: Orbit,
  },
  {
    label: 'LRO mission',
    detail: 'Lunar Reconnaissance Orbiter instrument and mission documentation',
    url: 'https://lunar.gsfc.nasa.gov/',
    Icon: Moon,
  },
  {
    label: 'Moon Trek',
    detail: 'LROC, LOLA and Diviner global mosaics with layer control',
    url: 'https://trek.nasa.gov/moon/',
    Icon: Moon,
  },
  {
    label: 'Mars Trek',
    detail: 'Viking, MOLA, TES and HiRISE global mosaics with layer control',
    url: 'https://trek.nasa.gov/mars/',
    Icon: Mars,
  },
]

/**
 * Assigns each citation to the first body whose benchmark sites reference it.
 *
 * Deriving the grouping from `allSites` instead of a hand-maintained map means a
 * newly added site cannot leave its datasets stranded in the wrong section: the
 * drawer always reflects which mission class actually consumes the product.
 */
function groupCitationsByBody(): readonly CitationGroup[] {
  const owner = new Map<string, CelestialBody>()

  for (const body of BODY_ORDER) {
    for (const site of allSites) {
      if (site.body !== body) continue
      for (const citation of site.citations) {
        if (!owner.has(citation.id)) owner.set(citation.id, body)
      }
    }
  }

  // Citations that no curated site currently consumes still need a section.
  // MGS TES is catalogued for provenance even though the Mars sites anchor
  // their thermal values on THEMIS; anything else defaults to the Earth group.
  for (const citation of ALL_CITATIONS) {
    if (owner.has(citation.id)) continue
    owner.set(citation.id, citation.id === 'tes' ? 'mars' : 'earth')
  }

  return BODY_ORDER.map((body) => ({
    body,
    citations: ALL_CITATIONS.filter((citation) => owner.get(citation.id) === body),
  })).filter((group) => group.citations.length > 0)
}

const CITATION_GROUPS = groupCitationsByBody()

/**
 * Slide-out NASA source catalog.
 *
 * The drawer is mounted permanently so it can animate in and out, but when
 * closed it is `invisible`, which removes every link from the tab order. Focus
 * moves to the close button on open, Escape dismisses the drawer, Tab is
 * trapped inside the panel, and background scrolling is locked while it is up.
 */
export function CitationDrawer({ open, onClose }: CitationDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    // Remember the opener so closing returns keyboard focus where it started.
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null

    closeRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [open, onClose])

  return (
    <div data-citation-drawer={open ? 'open' : 'closed'}>
      <div
        aria-hidden="true"
        onClick={onClose}
        data-open={open}
        className={`citation-scrim fixed inset-0 z-40 bg-void/70 backdrop-blur-sm ${
          open ? '' : 'pointer-events-none'
        }`}
      />

      <div
        id="citation-drawer"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="citation-drawer-heading"
        aria-hidden={!open}
        data-open={open}
        className="citation-drawer fixed inset-y-0 right-0 z-50 flex w-full max-w-[27rem] flex-col border-l border-hairline bg-abyss shadow-[-18px_0_48px_rgb(0_0_0/0.55)]"
      >
        <div className="flex items-start gap-2 border-b border-hairline px-3 py-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-plasma/40 bg-plasma/10 text-plasma">
            <BookOpen className="size-4" strokeWidth={2} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-plasma">
              Scientific provenance
            </p>
            <h2
              id="citation-drawer-heading"
              className="mt-0.5 text-sm font-semibold"
            >
              NASA source catalog
            </h2>
            <p className="mt-0.5 text-[0.6875rem] leading-relaxed text-ink-muted">
              {ALL_CITATIONS.length} instrument datasets across Earth, the Moon
              and Mars. Every parameter in the explorer resolves to one of these
              public archive products.
            </p>
          </div>
          <button
            type="button"
            ref={closeRef}
            onClick={onClose}
            aria-label="Close NASA source catalog"
            title="Close NASA source catalog"
            className="grid size-7 shrink-0 place-items-center rounded-lg border border-hairline bg-panel text-ink-muted transition-colors hover:border-plasma/40 hover:text-plasma"
          >
            <X className="size-3.5" strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          <div className="space-y-3">
            {CITATION_GROUPS.map((group) => {
              const BodyIcon = BODY_ICONS[group.body]
              return (
                <section
                  key={group.body}
                  aria-labelledby={`citation-group-${group.body}`}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="grid size-5 place-items-center rounded border border-hairline bg-panel"
                      style={{ color: bodyColors[group.body] }}
                    >
                      <BodyIcon
                        className="size-3"
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </span>
                    <h3
                      id={`citation-group-${group.body}`}
                      className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink"
                    >
                      {BODY_LABELS[group.body]} products
                    </h3>
                    <span className="ml-auto text-[0.5625rem] text-ink-dim">
                      {group.citations.length} datasets
                    </span>
                  </div>

                  <ul className="mt-1.5 space-y-1">
                    {group.citations.map((citation) => (
                      <li
                        key={citation.id}
                        className="rounded-lg border border-hairline bg-panel/60 px-2 py-1.5"
                      >
                        <p className="text-[0.6875rem] font-semibold leading-snug text-ink">
                          {citation.instrument}
                        </p>
                        <p className="mt-0.5 text-[0.625rem] leading-snug text-ink-muted">
                          {citation.dataset}
                        </p>
                        <p className="mt-1 text-[0.625rem] leading-relaxed text-ink-dim">
                          {citation.description}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <a
                            href={citation.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[0.625rem] font-semibold text-plasma hover:text-ink"
                          >
                            Open product page
                            <ExternalLink
                              className="size-2.5"
                              strokeWidth={2}
                              aria-hidden="true"
                            />
                          </a>
                          {citation.doi ? (
                            <a
                              href={`https://doi.org/${citation.doi}`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-mono text-[0.5625rem] text-ink-dim hover:text-plasma"
                            >
                              DOI {citation.doi}
                            </a>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )
            })}
          </div>

          <section aria-labelledby="citation-archives-heading" className="mt-4">
            <h3
              id="citation-archives-heading"
              className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink"
            >
              Primary NASA archives
            </h3>
            <ul className="mt-1.5 grid gap-1 sm:grid-cols-2">
              {ARCHIVE_LINKS.map(({ label, detail, url, Icon }) => (
                <li key={label}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-full items-start gap-1.5 rounded-lg border border-hairline bg-panel/60 px-2 py-1.5 transition-colors hover:border-plasma/40 hover:bg-elevated/60"
                  >
                    <span className="mt-0.5 text-plasma">
                      <Icon
                        className="size-3.5"
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[0.625rem] font-semibold text-ink">
                        {label}
                      </span>
                      <span className="mt-0.5 block text-[0.5625rem] leading-snug text-ink-dim">
                        {detail}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <p className="mt-3 border-t border-hairline pt-2 text-[0.5625rem] leading-relaxed text-ink-dim">
            Values are derived from NASA GIBS, Moon Trek, Mars Trek and Common
            Metadata Repository products. DOIs resolve to the peer-reviewed
            product descriptions where the mission publishes one.
          </p>
        </div>
      </div>
    </div>
  )
}
