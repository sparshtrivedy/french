# French Study Platform

Small personal study app scaffold built with React and Tailwind.

## What is included

- CEFR topic navigation for `A1`, `A2`, `B1`, `B2`
- Verb navigation for `-er`, `-ir`, and `others`
- Search inside the current section
- Data split into separate JSON files instead of one large file

## Project structure

```text
src/
  components/
  data/
    topics/
      A1.json
      A2.json
      B1.json
      B2.json
    verbs/
      er.json
      ir.json
      others.json
```

## Run

```bash
npm install
npm run dev
```

## Notes

- Edit the JSON files directly to add more study material.
- The UI avoids heavy custom CSS. Most styling is in Tailwind utility classes.
