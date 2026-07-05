type Props = {
  label: string;
  accept?: string;
  onChange: (
    file: File | null
  ) => void;
};

export default function FileUploadField({
  label,
  accept,
  onChange,
}: Props) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}
      </label>

      <input
        className="form-control"
        type="file"
        accept={accept}
        onChange={(e) =>
          onChange(
            e.target.files?.[0] ?? null
          )
        }
      />
    </div>
  );
}