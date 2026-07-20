"use client";

import { useState } from "react";

type Props = {
  label: string;
  accept?: string;
  onChange: (file: File | null) => void;
};

export default function FileUploadField({
  label,
  accept,
  onChange,
}: Props) {
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0] ?? null;

    if (!file) {
      setFileName("");
      setError("");
      onChange(null);
      return;
    }

    // Validasi format file
    const allowedTypes = [
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("File harus berformat JPG atau PNG.");
      setFileName("");
      e.target.value = "";
      onChange(null);
      return;
    }

    // Validasi ukuran file (5 MB)
    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError("Ukuran file maksimal 5 MB.");
      setFileName("");
      e.target.value = "";
      onChange(null);
      return;
    }

    setError("");
    setFileName(file.name);
    onChange(file);
  };

  return (
    <div className="form-group">
      <label className="form-label">
        {label}
      </label>

      <div className="file-upload">
        <input
          className="form-control"
          type="file"
          accept={accept ?? "image/jpeg,image/png"}
          onChange={handleChange}
        />

        <p className="file-upload-text">
          {fileName || "Belum ada file dipilih"}
        </p>

        <small className="file-upload-helper">
          Format: JPG, PNG • Maks. 5 MB
        </small>

        {error && (
          <p className="file-upload-error">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}