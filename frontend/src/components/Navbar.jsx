export default function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
        <a href="/" className="text-xl font-semibold text-slate-900">
          Routify
        </a>
        <nav className="hidden space-x-6 text-base text-slate-600 md:flex">
          <a href="/about" className="hover:text-slate-900">
            About
          </a>
          <a href="/help" className="hover:text-slate-900">
            Help
          </a>
        </nav>
      </div>
    </header>
  );
}
