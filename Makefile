.PHONY: local

# Clear Vite cache and start with local nqgrid / nqgantt / nqchart.
local:
	rm -rf node_modules/.vite && pnpm dev:local
