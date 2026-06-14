export function VerbSection({ section, search }) {
  const query = search.trim().toLowerCase();
  const verbs = section.entries.filter((verb) => {
    if (!query) {
      return true;
    }

    return [
      verb.infinitive,
      verb.english,
      verb.pattern,
      verb.participle,
      ...Object.keys(verb.conjugations),
      ...Object.values(verb.conjugations),
      ...(verb.examples ?? []).flatMap((example) => [example.french, example.english]),
    ]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-accentSoft px-3 py-1 text-sm font-semibold text-accent">
            {section.label}
          </span>
          <span className="text-sm text-stone-600">{section.description}</span>
          <span className="ml-auto text-xs font-medium uppercase tracking-[0.16em] text-stone-400">
            {verbs.length} {verbs.length === 1 ? "verb" : "verbs"}
          </span>
        </div>
      </section>

      {verbs.length === 0 ? (
        <section className="rounded-3xl border bg-white p-8 text-sm text-stone-600 shadow-card">
          No matches in this section.
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          {verbs.map((verb) => (
            <article key={verb.infinitive} className="rounded-3xl border bg-white p-5 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold text-stone-900">{verb.infinitive}</h2>
                  <p className="mt-1 text-base text-stone-700">{verb.english}</p>
                </div>
                <span className="rounded-full border border-stone-300 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-stone-600">
                  {verb.pattern}
                </span>
              </div>

              <div className="mt-4 rounded-2xl bg-stone-50 px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                  Past participle
                </div>
                <div className="mt-1 text-base font-semibold text-stone-900">{verb.participle}</div>
              </div>

              <div className="mt-5 overflow-hidden rounded-2xl border border-stone-200">
                <table className="min-w-full border-collapse text-sm">
                  <thead className="bg-stone-100 text-xs font-semibold uppercase tracking-[0.16em] text-stone-600">
                    <tr>
                      <th scope="col" className="px-3 py-2 text-left">
                        Subject
                      </th>
                      <th scope="col" className="px-3 py-2 text-left">
                        Present tense
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(verb.conjugations).map(([subject, form]) => (
                      <tr key={`${verb.infinitive}-${subject}`} className="border-t border-stone-200">
                        <th scope="row" className="bg-white px-3 py-3 text-left font-semibold text-stone-600">
                          {subject}
                        </th>
                        <td className="bg-white px-3 py-3 font-medium text-stone-900">{form}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {verb.examples?.length ? (
                <div className="mt-4 rounded-2xl bg-stone-50 p-4">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                    Examples
                  </div>
                  <ul className="space-y-2 text-sm text-stone-800">
                    {verb.examples.map((example) => (
                      <li key={`${verb.infinitive}-${example.french}`}>
                        <div className="font-medium text-stone-900">{example.french}</div>
                        <div className="text-stone-600">{example.english}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
