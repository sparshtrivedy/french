import { useEffect, useRef, useState } from "react";
import { FiVolume2, FiVolumeX } from "react-icons/fi";

const SUBJECTS = ["je", "tu", "il/elle/on", "nous", "vous", "ils/elles"];
const AVOIR_FORMS = {
  je: "ai",
  tu: "as",
  "il/elle/on": "a",
  nous: "avons",
  vous: "avez",
  "ils/elles": "ont",
};
const ALLER_FORMS = {
  je: "vais",
  tu: "vas",
  "il/elle/on": "va",
  nous: "allons",
  vous: "allez",
  "ils/elles": "vont",
};
const ETRE_AUXILIARY_VERBS = new Set([
  "aller",
  "arriver",
  "devenir",
  "descendre",
  "entrer",
  "monter",
  "mourir",
  "naître",
  "partir",
  "rentrer",
  "rester",
  "retourner",
  "revenir",
  "sortir",
  "tomber",
  "venir",
]);

const FRENCH_SUBJECT_OPTIONS = [
  { code: "je", group: "je", pattern: /^(Je|J')/i },
  { code: "tu", group: "tu", pattern: /^Tu/i },
  { code: "il", group: "il/elle/on", pattern: /^Il/i },
  { code: "elle", group: "il/elle/on", pattern: /^Elle/i },
  { code: "on", group: "il/elle/on", pattern: /^On/i },
  { code: "nous", group: "nous", pattern: /^Nous/i },
  { code: "vous", group: "vous", pattern: /^Vous/i },
  { code: "ils", group: "ils/elles", pattern: /^Ils/i },
  { code: "elles", group: "ils/elles", pattern: /^Elles/i },
];
const ENGLISH_SUBJECT_OPTIONS = [
  { code: "je", group: "je", pattern: /^I\b/i },
  { code: "tu", group: "tu", pattern: /^You\b/i },
  { code: "il", group: "il/elle/on", pattern: /^He\b/i },
  { code: "elle", group: "il/elle/on", pattern: /^She\b/i },
  { code: "on", group: "il/elle/on", pattern: /^One\b/i },
  { code: "nous", group: "nous", pattern: /^We\b/i },
  { code: "vous", group: "vous", pattern: /^You\b/i },
  { code: "ils", group: "ils/elles", pattern: /^They\b/i },
  { code: "elles", group: "ils/elles", pattern: /^They\b/i },
];
const ENGLISH_PAST_FORMS = {
  "to be": "was",
  "to have": "had",
  "to become": "became",
  "to go": "went",
  "to do/make": "did",
  "to come back / to return": "came back",
  "can/to be able to": "was able to",
  "to learn": "learned",
  "to take": "took",
  "to say/tell": "said",
  "to read": "read",
  "to see": "saw",
  "to drink": "drank",
  "to write": "wrote",
  "to run": "ran",
  "to put": "put",
  "to go out/leave": "went out",
  "to come": "came",
  "to leave": "left",
  "to understand": "understood",
  "to know": "knew",
  "to have to / must": "had to",
  "to drive": "drove",
  "to remember": "remembered",
  "to get up": "got up",
  "to go to bed": "went to bed",
  "to get dressed": "got dressed",
};
const EXAMPLE_FRAMES = {
  "passe-compose": {
    french: ["Hier, ", "La semaine dernière, "],
    english: ["Yesterday, ", "Last week, "],
  },
  "futur-proche": {
    french: ["Demain, ", "Ce week-end, "],
    english: ["Tomorrow, ", "This weekend, "],
  },
};

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function startsWithVowelSound(value) {
  return /^[aeiouhàâæéèêëîïôœùûü]/i.test(value);
}

function isReflexiveVerb(verb) {
  return /^s['e]\s?/i.test(verb.infinitive);
}

function getVerbBaseInfinitive(verb) {
  return verb.infinitive.replace(/^s['e]\s*/i, "");
}

function getReflexivePronoun(subject) {
  return {
    je: "me",
    tu: "te",
    "il/elle/on": "se",
    nous: "nous",
    vous: "vous",
    "ils/elles": "se",
  }[subject];
}

function formatSubjectText(subjectCode, nextWord) {
  if (subjectCode === "je") {
    return startsWithVowelSound(nextWord) ? "J'" : "Je";
  }

  return (
    {
      tu: "Tu",
      il: "Il",
      elle: "Elle",
      on: "On",
      nous: "Nous",
      vous: "Vous",
      ils: "Ils",
      elles: "Elles",
    }[subjectCode] ?? null
  );
}

function formatReflexiveChunk(subject, nextWord) {
  const pronoun = getReflexivePronoun(subject);

  if (["me", "te", "se"].includes(pronoun) && startsWithVowelSound(nextWord)) {
    return `${pronoun.slice(0, 1)}'`;
  }

  return `${pronoun} `;
}

function usesEtre(verb) {
  return isReflexiveVerb(verb) || ETRE_AUXILIARY_VERBS.has(verb.infinitive);
}

function getPasseComposeForm(subject, verb) {
  if (!usesEtre(verb)) {
    return `${AVOIR_FORMS[subject]} ${verb.participle}`;
  }

  const auxiliary = {
    je: "suis",
    tu: "es",
    "il/elle/on": "est",
    nous: "sommes",
    vous: "êtes",
    "ils/elles": "sont",
  }[subject];

  const agreedParticiple = {
    je: `${verb.participle}(e)`,
    tu: `${verb.participle}(e)`,
    "il/elle/on": `${verb.participle}(e)`,
    nous: `${verb.participle}(e)s`,
    vous: `${verb.participle}(e)(s)`,
    "ils/elles": `${verb.participle}(e)s`,
  }[subject];

  if (isReflexiveVerb(verb)) {
    return `${formatReflexiveChunk(subject, auxiliary)}${auxiliary} ${agreedParticiple}`;
  }

  return `${auxiliary} ${agreedParticiple}`;
}

function getConjugationRows(verb, tense) {
  if (tense === "present") {
    return SUBJECTS.map((subject) => [subject, verb.conjugations[subject]]);
  }

  if (tense === "passe-compose") {
    return SUBJECTS.map((subject) => [subject, getPasseComposeForm(subject, verb)]);
  }

  return SUBJECTS.map((subject) => {
    if (isReflexiveVerb(verb)) {
      const infinitive = getVerbBaseInfinitive(verb);
      return [
        subject,
        `${ALLER_FORMS[subject]} ${formatReflexiveChunk(subject, infinitive)}${infinitive}`,
      ];
    }

    return [subject, `${ALLER_FORMS[subject]} ${verb.infinitive}`];
  });
}

function detectFrenchExampleMeta(sentence, verb) {
  for (const option of FRENCH_SUBJECT_OPTIONS) {
    const subjectMatch = sentence.match(option.pattern);

    if (!subjectMatch) {
      continue;
    }

    const subjectText = subjectMatch[0];
    const remainder = sentence.slice(subjectText.length).trimStart();
    const conjugation = verb.conjugations[option.group];
    const match = remainder.match(new RegExp(`^${escapeRegex(conjugation)}(.*)$`, "i"));

    if (!match) {
      continue;
    }

    return {
      subjectCode: option.code,
      subjectGroup: option.group,
      subjectText,
      rest: match[1] ?? "",
    };
  }

  const thirdPersonOptions = [
    { subjectCode: "ils", subjectGroup: "ils/elles" },
    { subjectCode: "il", subjectGroup: "il/elle/on" },
  ];

  for (const option of thirdPersonOptions) {
    const conjugation = verb.conjugations[option.subjectGroup];
    const match = sentence.match(new RegExp(`^(.+?)\\s+${escapeRegex(conjugation)}(.*)$`, "i"));

    if (!match) {
      continue;
    }

    return {
      subjectCode: option.subjectCode,
      subjectGroup: option.subjectGroup,
      subjectText: match[1],
      rest: match[2] ?? "",
    };
  }

  return null;
}

function buildFrenchVerbPhrase(meta, verb, tense) {
  if (tense === "present") {
    return verb.conjugations[meta.subjectGroup];
  }

  if (tense === "passe-compose") {
    return getPasseComposeForm(meta.subjectGroup, verb);
  }

  if (isReflexiveVerb(verb)) {
    const infinitive = getVerbBaseInfinitive(verb);
    return `${ALLER_FORMS[meta.subjectGroup]} ${formatReflexiveChunk(meta.subjectGroup, infinitive)}${infinitive}`;
  }

  return `${ALLER_FORMS[meta.subjectGroup]} ${verb.infinitive}`;
}

function buildFrenchExample(example, verb, tense, frame) {
  if (tense === "present") {
    return example.french;
  }

  const meta = detectFrenchExampleMeta(example.french, verb);

  if (!meta) {
    return example.french;
  }

  const verbPhrase = buildFrenchVerbPhrase(meta, verb, tense);
  const subjectText = formatSubjectText(meta.subjectCode, verbPhrase) ?? meta.subjectText;
  const spacer = subjectText.endsWith("'") ? "" : " ";

  return `${frame}${subjectText}${spacer}${verbPhrase}${meta.rest}`;
}

function getEnglishBasePhrase(verb) {
  const overrides = {
    "to be": "be",
    "to like/love": "like",
    "to do/make": "do",
    "to say/tell": "say",
    "can/to be able to": "be able to",
  };

  if (overrides[verb.english]) {
    return overrides[verb.english];
  }

  return verb.english.split("/")[0].trim().replace(/^to\s+/i, "");
}

function inflectEnglishThirdPerson(basePhrase) {
  const [firstWord, ...rest] = basePhrase.split(" ");

  const irregular = {
    be: "is",
    have: "has",
    do: "does",
    go: "goes",
  }[firstWord];

  if (irregular) {
    return [irregular, ...rest].join(" ");
  }

  if (/(s|x|z|ch|sh|o)$/i.test(firstWord)) {
    return [`${firstWord}es`, ...rest].join(" ");
  }

  if (/[^aeiou]y$/i.test(firstWord)) {
    return [`${firstWord.slice(0, -1)}ies`, ...rest].join(" ");
  }

  return [`${firstWord}s`, ...rest].join(" ");
}

function toEnglishGerund(basePhrase) {
  const [firstWord, ...rest] = basePhrase.split(" ");

  const irregular = {
    be: "being",
    have: "having",
    lie: "lying",
  }[firstWord];

  if (irregular) {
    return [irregular, ...rest].join(" ");
  }

  if (/ie$/i.test(firstWord)) {
    return [`${firstWord.slice(0, -2)}ying`, ...rest].join(" ");
  }

  if (/[^aeiou]e$/i.test(firstWord)) {
    return [`${firstWord.slice(0, -1)}ing`, ...rest].join(" ");
  }

  return [`${firstWord}ing`, ...rest].join(" ");
}

function getEnglishPresentVariants(basePhrase, subjectGroup) {
  if (basePhrase === "be") {
    return {
      je: ["am"],
      tu: ["are"],
      "il/elle/on": ["is"],
      nous: ["are"],
      vous: ["are"],
      "ils/elles": ["are"],
    }[subjectGroup];
  }

  const variants = [basePhrase];

  if (subjectGroup === "il/elle/on") {
    variants.push(inflectEnglishThirdPerson(basePhrase));
  }

  const progressivePrefix =
    {
      je: "am",
      tu: "are",
      "il/elle/on": "is",
      nous: "are",
      vous: "are",
      "ils/elles": "are",
    }[subjectGroup] ?? "is";

  variants.push(`${progressivePrefix} ${toEnglishGerund(basePhrase)}`);
  return variants;
}

function detectEnglishExampleMeta(sentence, verb, frenchMeta) {
  const basePhrase = getEnglishBasePhrase(verb);

  for (const option of ENGLISH_SUBJECT_OPTIONS) {
    const subjectMatch = sentence.match(option.pattern);

    if (!subjectMatch) {
      continue;
    }

    const subjectText = subjectMatch[0];
    const remainder = sentence.slice(subjectText.length).trimStart();

    for (const variant of getEnglishPresentVariants(basePhrase, option.group)) {
      const match = remainder.match(new RegExp(`^${escapeRegex(variant)}(.*)$`, "i"));

      if (match) {
        return {
          subjectCode: option.code,
          subjectGroup: option.group,
          subjectText,
          rest: match[1] ?? "",
        };
      }
    }
  }

  const guessGroup = frenchMeta?.subjectGroup ?? "il/elle/on";
  const nounMatch = sentence.match(new RegExp(`^(.+?)\\s+${escapeRegex(inflectEnglishThirdPerson(basePhrase))}(.*)$`, "i"));

  if (nounMatch && guessGroup === "il/elle/on") {
    return {
      subjectCode: "il",
      subjectGroup: "il/elle/on",
      subjectText: nounMatch[1],
      rest: nounMatch[2] ?? "",
    };
  }

  const pluralNounMatch = sentence.match(new RegExp(`^(.+?)\\s+${escapeRegex(basePhrase)}(.*)$`, "i"));

  if (pluralNounMatch && guessGroup === "ils/elles") {
    return {
      subjectCode: "ils",
      subjectGroup: "ils/elles",
      subjectText: pluralNounMatch[1],
      rest: pluralNounMatch[2] ?? "",
    };
  }

  return null;
}

function getEnglishPastPhrase(subjectGroup, verb) {
  const basePhrase = getEnglishBasePhrase(verb);

  if (verb.english === "to be") {
    return ["nous", "vous", "ils/elles"].includes(subjectGroup) ? "were" : "was";
  }

  if (ENGLISH_PAST_FORMS[verb.english]) {
    return ENGLISH_PAST_FORMS[verb.english];
  }

  const [firstWord, ...rest] = basePhrase.split(" ");

  if (/[^aeiou]y$/i.test(firstWord)) {
    return [`${firstWord.slice(0, -1)}ied`, ...rest].join(" ");
  }

  if (/e$/i.test(firstWord)) {
    return [`${firstWord}d`, ...rest].join(" ");
  }

  return [`${firstWord}ed`, ...rest].join(" ");
}

function getEnglishFuturePhrase(subjectGroup, verb) {
  const basePhrase = getEnglishBasePhrase(verb);
  const auxiliary =
    {
      je: "am",
      tu: "are",
      "il/elle/on": "is",
      nous: "are",
      vous: "are",
      "ils/elles": "are",
    }[subjectGroup] ?? "is";

  return `${auxiliary} going to ${basePhrase}`;
}

function buildEnglishExample(example, verb, tense, frame) {
  if (tense === "present") {
    return example.english;
  }

  const frenchMeta = detectFrenchExampleMeta(example.french, verb);
  const meta = detectEnglishExampleMeta(example.english, verb, frenchMeta);

  if (!meta) {
    return example.english;
  }

  const verbPhrase =
    tense === "passe-compose"
      ? getEnglishPastPhrase(meta.subjectGroup, verb)
      : getEnglishFuturePhrase(meta.subjectGroup, verb);

  return `${frame}${meta.subjectText} ${verbPhrase}${meta.rest}`;
}

function getRenderedExamples(verb, tense) {
  if (tense !== "present") {
    return verb.examplesByTense?.[tense] ?? [];
  }

  return (verb.examples ?? []).map((example, index) => ({
    french: buildFrenchExample(
      example,
      verb,
      tense,
      EXAMPLE_FRAMES[tense]?.french[index] ?? EXAMPLE_FRAMES[tense]?.french[0],
    ),
    english: buildEnglishExample(
      example,
      verb,
      tense,
      EXAMPLE_FRAMES[tense]?.english[index] ?? EXAMPLE_FRAMES[tense]?.english[0],
    ),
  }));
}

function useFrenchSpeech() {
  const [speechState, setSpeechState] = useState({
    supported: false,
    activeText: null,
    hasFrenchVoice: false,
  });
  const activeTextRef = useRef(null);
  const voiceRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    const synth = window.speechSynthesis;

    const syncVoices = () => {
      const voices = synth.getVoices();
      const frenchVoice =
        voices.find((voice) => voice.lang?.toLowerCase().startsWith("fr")) ?? null;

      voiceRef.current = frenchVoice;
      setSpeechState((current) => ({
        ...current,
        supported: true,
        hasFrenchVoice: Boolean(frenchVoice),
      }));
    };

    syncVoices();
    synth.addEventListener?.("voiceschanged", syncVoices);

    return () => {
      synth.cancel();
      synth.removeEventListener?.("voiceschanged", syncVoices);
    };
  }, []);

  function stop() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();
    activeTextRef.current = null;
    setSpeechState((current) => ({ ...current, activeText: null }));
  }

  function speak(text) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    if (activeTextRef.current === text) {
      stop();
      return;
    }

    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utterance.rate = 0.95;

    if (voiceRef.current) {
      utterance.voice = voiceRef.current;
    }

    utterance.onstart = () => {
      activeTextRef.current = text;
      setSpeechState((current) => ({ ...current, activeText: text }));
    };

    utterance.onend = utterance.onerror = () => {
      activeTextRef.current = null;
      setSpeechState((current) => ({ ...current, activeText: null }));
    };

    synth.speak(utterance);
  }

  return {
    ...speechState,
    speak,
    stop,
  };
}

function PronunciationButton({ text, label, activeText, onSpeak, disabled = false }) {
  const isActive = activeText === text;
  const Icon = isActive ? FiVolumeX : FiVolume2;

  return (
    <button
      type="button"
      onClick={() => onSpeak(text)}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={[
        "inline-flex h-9 w-9 items-center justify-center rounded-full border transition",
        disabled
          ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400"
          : isActive
            ? "border-accent bg-accent text-white"
            : "border-stone-300 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-50",
      ].join(" ")}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function VerbCard({ verb, speech }) {
  const [activeTense, setActiveTense] = useState("present");

  const tenseOptions = [
    { id: "present", label: "Present" },
    { id: "passe-compose", label: "Passé composé" },
    { id: "futur-proche", label: "Futur proche" },
  ];

  const tenseLabel = tenseOptions.find((option) => option.id === activeTense)?.label ?? "Present";
  const rows = getConjugationRows(verb, activeTense);
  const renderedExamples = getRenderedExamples(verb, activeTense);

  return (
    <article key={verb.infinitive} className="rounded-3xl border bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-stone-900">{verb.infinitive}</h2>
            <PronunciationButton
              text={verb.infinitive}
              label={`Pronounce ${verb.infinitive}`}
              activeText={speech.activeText}
              onSpeak={speech.speak}
              disabled={!speech.supported}
            />
          </div>
          <p className="mt-1 text-base text-stone-700">{verb.english}</p>
        </div>
        <span className="rounded-full border border-stone-300 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-stone-600">
          {verb.pattern}
        </span>
      </div>

      <div className="mt-4 rounded-2xl bg-stone-50 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
            Past participle
          </div>
          <PronunciationButton
            text={verb.participle}
            label={`Pronounce ${verb.participle}`}
            activeText={speech.activeText}
            onSpeak={speech.speak}
            disabled={!speech.supported}
          />
        </div>
        <div className="mt-1 text-base font-semibold text-stone-900">{verb.participle}</div>
      </div>

      <div className="mt-4">
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {tenseOptions.map((option) => {
            const isActive = option.id === activeTense;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setActiveTense(option.id)}
                className={[
                  "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition",
                  isActive
                    ? "border-stone-900 bg-stone-900 text-white"
                    : "border-stone-300 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-50",
                ].join(" ")}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="overflow-hidden rounded-2xl border border-stone-200">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-stone-100 text-xs font-semibold uppercase tracking-[0.16em] text-stone-600">
              <tr>
                <th scope="col" className="px-3 py-2 text-left">
                  Subject
                </th>
                <th scope="col" className="px-3 py-2 text-left">
                  {tenseLabel}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([subject, form]) => (
                <tr key={`${verb.infinitive}-${activeTense}-${subject}`} className="border-t border-stone-200">
                  <th scope="row" className="bg-white px-3 py-3 text-left font-semibold text-stone-600">
                    {subject}
                  </th>
                  <td className="bg-white px-3 py-3 font-medium text-stone-900">{form}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {activeTense === "passe-compose" && usesEtre(verb) ? (
        <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Uses <span className="font-semibold">être</span> as the auxiliary. Agreement markers are shown in
          shorthand with parentheses.
        </div>
      ) : null}

      {renderedExamples.length ? (
        <div className="mt-4 rounded-2xl bg-stone-50 p-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
            Examples
          </div>
          <ul className="space-y-2 text-sm text-stone-800">
            {renderedExamples.map((example) => (
              <li key={`${verb.infinitive}-${activeTense}-${example.french}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="font-medium text-stone-900">{example.french}</div>
                  <PronunciationButton
                    text={example.french}
                    label={`Pronounce example: ${example.french}`}
                    activeText={speech.activeText}
                    onSpeak={speech.speak}
                    disabled={!speech.supported}
                  />
                </div>
                <div className="text-stone-600">{example.english}</div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}

export function VerbSection({ section, search }) {
  const speech = useFrenchSpeech();
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
          {speech.supported ? (
            <span className="rounded-full border border-stone-300 px-3 py-1 text-xs text-stone-600">
              {speech.hasFrenchVoice ? "French voice ready" : "Using browser voice"}
            </span>
          ) : (
            <span className="rounded-full border border-stone-300 px-3 py-1 text-xs text-stone-500">
              Speech unavailable
            </span>
          )}
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
            <VerbCard key={verb.infinitive} verb={verb} speech={speech} />
          ))}
        </section>
      )}
    </div>
  );
}
