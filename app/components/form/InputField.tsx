type Props = {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => void;
  placeholder?: string;
  type?: string;
  textarea?: boolean;
};

export default function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  textarea = false,
}: Props) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}
      </label>

      {textarea ? (
        <textarea
          className="form-control"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={4}
        />
      ) : (
        <input
          className="form-control"
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}