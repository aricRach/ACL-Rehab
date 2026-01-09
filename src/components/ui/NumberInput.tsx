export const NumberInput = ({ name, value, onChange, label, min = 0, max = 300 }) => {
  
  const handleBlur = (event) => {
    let numericValue = Number(event.target.value);
    if (!isNaN(numericValue)) {
      const clampedValue = Math.max(min, Math.min(max, numericValue));
      onChange(name, clampedValue);
    }
  };

  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <input
      placeholder="0"
      className="mt-2 mx-8 number-input"
        type="number"
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        onBlur={handleBlur}
        min={min}
        max={max}
      />
    </div>
  );
};