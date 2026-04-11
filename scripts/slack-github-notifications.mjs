#!/usr/bin/env node
/**
 * GitHub Actions helpers: post to Slack based on workflow events.
 *
 * Commands (set GITHUB_EVENT_PATH, GITHUB_REPOSITORY, GITHUB_TOKEN, SLACK_BOT_TOKEN):
 *   node scripts/slack-github-notifications.mjs cloudflare-pr-preview
 *   node scripts/slack-github-notifications.mjs main-merge
 *
 * main-merge expects a completed check_run payload from GitHub Actions (Cloudflare Workers &
 * Pages app on branch main). Optional env: PRODUCTION_SITE_URL, SLACK_BOTS_CHANNEL,
 * CLOUDFLARE_CHECK_NAME_SUBSTR (substring of the check run name; default "Workers Builds").
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
  const slackToken = requireEnv("SLACK_BOT_TOKEN");
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

  // Fetch the original Slack message to get the author
  const historyRes = await fetch(
    `https://slack.com/api/conversations.history?channel=${channel}&latest=${thread_ts}&limit=1&inclusive=true`,
    {
      headers: {
        Authorization: `Bearer ${slackToken}`,
      },
    },
  );
  const historyData = await historyRes.json();
  const author = historyData.messages?.[0]?.user;

  const previewLink = commitPreview || branchPreview;
  const mention = author ? `<@${author}> ` : "";
  const messageText = `${mention}${previewLink}`;

  await slackPostMessage({
    channel,
    thread_ts,
    text: messageText,
    unfurl_links: false,
    unfurl_media: false,
  });
  console.log(`Posted preview links to Slack channel ${channel} thread ${thread_ts}`);
}

function firstLine(msg) {
  return (msg || "").split("\n")[0].trim() || "";
}

function isMergeNoise(line) {
  return /^Merge\b/i.test(line.trim());
}

async function commitsReachableSinceParent(owner, repo, headSha, token) {
  const head = await githubApi(`/repos/${owner}/${repo}/commits/${headSha}`, token);
  const parents = head.parents || [];
  if (!parents.length) return [head];

  const compare = await githubApi(
    `/repos/${owner}/${repo}/compare/${parents[0].sha}...${headSha}`,
    token,
  );
  const list = compare.commits || [];
  return list.length ? list : [head];
}

async function runMainMerge() {
  const token = requireEnv("GITHUB_TOKEN");
  const event = await loadEvent();
  const checkRun = event.check_run;
  if (!checkRun?.head_sha) {
    console.error("Expected check_run payload with head_sha");
    process.exit(1);
  }

  const suiteBranch = checkRun.check_suite?.head_branch;
  if (suiteBranch && suiteBranch !== "main") {
    console.log(`Skipping: suite branch is ${suiteBranch}`);
    return;
  }

  const appSlug = checkRun.app?.slug || "";
  const allowedApps = new Set(["cloudflare-workers-and-pages", "cloudflare-pages"]);
  if (!allowedApps.has(appSlug)) {
    console.log(`Skipping: app slug is ${appSlug || "(missing)"}`);
    return;
  }

  const nameSub =
    process.env.CLOUDFLARE_CHECK_NAME_SUBSTR?.trim() || "Workers Builds";
  if (!String(checkRun.name || "").includes(nameSub)) {
    console.log(`Skipping: check name does not include "${nameSub}"`);
    return;
  }

  const [owner, repo] = requireEnv("GITHUB_REPOSITORY").split("/");
  const headSha = checkRun.head_sha;
  const rawCommits = await commitsReachableSinceParent(owner, repo, headSha, token);

  const lines = rawCommits
    .map((c) => firstLine(c.commit?.message))
    .filter((line) => line && !isMergeNoise(line));

  const maxBullets = 12;
  const shown = lines.slice(-maxBullets);
  const omitted = lines.length - shown.length;

  const bullets = shown.map((line) => `• ${line}`).join("\n");

  const siteUrl =
    process.env.PRODUCTION_SITE_URL?.trim() || "https://alpsconference.com";
  const channel = process.env.SLACK_BOTS_CHANNEL?.trim() || "#bots";

  let summaryBody = "*ALPS Conference was updated.*\n\n";
  if (!shown.length) {
    summaryBody += "_No changes._\n";
  } else {
    summaryBody += bullets;
    if (omitted > 0) summaryBody += `\n_…and ${omitted} more._`;
  }

  const textFallback = `ALPS Conference was updated. ${siteUrl}`;

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
            style: "primary",
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
