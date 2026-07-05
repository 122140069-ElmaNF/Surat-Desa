type Props = {
  children: React.ReactNode;
};

export default function SubmitButton({
  children,
}: Props) {
  return (
    <button
      type="submit"
      className="submit-button"
    >
      {children}
    </button>
  );
}