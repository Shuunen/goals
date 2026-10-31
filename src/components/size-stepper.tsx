type SizeStepperProps = {
  canGrow: boolean
  canShrink: boolean
  onLarger: () => void
  onSmaller: () => void
  size: string
}

// a minus button, the current zoom level, then a plus button, all on one line
export function SizeStepper({ canGrow, canShrink, onLarger, onSmaller, size }: SizeStepperProps) {
  return (
    <fieldset className="size-stepper">
      <legend>Size</legend>
      <button aria-label="Smaller" disabled={!canShrink} onClick={onSmaller} type="button">
        −
      </button>
      <output aria-label="Current size">{size}%</output>
      <button aria-label="Larger" disabled={!canGrow} onClick={onLarger} type="button">
        +
      </button>
    </fieldset>
  )
}
