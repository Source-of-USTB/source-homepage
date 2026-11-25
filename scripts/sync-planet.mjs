#!/usr/bin/env node
/**
 * Sync the Blogs/Members page data from the official Planet-Source-of-USTB
 * aggregator. The Planet repo owns feed fetching and normalization; this
 * script only mirrors its generated JSON and new member avatars.
 *
 * Run with: npm run sync:planet
 */

import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const OWNER = 'Source-of-USTB';
const REPO = 'Planet-Source-of-USTB';
const REF = 'main';
const RAW = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${REF}`;
const API = `https://api.github.com/repos/${OWNER}/${REPO}/contents`;
const ROOT = process.cwd();
const DATA_DIR = join(ROOT, 'src/data/planet');
const AVATAR_DIR = join(ROOT, 'public/planet/avatars');

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const baseHeaders = {
  'User-Agent': 'source-homepage-planet-sync',
};
const apiHeaders = {
  ...baseHeaders,
  Accept: 'application/vnd.github+json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url, binary, headers) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers,
        cache: 'no-store',
        signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status} for ${url}`);
        error.status = response.status;
        throw error;
      }
      return binary
        ? Buffer.from(await response.arrayBuffer())
        : await response.text();
    } catch (error) {
      lastError = error;
      if (error.status === 404) break;
      if (attempt < 3) {
        console.warn(`  retry ${attempt}/3: ${error.message}`);
        await sleep(1000 * attempt);
      }
    }
  }
  throw lastError;
}

async function readRemoteFile(path, binary = false) {
  // The contents API is the most reliable path in CI and supports an
  // authenticated token. Fall back to raw.githubusercontent.com if needed.
  try {
    const response = await fetch(`${API}/${path}?ref=${REF}`, {
      headers: apiHeaders,
      cache: 'no-store',
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) {
      throw new Error(`GitHub API HTTP ${response.status} for ${path}`);
    }
    const payload = await response.json();
    if (Array.isArray(payload)) {
      throw new Error(`Unexpected directory payload for ${path}`);
    }
    if (payload.content) {
      const buffer = Buffer.from(payload.content, 'base64');
      return binary ? buffer : buffer.toString('utf8');
    }
    if (payload.download_url) {
      return await fetchWithRetry(payload.download_url, binary, baseHeaders);
    }
    throw new Error(`No content in GitHub API payload for ${path}`);
  } catch (apiError) {
    console.warn(`  API fetch failed (${apiError.message}); trying raw GitHub`);
    return await fetchWithRetry(`${RAW}/${path}`, binary, baseHeaders);
  }
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function writeIfChanged(path, buffer) {
  await mkdir(dirname(path), { recursive: true });
  const existing = await readFile(path).catch(() => null);
  if (existing && existing.equals(buffer)) return false;
  await writeFile(path, buffer);
  return true;
}

async function main() {
  console.log(`Syncing ${OWNER}/${REPO}@${REF} ...`);

  const [postsText, memberMapText] = await Promise.all([
    readRemoteFile('src/data/generated/posts.json'),
    readRemoteFile('src/data/generated/member-map.json'),
  ]);

  const posts = JSON.parse(postsText);
  const memberMap = JSON.parse(memberMapText);

  if (!Array.isArray(posts)) throw new Error('Planet posts.json is not an array');
  if (!memberMap || typeof memberMap !== 'object' || Array.isArray(memberMap)) {
    throw new Error('Planet member-map.json is not an object');
  }

  const invalidPosts = posts.filter(
    post => !post?.id || !post?.title || !post?.link || !post?.authorId,
  );
  if (invalidPosts.length > 0) {
    throw new Error(`Planet returned ${invalidPosts.length} invalid posts`);
  }

  const postsChanged = await writeIfChanged(
    join(DATA_DIR, 'posts.json'),
    Buffer.from(postsText),
  );
  const membersChanged = await writeIfChanged(
    join(DATA_DIR, 'member-map.json'),
    Buffer.from(memberMapText),
  );

  let avatarsAdded = 0;
  for (const [memberId, member] of Object.entries(memberMap)) {
    const avatar = member?.avatar;
    if (!avatar) continue;
    const destination = join(AVATAR_DIR, avatar);
    if (await exists(destination)) continue;
    try {
      const avatarBuffer = await readRemoteFile(
        `public/avatars/${encodeURIComponent(avatar)}`,
        true,
      );
      await writeFile(destination, avatarBuffer);
      avatarsAdded += 1;
      console.log(`  avatar added: ${avatar} (${memberId})`);
    } catch (error) {
      // The page falls back to default.png, so one bad avatar must not block data.
      console.warn(`  avatar skipped: ${avatar} (${error.message})`);
    }
  }

  const missingAuthors = [...new Set(
    posts.map(post => post.authorId).filter(id => !memberMap[id]),
  )];
  if (missingAuthors.length > 0) {
    console.warn(`  posts without member entry: ${missingAuthors.join(', ')}`);
  }

  console.log(
    `Done: ${posts.length} posts, ${Object.keys(memberMap).length} members ` +
    `(posts ${postsChanged ? 'updated' : 'unchanged'}, ` +
    `members ${membersChanged ? 'updated' : 'unchanged'}, ` +
    `avatars +${avatarsAdded}).`,
  );
}

main().catch(error => {
  console.error(`Planet sync failed: ${error.message}`);
  process.exitCode = 1;
});
