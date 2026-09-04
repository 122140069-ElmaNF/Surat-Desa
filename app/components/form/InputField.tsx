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
  readOnly?: boolean;
  error?: string;
};

export default function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  textarea = false,
  readOnly = false,
  error,
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
          readOnly={readOnly}
          style={{
            color: readOnly
              ? "#6b7280"
              : undefined,
          }}
        />
      ) : (
        <input
          className="form-control"
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          style={{
            color: readOnly
              ? "#6b7280"
              : undefined,
          }}
        />
      )}

      {error && (
        <p className="form-error">
          {error}
        </p>
      )}
    </div>
  );
}