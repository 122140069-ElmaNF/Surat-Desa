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
      <label className="form-label">
        {label}
      </label>

      <select
        className="form-control"
        name={name}
        value={value}
        onChange={onChange}
      >
        <option value="">
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