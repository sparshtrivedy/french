import { useState } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { TopicSection } from "./components/TopicSection";
import { VerbSection } from "./components/VerbSection";
import { topicSections, verbSections } from "./data";

function App() {
  const [activeView, setActiveView] = useState({ kind: "topic", id: "A1" });
  const [activeTopicEntryId, setActiveTopicEntryId] = useState(
    topicSections[0]?.entries[0]?.id ?? null,
  );
  const [search, setSearch] = useState("");

  const activeSection =
    activeView.kind === "topic"
      ? topicSections.find((section) => section.id === activeView.id)
      : verbSections.find((section) => section.id === activeView.id);

  const activeLabel = !activeSection
    ? "French study"
    : activeView.kind === "topic"
      ? `${activeSection.label} topics`
      : `${activeSection.label} verbs`;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(219,234,254,0.9),_rgba(248,247,244,1)_40%)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 lg:flex-row lg:px-8 lg:py-8">
        <Sidebar
          topicSections={topicSections}
          verbSections={verbSections}
          activeView={activeView}
          activeTopicEntryId={activeTopicEntryId}
          onChangeView={(nextView) => {
            setActiveView(nextView);
            setSearch("");
            if (nextView.kind === "topic") {
              const nextSection = topicSections.find((section) => section.id === nextView.id);
              setActiveTopicEntryId(nextSection?.entries[0]?.id ?? null);
            }
          }}
          onChangeTopicEntry={setActiveTopicEntryId}
        />

        <main className="min-w-0 flex-1 space-y-6">
          <Header search={search} onSearch={setSearch} activeLabel={activeLabel} />

          {activeSection ? (
            activeView.kind === "topic" ? (
              <TopicSection
                section={activeSection}
                search={search}
                selectedTopicId={activeTopicEntryId}
                onSelectTopic={setActiveTopicEntryId}
              />
            ) : (
              <VerbSection section={activeSection} search={search} />
            )
          ) : (
            <section className="rounded-3xl border bg-white p-8 text-sm text-stone-600 shadow-card">
              Section not found.
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
