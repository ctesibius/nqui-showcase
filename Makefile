.PHONY: local build-local

# Clear Vite cache and start with local nqgrid / nqgantt / nqchart.
local:
	rm -rf node_modules/.vite && pnpm dev:local

# Production build against the LOCAL sibling libraries.
#
# `pnpm build` deliberately uses published npm only (see NQGANTT-WORKSPACE.md),
# so while a sibling library has unreleased work the deploy build cannot
# succeed. This target is how you prove the bundle is sound before publishing,
# instead of finding out afterwards.
build-local:
	rm -rf node_modules/.vite && pnpm build:local
