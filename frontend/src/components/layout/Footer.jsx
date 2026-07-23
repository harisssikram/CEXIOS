export default function Footer() {
  return (
    <footer className="border-t border-line px-6 py-5 mt-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted">
        <p>(c) {new Date().getFullYear()} CEXIOS. Internal use only.</p>
        <p>Crypto Project Registry - v2.0</p>
      </div>
    </footer>
  );
}
