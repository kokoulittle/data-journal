# Data Journal

A GitHub Pages-ready data journal based on the course journal template.

## Entry Format

Each journal entry includes:

- Date
- Course/topic
- Prompt
- Journal Entry
- Other thoughts or questions

## Edit Entries

Journal entries are stored in [entries/entries.json](entries/entries.json).

Use [entries/entry-template.md](entries/entry-template.md) to draft new entries before adding them to the JSON file.

## Preview Locally

Run:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Publish on GitHub Pages

1. Create a GitHub repository named `data-journal`.
2. Push this folder to the repository.
3. Go to repository Settings > Pages.
4. Select `Deploy from a branch`.
5. Choose `main` and `/root`.
6. Save.
