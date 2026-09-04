type Props = {
  label: string;
  name: string;
  value: string;
  options: string[];
  onChange: (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => void;
  disabled?: boolean;
  error?: string;
};

export default function SelectField({
  label,
  name,
  value,
  options,
  onChange,
  disabled = false,
  error,
}: Props) {
  return (
    <div className="form-group">
      <label
        htmlFor={name}
        className="form-label"
      >
        {label}
      </label>

      <select
        id={name}
        name={name}
        className="form-control"
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={{
          color: disabled
            ? "#6b7280"
            : undefined,
        }}
      >
        <option value="" disabled>
          -- Pilih --
        </option>

        {options.map((item) => (
          <option
            key={item}
            value={item}
          >
            {item}
          </option>
        ))}
      </select>

      {error && (
        <p className="form-error">
          {error}
        </p>
      )}
    </div>
  );
}