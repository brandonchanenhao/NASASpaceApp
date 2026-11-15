import { Info } from 'lucide-react'
import { useEffect, useId, useState, type ReactNode } from 'react'

interface TooltipInfoProps {
  /** Accessible name for the disclosure button, e.g. "About volatile weighting". */
  label: string
  /** Explanation shown in the popover (plain text or inline markup). */
  children: ReactNode
  /** Horizontal edge the 300 px popover aligns to. Defaults to "left". */
  align?: 'left' | 'right'
}

/**
 * Reusable (i) disclosure used for scientific term definitions.
 *
 * The popover opens on hover, keyboard focus and click so it remains usable
 * without a pointer, closes on Escape, and is wired with `aria-describedby` so
 * screen readers announce the explanation with the trigger button.
 */
export function TooltipInfo({
  label,
  children,
  align = 'left',
}: TooltipInfoProps) {
  const [open, setOpen] = useState(false)
  const tooltipId = useId()

  useEffect(() => {
    if (!open) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  const alignment = align === 'right' ? 'right-0' : 'left-0'

  return (
    <span className="relative inline-flex align-middle">
      <button
        type="button"
        aria-label={label}
        aria-describedby={open ? tooltipId : undefined}
        aria-expanded={open}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((value) => !value)}
        className="grid size-4 place-items-center rounded-full border border-hairline-strong bg-elevated text-ink-dim transition-colors hover:border-plasma/50 hover:text-plasma"
      >
        <Info className="size-2.5" strokeWidth={2.25} aria-hidden="true" />
      </button>

      {open ? (
        <span
          role="tooltip"
          id={tooltipId}
          className={`absolute bottom-full z-30 mb-1.5 w-max max-w-[300px] rounded-lg border border-hairline-strong bg-abyss px-2.5 py-2 text-left text-[0.6875rem] font-normal leading-relaxed text-ink shadow-[0_12px_30px_rgb(0_0_0/0.55)] ${alignment}`}
        >
          {children}
        </span>
      ) : null}
    </span>
  )
}
