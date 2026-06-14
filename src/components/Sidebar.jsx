import { useEffect, useRef, useState } from "react";
import { FiChevronRight } from "react-icons/fi";

function Caret({ isOpen }) {
  return (
    <FiChevronRight
      aria-hidden="true"
      className={[
        "h-4 w-4 shrink-0 text-stone-600 transition-transform duration-150",
        isOpen ? "rotate-90" : "",
      ].join(" ")}
    />
  );
}

export function Sidebar({
  topicSections,
  verbSections,
  activeView,
  activeTopicEntryId,
  onChangeView,
  onChangeTopicEntry,
}) {
  const [expandedTopicSections, setExpandedTopicSections] = useState(() =>
    Object.fromEntries(topicSections.map((section) => [section.id, section.id === "A1"])),
  );
  const [verbsOpen, setVerbsOpen] = useState(true);
  const previousActiveTopicId = useRef(activeView.kind === "topic" ? activeView.id : null);

  useEffect(() => {
    if (activeView.kind !== "topic") {
      return;
    }

    if (previousActiveTopicId.current === activeView.id) {
      return;
    }

    setExpandedTopicSections((current) => ({
      ...current,
      [activeView.id]: true,
    }));
    previousActiveTopicId.current = activeView.id;
  }, [activeView.id, activeView.kind]);

  return (
    <aside className="w-full shrink-0 rounded-3xl border bg-white p-3 shadow-card lg:w-72">
      <div className="mb-4 px-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
          Browse
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
            Levels
          </div>

          <div className="space-y-1">
            {topicSections.map((section) => {
              const isActive = activeView.kind === "topic" && activeView.id === section.id;
              const isOpen = expandedTopicSections[section.id] ?? false;

              return (
                <div key={section.id} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      onChangeView({ kind: "topic", id: section.id });
                      setExpandedTopicSections((current) => ({
                        ...current,
                        [section.id]: !isOpen,
                      }));
                    }}
                    className={[
                      "flex w-full items-center rounded-xl px-1 text-left",
                      isActive ? "bg-accentSoft" : "hover:bg-stone-100",
                    ].join(" ")}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-l-xl">
                      <Caret isOpen={isOpen} />
                    </span>

                    <span className="min-w-0 flex-1 rounded-r-xl px-1 py-2">
                      <div
                        className={[
                          "text-sm font-medium",
                          isActive ? "text-accent" : "text-stone-800",
                        ].join(" ")}
                      >
                        {section.label}
                      </div>
                      <div className="truncate text-xs text-stone-500">{section.description}</div>
                    </span>
                  </button>

                  {isOpen ? (
                    <div className="ml-6 mt-1 border-l border-stone-200 pl-3">
                      {section.entries.map((entry) => {
                        const isTopicActive =
                          isActive && activeTopicEntryId === entry.id;

                        return (
                          <button
                            key={entry.id}
                            type="button"
                            onClick={() => {
                              onChangeView({ kind: "topic", id: section.id });
                              onChangeTopicEntry(entry.id);
                            }}
                            className={[
                              "block w-full rounded-lg px-2.5 py-2 text-left text-sm leading-5 transition",
                              isTopicActive
                                ? "bg-white font-medium text-accent"
                                : "text-stone-700 hover:bg-stone-100",
                            ].join(" ")}
                          >
                            <div className="truncate">{entry.title}</div>
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center px-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
            <button
              type="button"
              onClick={() => setVerbsOpen((current) => !current)}
              className="-ml-1 mr-1 inline-flex h-5 w-5 items-center justify-center"
              aria-label={verbsOpen ? "Collapse verb groups" : "Expand verb groups"}
            >
              <Caret isOpen={verbsOpen} />
            </button>
            Verb Groups
          </div>

          {verbsOpen ? (
            <div className="space-y-1">
              {verbSections.map((section) => {
                const isActive = activeView.kind === "verb" && activeView.id === section.id;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => onChangeView({ kind: "verb", id: section.id })}
                    className={[
                      "block w-full rounded-xl px-3 py-2.5 text-left transition",
                      isActive
                        ? "bg-accentSoft text-accent"
                        : "text-stone-800 hover:bg-stone-100",
                    ].join(" ")}
                  >
                    <div className="text-sm font-medium">{section.label}</div>
                    <div className="text-xs text-stone-500">{section.description}</div>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
