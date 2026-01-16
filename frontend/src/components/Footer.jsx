export default function Footer() {
  return (
    <footer className="border-t border-slate-200 text-xs text-slate-500 sm:text-sm">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-1.5 px-4 py-4 text-center sm:gap-2 sm:px-6 sm:py-7 md:flex-row md:text-left">
        <p>&copy; {new Date().getFullYear()} calview. All rights reserved.</p>
        <div className="space-x-3 sm:space-x-4">
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
