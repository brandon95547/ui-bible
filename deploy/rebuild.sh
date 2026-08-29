#!/usr/bin/env bash
#
# Rebuild the static site nginx serves at ui.skylanex.com.
#
# "Static" is now literal: the build prerenders every page to its own
# directory, so `/button` is a real button/index.html rather than a shell that
# fills itself in with JavaScript.
#
# This is the deploy step: `dist/` is gitignored, so a `git pull` on its own
# changes nothing a visitor can see. Run it through systemd —
#
#     cd /var/www/ui-bible && git pull
#     sudo systemctl restart ui-bible
#
# — or call this script directly; it behaves identically either way.
#
# The build goes to a staging directory and is swapped in with a single mv, so
# the document root is never half-written. A failed build leaves the live site
# exactly as it was.
set -euo pipefail

# Appended, not replaced: systemd hands the service a bare PATH, while a human
# running this by hand may well have node from nvm ahead of /usr/bin.
export PATH="${PATH}:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

STAGE="$ROOT/dist.new"
LIVE="$ROOT/dist"
PREV="$ROOT/dist.old"

# npm ci wipes and reinstalls node_modules — a minute we only spend when the
# lockfile actually moved. `-nt` is false when node_modules is missing, hence
# the explicit -d test.
if [[ ! -d node_modules || package-lock.json -nt node_modules ]]; then
  echo "==> dependencies changed — npm ci"
  npm ci
else
  echo "==> dependencies unchanged — skipping npm ci"
fi

echo "==> building into $(basename "$STAGE")"
rm -rf "$STAGE"
# OUT_DIR rather than `--outDir`: the build is now four commands — tsc, the
# client bundle, the SSR bundle, and the prerender that turns the second into
# 108 static pages using the first — and CLI args appended by npm would only
# reach the last of them. vite.config.ts and scripts/prerender.mjs both read
# this variable. tsc still runs first, so a type error aborts before anything
# is written.
OUT_DIR="$STAGE" npm run build

# Refuse to publish a build that is missing its point. index.html alone is no
# longer evidence of a good build: the client bundle can succeed while the
# prerender produces nothing, and the result would be the empty shell the
# prerender exists to replace. So check one prerendered page and the sitemap
# too, and check that the page actually contains rendered markup rather than a
# bare <div id="root">.
for required in index.html button/index.html sitemap.xml robots.txt 404.html; do
  if [[ ! -s "$STAGE/$required" ]]; then
    echo "!! $STAGE/$required is missing or empty — refusing to swap" >&2
    exit 1
  fi
done
if grep -q '<div id="root"></div>' "$STAGE/button/index.html"; then
  echo "!! $STAGE/button/index.html was not prerendered — refusing to swap" >&2
  exit 1
fi

echo "==> swapping into place"
rm -rf "$PREV"
if [[ -d "$LIVE" ]]; then
  mv "$LIVE" "$PREV"
fi
mv "$STAGE" "$LIVE"

# The previous build stays on disk until the next run, so a bad deploy is one
# command away from undone:
#
#     mv dist dist.bad && mv dist.old dist
#
echo "==> done — $(find "$LIVE" -type f | wc -l) files live in $LIVE"
