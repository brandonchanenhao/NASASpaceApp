interface LoadingOverlayProps {
  /** Primary status line. Defaults to the planetary analysis copy. */
  message?: string
  /** Secondary line describing the specific archive request in flight. */
  detail?: string
}

/**
 * Waiting state for slow NASA archive queries.
 *
 * The loader is pure CSS — two counter-rotating orbits around a bright core —
 * so it adds no animation dependency to the bundle, and it inherits the global
 * `prefers-reduced-motion` rule that collapses keyframe durations. The wrapper
 * is absolutely positioned, so consumers must give their container a
 * positioning context.
 */
export function LoadingOverlay({
  message = 'Analyzing planetary data…',
  detail,
}: LoadingOverlayProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      data-loading-overlay
      className="absolute inset-0 z-20 grid place-items-center rounded-lg bg-void/75 backdrop-blur-[1px]"
    >
      <div className="flex flex-col items-center gap-2 px-3 text-center">
        <div className="orbit-loader" aria-hidden="true">
          <span className="orbit-loader__ring" />
          <span className="orbit-loader__ring orbit-loader__ring--inner" />
          <span className="orbit-loader__orbit">
            <span className="orbit-loader__satellite" />
          </span>
          <span className="orbit-loader__orbit orbit-loader__orbit--reverse">
            <span className="orbit-loader__satellite orbit-loader__satellite--gold" />
          </span>
          <span className="orbit-loader__core" />
        </div>
        <p className="text-xs font-semibold text-ink">{message}</p>
        {detail ? (
          <p className="max-w-[18rem] text-[0.625rem] leading-relaxed text-ink-muted">
            {detail}
          </p>
        ) : null}
      </div>
    </div>
  )
}
