const entriesContainer = document.querySelector("#entries");

function section(label, text, className = "") {
  const wrapper = document.createElement("div");
  if (className) wrapper.className = className;

  const heading = document.createElement("p");
  heading.className = "section-label";
  heading.textContent = label;

  const body = document.createElement("p");
  body.textContent = text;

  wrapper.append(heading, body);
  return wrapper;
}

function renderEntries(entries) {
  entriesContainer.replaceChildren();

  entries.forEach((entry) => {
    const article = document.createElement("article");
    article.className = "entry";

    const meta = document.createElement("aside");
    meta.className = "entry-meta";
    meta.append(metaBlock("Date", entry.date), metaBlock("Course/topic", entry.courseTopic));

    const body = document.createElement("div");
    body.className = "entry-body";
    body.append(
      section("Prompt", entry.prompt, "prompt"),
      section("Journal Entry", entry.journalEntry),
      section("Other Thoughts or Questions", entry.otherThoughts)
    );

    article.append(meta, body);
    entriesContainer.append(article);
  });
}

function metaBlock(label, text) {
  const wrapper = document.createElement("div");
  const heading = document.createElement("p");
  heading.className = "meta-label";
  heading.textContent = label;

  const value = document.createElement("p");
  value.className = "meta-value";
  value.textContent = text;

  wrapper.append(heading, value);
  return wrapper;
}

fetch("entries/entries.json")
  .then((response) => {
    if (!response.ok) throw new Error("Unable to load entries.");
    return response.json();
  })
  .then(renderEntries)
  .catch(() => {
    entriesContainer.textContent = "Journal entries could not be loaded.";
  });
