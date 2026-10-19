type ChoiceGridProps<Option extends string> = {
  // data attribute set on each tile, so the css of the page can preview the option on it
  attribute: 'data-font' | 'data-theme'
  labels?: Record<Option, string>
  legend: string
  // when given, swatches become toggle buttons carrying these badges instead of a single-choice radio group
  markers?: Partial<Record<Option, string[]>>
  onChange: (option: Option) => void
  options: readonly Option[]
  value?: Option
}

// a group of radio tiles, each one previewing the option it stands for ; or, with markers, a group of
// toggle tiles that can each carry more than one badge at once
export function ChoiceGrid<Option extends string>({ attribute, labels, legend, markers, onChange, options, value }: ChoiceGridProps<Option>) {
  return (
    <fieldset className="choices">
      <legend>{legend}</legend>
      {options.map(option => {
        const badges = markers?.[option]
        const preview = (
          <span aria-hidden="true" className="preview">
            Aa
            {badges?.map(badge => (
              <span className="marker" key={badge}>
                {badge}
              </span>
            ))}
          </span>
        )
        const label = labels?.[option] ?? option
        if (markers)
          return (
            <button {...{ [attribute]: option }} aria-pressed={badges !== undefined} className="swatch" key={option} onClick={() => onChange(option)} type="button">
              {preview}
              {label}
            </button>
          )
        return (
          <label {...{ [attribute]: option }} className="swatch" key={option}>
            <input checked={option === value} name={legend} onChange={() => onChange(option)} type="radio" />
            {preview}
            {label}
          </label>
        )
      })}
    </fieldset>
  )
}
