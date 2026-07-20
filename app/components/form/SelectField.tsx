type Props = {
  label: string;
  name: string;
  value: string;
  options: string[];
  onChange: (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => void;
};

export default function SelectField({
  label,
  name,
  value,
  options,
  onChange,
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
    </div>
  );
}