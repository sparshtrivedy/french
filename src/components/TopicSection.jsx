import { useEffect, useMemo, useState } from "react";

function groupItemsBySubheading(items) {
  const groups = [];

  for (const item of items) {
    const subheading = item.subheading ?? "General";
    const lastGroup = groups[groups.length - 1];

    if (lastGroup && lastGroup.subheading === subheading) {
      lastGroup.items.push(item);
      continue;
    }

    groups.push({ subheading, items: [item] });
  }

  return groups;
}

function isTenseTopic(topic) {
  const signature = `${topic.id} ${topic.title}`.toLowerCase();

  return /(present tense|pass[eé] compos[eé]|imparfait|futur|pass[eé] r[eé]cent)/.test(signature);
}

function TopicTabs({ topics, selectedTopicId, onSelectTopic, tone = "default" }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {topics.map((topic) => {
        const isActive = topic.id === selectedTopicId;

        return (
          <button
            key={topic.id}
            type="button"
            onClick={() => onSelectTopic(topic.id)}
            className={[
              "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition",
              tone === "accent"
                ? isActive
                  ? "border-accent bg-accent text-white"
                  : "border-accent/20 bg-accentSoft text-accent hover:border-accent/40"
                : isActive
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-300 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-50",
            ].join(" ")}
          >
            {topic.title}
          </button>
        );
      })}
    </div>
  );
}

export function TopicSection({ section, search, selectedTopicId, onSelectTopic }) {
  const query = search.trim().toLowerCase();

  const topics = useMemo(
    () =>
      section.entries
        .map((topic) => {
          const items = topic.items.filter((item) => {
            if (!query) {
              return true;
            }

            return [item.french, item.english, item.note]
              .join(" ")
              .toLowerCase()
              .includes(query);
          });

          return { ...topic, items };
        })
        .filter((topic) => topic.items.length > 0 || !query),
    [query, section.entries],
  );

  useEffect(() => {
    if (!topics.length) {
      return;
    }

    if (!selectedTopicId || !topics.some((topic) => topic.id === selectedTopicId)) {
      onSelectTopic(topics[0].id);
    }
  }, [onSelectTopic, selectedTopicId, topics]);

  const selectedIndex = topics.findIndex((topic) => topic.id === selectedTopicId);
  const selectedTopic = selectedIndex >= 0 ? topics[selectedIndex] : null;
  const visibleTopics = query ? topics : selectedTopic ? [selectedTopic] : [];
  const tenseTopics = useMemo(() => topics.filter(isTenseTopic), [topics]);

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border bg-white p-5 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-accentSoft px-3 py-1 text-sm font-semibold text-accent">
              {section.label}
            </span>
            <span className="text-sm text-stone-600">{section.description}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full border border-stone-300 px-3 py-1 text-stone-600">
              {topics.length} topic{topics.length === 1 ? "" : "s"}
            </span>
            {!query && selectedTopic && topics.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => onSelectTopic(topics[selectedIndex - 1]?.id ?? selectedTopic.id)}
                  disabled={selectedIndex <= 0}
                  className="rounded-full border border-stone-300 px-3 py-1 text-stone-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => onSelectTopic(topics[selectedIndex + 1]?.id ?? selectedTopic.id)}
                  disabled={selectedIndex >= topics.length - 1}
                  className="rounded-full border border-stone-300 px-3 py-1 text-stone-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </>
            ) : null}
          </div>
        </div>

        {!query && topics.length > 1 ? (
          <div className="mt-5 space-y-4 border-t border-stone-200 pt-5">
            {tenseTopics.length > 1 ? (
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                  Tense shortcuts
                </div>
                <TopicTabs
                  topics={tenseTopics}
                  selectedTopicId={selectedTopicId}
                  onSelectTopic={onSelectTopic}
                  tone="accent"
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                All topics
              </div>
              <TopicTabs
                topics={topics}
                selectedTopicId={selectedTopicId}
                onSelectTopic={onSelectTopic}
              />
            </div>
          </div>
        ) : null}
      </section>

      {topics.length === 0 ? (
        <section className="rounded-3xl border bg-white p-8 text-sm text-stone-600 shadow-card">
          No matches in this section.
        </section>
      ) : (
        <div className="space-y-5">
          {visibleTopics.map((topic) => (
            <section key={topic.id} className="rounded-3xl border bg-white p-5 shadow-card">
              <div className="mb-4">
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                  {query
                    ? `${topics.findIndex((entry) => entry.id === topic.id) + 1} of ${topics.length}`
                    : `${selectedIndex + 1} of ${topics.length}`}
                </div>
                <h2 className="text-xl font-semibold text-stone-900">{topic.title}</h2>
                <p className="mt-1 text-sm text-stone-600">{topic.summary}</p>
              </div>

              <div className="space-y-5">
                {groupItemsBySubheading(topic.items).map((group) => (
                  <div key={`${topic.id}-${group.subheading}`} className="space-y-3">
                    {group.subheading !== "General" ? (
                      <div className="rounded-2xl bg-stone-100 px-4 py-3">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-700">
                          {group.subheading}
                        </h3>
                      </div>
                    ) : null}

                    <div className="grid gap-3">
                      {group.items.map((item) => (
                        <article
                          key={`${topic.id}-${item.french}`}
                          className="rounded-2xl border border-stone-200 bg-stone-50 p-4"
                        >
                          <div className="grid gap-3 md:grid-cols-[1.1fr_1fr]">
                            <div>
                              <div className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-500">
                                French
                              </div>
                              <div className="mt-1 text-lg font-medium text-stone-900">
                                {item.french}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-500">
                                English
                              </div>
                              <div className="mt-1 text-lg text-stone-800">{item.english}</div>
                            </div>
                          </div>

                          <div className="mt-3 rounded-2xl bg-white px-3 py-2 text-sm text-stone-600">
                            {item.note}
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
