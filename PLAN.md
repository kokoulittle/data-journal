# Data Journal Plan

## Goal

Create a GitHub-hosted data journal based on the provided DOCX template. Each entry should preserve the same fields:

- Date
- Course/topic
- Prompt
- Journal Entry
- Other thoughts or questions

## Implementation Plan

1. Create a lightweight static website that can be hosted directly with GitHub Pages.
2. Store journal content in `entries/entries.json` so entries are easy to edit without changing layout code.
3. Keep a reusable Markdown template in `entries/entry-template.md` for drafting new reflections.
4. Style the site for reading: clear metadata, prominent prompts, and separated reflection sections.
5. Publish the repository through GitHub Pages from the `main` branch.

## How to Add a New Entry

1. Copy the fields from `entries/entry-template.md`.
2. Write the entry.
3. Add the finished entry as a new object in `entries/entries.json`.
4. Commit and push the change to GitHub.

## GitHub Hosting Steps

1. Create a new GitHub repository named `data-journal`.
2. Push this local folder to that repository.
3. In GitHub, open the repository settings.
4. Go to Pages.
5. Set the source to `Deploy from a branch`.
6. Choose the `main` branch and `/root` folder.
7. Save and wait for GitHub Pages to publish the site.

## Suggested Repository Commands

```bash
cd ~/data-journal
git init
git add .
git commit -m "Create data journal site"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/data-journal.git
git push -u origin main
```
