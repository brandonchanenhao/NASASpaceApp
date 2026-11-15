import { useCallback, useEffect, useRef, useState } from 'react'
import type { CmrLookup } from '../services/nasaCmr'

/** Lifecycle state of one CMR lookup. */
export type CmrQueryStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'empty'
  | 'offline'

/** State and actions returned by `useNasaCmr`. */
export interface CmrQuery<T> {
  status: CmrQueryStatus
  /** Latest successful payload, retained while a new request is in flight. */
  data: T | null
  /** Epoch milliseconds of the last completed lookup, or null. */
  completedAt: number | null
  /** Runs a lookup thunk, ignoring responses from superseded requests. */
  run: (operation: () => Promise<CmrLookup<T>>) => void
  /** Returns the query to its initial idle state. */
  reset: () => void
}

interface CmrQueryState<T> {
  status: CmrQueryStatus
  data: T | null
  completedAt: number | null
}

/**
 * Coordinates one asynchronous NASA CMR lookup.
 *
 * CMR searches are user-triggered and can be slow or unavailable, so this hook
 * tracks the request generation in a ref: a late response from a superseded
 * coordinate is dropped instead of overwriting the current one. It also keeps
 * the last successful payload visible while a follow-up request is loading.
 *
 * @param isEmpty Predicate separating a successful-but-empty catalog response
 *   from a non-empty one. Pass a module-level function to keep `run` stable.
 */
export function useNasaCmr<T>(
  isEmpty: (value: T) => boolean,
): CmrQuery<T> {
  const [state, setState] = useState<CmrQueryState<T>>({
    status: 'idle',
    data: null,
    completedAt: null,
  })
  const requestRef = useRef(0)
  const mountedRef = useRef(true)
  const isEmptyRef = useRef(isEmpty)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    isEmptyRef.current = isEmpty
  }, [isEmpty])

  const run = useCallback((operation: () => Promise<CmrLookup<T>>) => {
    requestRef.current += 1
    const requestId = requestRef.current

    setState((previous) => ({
      status: 'loading',
      data: previous.data,
      completedAt: previous.completedAt,
    }))

    operation()
      .then((outcome) => {
        if (!mountedRef.current || requestRef.current !== requestId) return
        if (outcome.status === 'offline') {
          setState({
            status: 'offline',
            data: null,
            completedAt: Date.now(),
          })
          return
        }
        setState({
          status: isEmptyRef.current(outcome.value) ? 'empty' : 'success',
          data: outcome.value,
          completedAt: Date.now(),
        })
      })
      .catch(() => {
        if (!mountedRef.current || requestRef.current !== requestId) return
        setState({
          status: 'offline',
          data: null,
          completedAt: Date.now(),
        })
      })
  }, [])

  const reset = useCallback(() => {
    requestRef.current += 1
    setState({ status: 'idle', data: null, completedAt: null })
  }, [])

  return { ...state, run, reset }
}
