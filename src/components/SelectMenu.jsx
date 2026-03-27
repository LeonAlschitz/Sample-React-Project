import React from 'react'

/**
 * Styled `<select>` aligned with AppSelect.css (`.app-select`).
 *
 * @param {string} value — controlled value
 * @param {(next: string) => void} onChange — receives the selected option value
 * @param {{ value: string, label: string }[]} [options] — list of options (ignored if `children` is set)
 * @param {string} ariaLabel — accessible name
 * @param {string} [className] — extra classes (merged after `app-select`)
 * @param {React.ReactNode} [children] — custom `<option>` elements; when set, `options` is not used
 */
function SelectMenu({
  value,
  onChange,
  options = [],
  ariaLabel,
  className = '',
  children,
  disabled = false,
  id,
  name,
  ...rest
}) {
  const cn = ['app-select', className].filter(Boolean).join(' ')

  return (
    <select
      id={id}
      name={name}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={cn}
      aria-label={ariaLabel}
      {...rest}
    >
      {children ??
        options.map(({ value: v, label }) => (
          <option key={v} value={v}>
            {label}
          </option>
        ))}
    </select>
  )
}

export default SelectMenu
