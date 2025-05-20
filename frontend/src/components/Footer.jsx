export default function Footer() {
  return (
    <footer className="mt-24 border-t border-slate-200 text-sm text-slate-500">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 px-6 py-12 text-center md:flex-row md:text-left">
        <p>&copy; {new Date().getFullYear()} Routify. All rights reserved.</p>
        <div className="space-x-4">
          <a href="/privacy" className="hover:text-slate-700">
            Privacy
          </a>
          <a href="/terms" className="hover:text-slate-700">
            Terms
          </a>
          <a href="/contact" className="hover:text-slate-700">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
