interface ExternalPageProps {
  url: string;
}

export function ExternalPage({ url }: ExternalPageProps) {
  return (
    <iframe
      src={url}
      className="w-full border-0"
      style={{ height: "calc(100vh - 3.5rem - 4rem)" }}
      title="External content"
      allow="payment"
    />
  );
}
