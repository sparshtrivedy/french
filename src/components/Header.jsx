export function Header({ search, onSearch, activeLabel }) {
  return (
    <header className="rounded-3xl border bg-white p-5 shadow-card">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            French study
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-stone-900">
            {activeLabel}
          </h1>
        </div>

        <label className="block w-full lg:max-w-sm">
          <span className="mb-2 block text-sm font-medium text-stone-700">
            Search current section
          </span>
          <input
            type="text"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Type French, English, or notes"
            className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 outline-none transition focus:border-accent focus:bg-white"
          />
        </label>
      </div>
    </header>
  );
}
