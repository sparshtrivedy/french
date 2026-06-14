import a1Topics from "./topics/A1.json";
import a2Topics from "./topics/A2.json";
import b1Topics from "./topics/B1.json";
import b2Topics from "./topics/B2.json";
import erVerbs from "./verbs/er.json";
import irVerbs from "./verbs/ir.json";
import otherVerbs from "./verbs/others.json";

export const topicSections = [
  { id: "A1", label: "A1", description: "Basics", entries: a1Topics },
  { id: "A2", label: "A2", description: "Everyday use", entries: a2Topics },
  { id: "B1", label: "B1", description: "Independent use", entries: b1Topics },
  { id: "B2", label: "B2", description: "More complex use", entries: b2Topics },
];

export const verbSections = [
  { id: "er", label: "-er", description: "Regular", entries: erVerbs },
  { id: "ir", label: "-ir", description: "Regular", entries: irVerbs },
  { id: "others", label: "Others", description: "Irregular / mixed", entries: otherVerbs },
];
