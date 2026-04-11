#!/usr/bin/env node
/**
 * GitHub Actions helpers: post to Slack based on workflow events.
 *
 * Commands (set GITHUB_EVENT_PATH, GITHUB_REPOSITORY, GITHUB_TOKEN, SLACK_BOT_TOKEN):
 *   node scripts/slack-github-notifications.mjs cloudflare-pr-preview
 *   node scripts/slack-github-notifications.mjs main-merge
 */

import { readFile } from "node:fs/promises";

const commands = new Set(["cloudflare-pr-preview", "main-merge"]);

function usage() {
  console.error(
    `Usage: node scripts/slack-github-notifications.mjs <${[...commands].join(" | ")}>`,
  );
  process.exit(2);
}

function requireEnv(name) {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing required env: ${name}`);
    process.exit(1);
  }
  return v;
}

async function loadEvent() {
  const path = process.env.GITHUB_EVENT_PATH;
  if (!path) {
    console.error("Missing GITHUB_EVENT_PATH");
    process.exit(1);
  }
  const raw = await readFile(path, "utf8");
  return JSON.parse(raw);
}

async function githubApi(path, token) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }
  if (!res.ok) {
    throw new Error(`GitHub API ${path}: ${res.status} ${data.message || text}`);
  }
  return data;
}

function extractPreviewUrls(commentBody) {
  const commitHref = [
    ...commentBody.matchAll(/href=(['"])(https?:\/\/[^'"]+)\1[^>]*>\s*Commit Preview URL/gi),
  ];
  const branchHref = [
    ...commentBody.matchAll(/href=(['"])(https?:\/\/[^'"]+)\1[^>]*>\s*Branch Preview URL/gi),
  ];
  const commitPreview = commitHref.length ? commitHref[commitHref.length - 1][2] : null;
  const branchPreview = branchHref.length ? branchHref[branchHref.length - 1][2] : null;
  return { commitPreview, branchPreview };
}

function pickSlackPermalink(commitMessage) {
  const candidates = [
    ...commitMessage.matchAll(/https:\/\/[\w-]+\.slack\.com\/archives\/[A-Z0-9]+\/[^\s)>'"]+/gi),
  ].map((m) => m[0]);
  return (
    candidates.find((u) => u.includes("thread_ts=")) ||
    candidates.find((u) => u.includes("/p")) ||
    candidates[candidates.length - 1] ||
    null
  );
}

function slackChannelAndThreadTs(slackUrl) {
  const trimmed = slackUrl.replace(/[),.;]+$/, "");
  const channelMatch = trimmed.match(/\/archives\/([A-Z0-9]+)\//i);
  if (!channelMatch) {
    throw new Error(`Could not parse Slack channel from URL: ${trimmed}`);
  }
  const channel = channelMatch[1];

  let thread_ts = null;
  const tsParam = trimmed.match(/[?&]thread_ts=([^&]+)/);
  if (tsParam) {
    thread_ts = decodeURIComponent(tsParam[1]);
  } else {
    const pMatch = trimmed.match(/\/p(\d+)/);
    if (pMatch) {
      const digits = pMatch[1];
      if (digits.length >= 7) {
        thread_ts = `${digits.slice(0, -6)}.${digits.slice(-6)}`;
      }
    }
  }
  if (!thread_ts) {
    throw new Error(
      `Could not derive thread_ts from Slack URL (prefer a permalink with thread_ts=): ${trimmed}`,
    );
  }
  return { channel, thread_ts };
}

async function slackPostMessage(payload) {
  const token = requireEnv("SLACK_BOT_TOKEN");
  const res = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!json.ok) {
    throw new Error(`Slack API error: ${json.error || res.status}`);
  }
  return json;
}

async function runCloudflarePrPreview() {
  const token = requireEnv("GITHUB_TOKEN");
  const event = await loadEvent();
  const body = event.comment?.body || "";
  const { commitPreview, branchPreview } = extractPreviewUrls(body);
  if (!commitPreview && !branchPreview) {
    console.log("No preview URLs found in comment; skipping");
    return;
  }

  const pull_number = event.issue?.number;
  if (!pull_number) {
    console.error("Missing issue number in event");
    process.exit(1);
  }

  const [owner, repo] = requireEnv("GITHUB_REPOSITORY").split("/");
  const pr = await githubApi(`/repos/${owner}/${repo}/pulls/${pull_number}`, token);
  const sha = pr.head.sha;
  const commitRes = await githubApi(`/repos/${owner}/${repo}/commits/${sha}`, token);
  const message = commitRes.commit?.message || "";

  const slackUrl = pickSlackPermalink(message);
  if (!slackUrl) {
    console.error(
      "No Slack permalink found in head commit message; add: Related Slack thread: <permalink>",
    );
    process.exit(1);
  }

  const { channel, thread_ts } = slackChannelAndThreadTs(slackUrl);

  const lines = [
    "*Cloudflare preview is ready*",
    pr.html_url ? `PR: ${pr.html_url}` : null,
    commitPreview ? `Commit preview: ${commitPreview}` : null,
    branchPreview ? `Branch preview: ${branchPreview}` : null,
  ].filter(Boolean);
  const text = lines.join("\n");

  await slackPostMessage({
    channel,
    thread_ts,
    text,
    unfurl_links: true,
    unfurl_media: false,
  });
  console.log(`Posted preview links to Slack channel ${channel} thread ${thread_ts}`);
}

function firstLine(msg) {
  return (msg || "").split("\n")[0].trim() || "(no message)";
}

async function runMainMerge() {
  const token = requireEnv("GITHUB_TOKEN");
  const event = await loadEvent();
  if (event.ref !== "refs/heads/main") {
    console.log(`Skipping: ref is ${event.ref}`);
    return;
  }

  const [owner, repo] = requireEnv("GITHUB_REPOSITORY").split("/");
  const before = event.before;
  const after = event.after;
  if (!after) {
    console.error("Missing after SHA");
    process.exit(1);
  }

  let commits = [];
  if (before && /^0+$/.test(before)) {
    const c = await githubApi(`/repos/${owner}/${repo}/commits?sha=${after}&per_page=20`, token);
    commits = Array.isArray(c) ? c : [];
  } else if (before) {
    const compare = await githubApi(
      `/repos/${owner}/${repo}/compare/${before}...${after}`,
      token,
    );
    commits = compare.commits || [];
  } else {
    const single = await githubApi(`/repos/${owner}/${repo}/commits/${after}`, token);
    commits = single ? [single] : [];
  }

  const siteUrl =
    process.env.PRODUCTION_SITE_URL?.trim() || "https://alpsconference.com";
  const channel = process.env.SLACK_BOTS_CHANNEL?.trim() || "#bots";

  const maxBullets = 12;
  const shown = commits.slice(-maxBullets);
  const omitted = commits.length - shown.length;
  const bullets = shown
    .map((c) => {
      const line = firstLine(c.commit?.message);
      const shaShort = (c.sha || "").slice(0, 7);
      return `• \`${shaShort}\` ${line}`;
    })
    .join("\n");

  let summaryBody =
    `*ALPS Conference site*\nMerged to \`main\` — production should update shortly.\n\n*What shipped*\n`;
  if (commits.length === 0) {
    summaryBody += "_No commits listed for this push._\n";
  } else {
    summaryBody += bullets || "_No commit messages._\n";
    if (omitted > 0) {
      summaryBody += `\n_…and ${omitted} more commit(s)._`;
    }
  }

  const textFallback = `ALPS Conference: merged to main. Visit ${siteUrl}`;

  await slackPostMessage({
    channel,
    text: textFallback,
    blocks: [
      {
        type: "section",
        text: { type: "mrkdwn", text: summaryBody },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "Visit", emoji: true },
            url: siteUrl,
            action_id: "visit_production_site",
          },
        ],
      },
    ],
    unfurl_links: true,
    unfurl_media: false,
  });
  console.log(`Posted main merge summary to ${channel}`);
}

const cmd = process.argv[2];
if (!cmd || !commands.has(cmd)) usage();

try {
  if (cmd === "cloudflare-pr-preview") await runCloudflarePrPreview();
  else if (cmd === "main-merge") await runMainMerge();
} catch (err) {
  console.error(err?.stack || err?.message || err);
  process.exit(1);
}
