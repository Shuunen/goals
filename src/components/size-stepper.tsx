import type { useSize } from '../hooks/use-size'

// what the size hook gives
export type SizeStepperProps = ReturnType<typeof useSize>

// a minus button, the current zoom level, then a plus button, all on one line, and a way back to 100% once it is left
export function SizeStepper({ canGrow, canReset, canShrink, larger, reset, size, smaller }: Readonly<SizeStepperProps>) {
  return (
    <fieldset className="size-stepper">
      <legend>Size</legend>
      <button aria-label="Smaller" disabled={!canShrink} onClick={smaller} type="button">
        −
      </button>
      <output aria-label="Current size" aria-live="polite">
        {size}%
      </output>
      <button aria-label="Larger" disabled={!canGrow} onClick={larger} type="button">
        +
      </button>
      {canReset ? (
        <button className="size-reset" onClick={reset} type="button">
          Reset
        </button>
      ) : undefined}
    </fieldset>
  )
}
