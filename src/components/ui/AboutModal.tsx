import { X } from 'lucide-react'
import { NasaLogo } from '../layout/Navbar'

interface AboutModalProps {
  open: boolean
  onClose: () => void
}

export function AboutModal({ open, onClose }: AboutModalProps) {
  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 p-4 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-7">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 rounded p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <X className="size-5" />
        </button>

        <div className="flex items-center gap-3">
          <NasaLogo className="size-9" />
          <div>
            <h2 id="about-dialog-title" className="text-base font-semibold text-white">
              Terra Analogues
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              LunaTerraMars Explorer · NASA Space Apps
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4 text-xs leading-relaxed text-slate-300">
          <p>
            <strong className="text-white">Why Study Earth’s Analogue Sites?</strong> Deploying crewed or robotic
            missions to lunar and Martian destinations requires rigorous validation under harsh conditions. Space
            agencies isolate physical, geochemical, or operational variables in terrestrial analogue environments
            to verify systems before flight.
          </p>

          <div className="rounded border border-slate-800 bg-slate-950 p-3.5 border-l-2 border-l-sky-500">
            <h3 className="text-xs font-medium uppercase tracking-wider text-slate-200">
              The Analogue Principle
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Earth analogue sites do not need to replicate Mars or the Moon identically. Scientists isolate
              individual variables—such as volcanic lava tube shelter, evaporite mineral biosignature preservation, or
              cryogenic permafrost sounding—to validate instrument payloads.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Verified Benchmark Locations
            </h3>
            <ul className="mt-2 space-y-1.5 text-xs">
              <li className="flex items-start gap-2 text-slate-300">
                <span className="text-slate-500 font-mono">-</span>
                <span><strong className="text-white">La Corona Lava Tube (Spain):</strong> Subterranean basaltic shelter & radiation attenuation</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <span className="text-slate-500 font-mono">-</span>
                <span><strong className="text-white">Kilbourne Hole Maar (USA):</strong> Explosive crater excavation & inverted mantle stratigraphy</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <span className="text-slate-500 font-mono">-</span>
                <span><strong className="text-white">Salar de Pajonales (Chile):</strong> High-altitude evaporite playa & UV extremophile preservation</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <span className="text-slate-500 font-mono">-</span>
                <span><strong className="text-white">Dallol Hydrothermal Field (Ethiopia):</strong> Hyper-acidic geothermal springs & silica precipitation</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <span className="text-slate-500 font-mono">-</span>
                <span><strong className="text-white">Hanksville Badlands (USA):</strong> Inverted river paleochannels & aeolian deflation</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <span className="text-slate-500 font-mono">-</span>
                <span><strong className="text-white">Adventdalen Permafrost Valley (Norway):</strong> Arctic permafrost & subsurface radar sounding</span>
              </li>
            </ul>
          </div>

          <p className="text-[0.6875rem] text-slate-500">
            All telemetry and imagery sourced from NASA GIBS, SRTM, ASTER GDEM, MODIS, and MERRA-2 archives.
          </p>
        </div>

        <div className="mt-5 border-t border-slate-800 pt-3 text-right">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-700 bg-slate-800 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

