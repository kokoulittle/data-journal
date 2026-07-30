const REPO_OWNER = "kokoulittle";
const REPO_NAME = "data-journal";
const BRANCH = "main";
const ENTRIES_PATH = "entries/entries.json";
const GITHUB_API_VERSION = "2022-11-28";

export default {
  async fetch(request, env) {
    const corsHeaders = getCorsHeaders(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);

    if (url.pathname === "/health" && request.method === "GET") {
      return json({ ok: true }, 200, corsHeaders);
    }

    if (url.pathname === "/entries" && request.method === "POST") {
      if (!isAllowedOrigin(request, env)) {
        return json({ error: "Origin is not allowed." }, 403, corsHeaders);
      }

      return createEntry(request, env, corsHeaders);
    }

    return json({ error: "Not found." }, 404, corsHeaders);
  }
};

async function createEntry(request, env, corsHeaders) {
  if (!env.ADMIN_PASSWORD || !env.GITHUB_TOKEN) {
    return json({ error: "Worker secrets are not configured." }, 500, corsHeaders);
  }

  const payload = await readJson(request);
  if (!payload || payload.password !== env.ADMIN_PASSWORD) {
    return json({ error: "Invalid admin password." }, 401, corsHeaders);
  }

  const entry = normalizeEntry(payload.entry);
  const validationError = validateEntry(entry);
  if (validationError) {
    return json({ error: validationError }, 400, corsHeaders);
  }

  try {
    const update = await appendEntry(env.GITHUB_TOKEN, entry);
    return json(
      {
        ok: true,
        commitSha: update.commit.sha,
        htmlUrl: update.commit.html_url
      },
      201,
      corsHeaders
    );
  } catch (error) {
    return json({ error: error.message }, 502, corsHeaders);
  }
}

async function appendEntry(githubToken, entry) {
  const currentFile = await getEntriesFile(githubToken);
  const entries = parseEntries(currentFile.content);
  entries.push(entry);

  const response = await githubFetch(githubToken, contentUrl(), {
    method: "PUT",
    body: JSON.stringify({
      message: `Add data journal entry for ${entry.date}`,
      content: encodeBase64(JSON.stringify(entries, null, 2) + "\n"),
      sha: currentFile.sha,
      branch: BRANCH,
      committer: {
        name: "Data Journal Bot",
        email: "104101916+kokoulittle@users.noreply.github.com"
      }
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "GitHub rejected the entry update.");
  }

  return response.json();
}

async function getEntriesFile(githubToken) {
  const response = await githubFetch(githubToken, `${contentUrl()}?ref=${BRANCH}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Unable to read entries file from GitHub.");
  }

  const file = await response.json();
  return {
    sha: file.sha,
    content: decodeBase64(file.content || "")
  };
}

function contentUrl() {
  return `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${ENTRIES_PATH}`;
}

function githubFetch(githubToken, url, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${githubToken}`,
      "Content-Type": "application/json",
      "User-Agent": "data-journal-worker",
      "X-GitHub-Api-Version": GITHUB_API_VERSION,
      ...options.headers
    }
  });
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function normalizeEntry(entry = {}) {
  return {
    date: String(entry.date || "").trim(),
    courseTopic: String(entry.courseTopic || "").trim(),
    prompt: String(entry.prompt || "").trim(),
    journalEntry: String(entry.journalEntry || "").trim(),
    otherThoughts: String(entry.otherThoughts || "").trim()
  };
}

function validateEntry(entry) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) return "Date must use YYYY-MM-DD format.";
  if (!entry.courseTopic) return "Course/topic is required.";
  if (!entry.prompt) return "Prompt is required.";
  if (!entry.journalEntry) return "Journal Entry is required.";
  if (!entry.otherThoughts) return "Other thoughts or questions is required.";
  if (entry.courseTopic.length > 160) return "Course/topic is too long.";
  if (entry.prompt.length > 1000) return "Prompt is too long.";
  if (entry.journalEntry.length > 8000) return "Journal Entry is too long.";
  if (entry.otherThoughts.length > 2000) return "Other thoughts or questions is too long.";
  return "";
}

function parseEntries(content) {
  const entries = JSON.parse(content);
  if (!Array.isArray(entries)) {
    throw new Error("entries/entries.json must contain a JSON array.");
  }
  return entries;
}

function decodeBase64(value) {
  const binary = atob(value.replace(/\s/g, ""));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodeBase64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary);
}

function getCorsHeaders(request, env) {
  const origin = request.headers.get("Origin");
  const allowedOrigins = getAllowedOrigins(env);
  const allowOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}

function isAllowedOrigin(request, env) {
  const origin = request.headers.get("Origin");
  return !origin || getAllowedOrigins(env).includes(origin);
}

function getAllowedOrigins(env) {
  return String(env.ALLOWED_ORIGINS || "https://kokoulittle.github.io,http://localhost:8000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function json(data, status, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers
    }
  });
}
