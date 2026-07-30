const form = document.querySelector("#entry-form");
const statusText = document.querySelector("#status");
const workerUrlInput = document.querySelector("#worker-url");
const dateInput = form.elements.date;

const savedWorkerUrl = localStorage.getItem("dataJournalWorkerUrl");
if (savedWorkerUrl) workerUrlInput.value = savedWorkerUrl;
dateInput.valueAsDate = new Date();

function setStatus(message, type = "") {
  statusText.textContent = message;
  statusText.className = `status ${type}`.trim();
}

function formValue(name) {
  return form.elements[name].value.trim();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("Publishing...");

  const submitButton = form.querySelector("button[type='submit']");
  submitButton.disabled = true;

  const workerUrl = formValue("workerUrl").replace(/\/+$/, "");
  localStorage.setItem("dataJournalWorkerUrl", workerUrl);

  const payload = {
    password: formValue("adminPassword"),
    entry: {
      date: formValue("date"),
      courseTopic: formValue("courseTopic"),
      prompt: formValue("prompt"),
      journalEntry: formValue("journalEntry"),
      otherThoughts: formValue("otherThoughts")
    }
  };

  try {
    const response = await fetch(`${workerUrl}/entries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.error || "The entry could not be published.");
    }

    form.elements.prompt.value = "";
    form.elements.journalEntry.value = "";
    form.elements.otherThoughts.value = "";
    setStatus(`Published. Commit: ${result.commitSha.slice(0, 7)}`, "success");
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    submitButton.disabled = false;
  }
});
