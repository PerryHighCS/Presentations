#!/usr/bin/env bash

set -u

USER=$(gh api user --jq '.login')

echo "GitHub Actions Storage Report"
echo "User: $USER"
echo

tmpfile=$(mktemp)
trap 'rm -f "$tmpfile"' EXIT

scan_owner() {
    local owner="$1"

    gh repo list "$owner" \
        --limit 1000 \
        --json nameWithOwner \
        --jq '.[].nameWithOwner' |
    while read -r repo; do

        # Actions artifacts
        artifact_data=$(
            gh api "repos/$repo/actions/artifacts?per_page=100" \
                --paginate \
                --jq '[.artifacts[] | .size_in_bytes] | [length, add // 0] | @tsv' \
                2>/dev/null
        )

        # --paginate can produce one result per page, so sum them.
        artifact_count=0
        artifact_bytes=0

        while IFS=$'\t' read -r count bytes; do
            artifact_count=$((artifact_count + ${count:-0}))
            artifact_bytes=$((artifact_bytes + ${bytes:-0}))
        done <<< "$artifact_data"

        # Actions caches
        cache_data=$(
            gh cache list \
                --repo "$repo" \
                --limit 10000 \
                --json sizeInBytes \
                --jq '[length, ([.[].sizeInBytes] | add // 0)] | @tsv' \
                2>/dev/null
        )

        if [[ -n "$cache_data" ]]; then
            IFS=$'\t' read -r cache_count cache_bytes <<< "$cache_data"
        else
            cache_count=0
            cache_bytes=0
        fi

        total_bytes=$((artifact_bytes + cache_bytes))

        # Only report repositories actually using storage.
        if (( total_bytes > 0 )); then
            printf "%d\t%s\t%d\t%d\t%d\t%d\n" \
                "$total_bytes" \
                "$repo" \
                "$artifact_count" \
                "$artifact_bytes" \
                "$cache_count" \
                "$cache_bytes" \
                >> "$tmpfile"
        fi

    done
}

echo "Scanning personal repositories..."
scan_owner "$USER"

while read -r org; do
    echo "Scanning organization: $org..."
    scan_owner "$org"
done < <(gh org list --limit 100)

echo
echo "Results"
echo

printf "%-45s %9s %12s %9s %12s %12s\n" \
    "REPOSITORY" "ARTIFACTS" "ART SIZE" "CACHES" "CACHE SIZE" "TOTAL"

printf "%-45s %9s %12s %9s %12s %12s\n" \
    "----------" "---------" "--------" "------" "----------" "-----"

sort -nr "$tmpfile" |
while IFS=$'\t' read -r total repo artifact_count artifact_bytes cache_count cache_bytes; do

    artifact_mb=$((artifact_bytes / 1024 / 1024))
    cache_mb=$((cache_bytes / 1024 / 1024))
    total_mb=$((total / 1024 / 1024))

    printf "%-45s %9d %9d MB %9d %9d MB %9d MB\n" \
        "$repo" \
        "$artifact_count" \
        "$artifact_mb" \
        "$cache_count" \
        "$cache_mb" \
        "$total_mb"
done