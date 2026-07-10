#!/usr/bin/env sh
# Install @nqlib/nqgantt npm peers for a chosen integration profile.
# Usage: install-deps.sh --ui demo|root|composed|custom|none --data pm-input|items|features

set -e

UI="root"
DATA="pm-input"
PM="pnpm"

while [ $# -gt 0 ]; do
  case "$1" in
    --ui) UI="$2"; shift 2 ;;
    --data) DATA="$2"; shift 2 ;;
    --pm) PM="$2"; shift 2 ;;
    -h|--help)
      echo "Usage: install-deps.sh [--ui demo|root|composed|custom|none] [--data pm-input|items|features] [--pm pnpm|npm|yarn|bun]"
      exit 0
      ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

CORE="@nqlib/nqgantt @nqlib/nqui"
PEERS="date-fns @dnd-kit/core @dnd-kit/modifiers jotai lodash.throttle @hugeicons/react @hugeicons/core-free-icons @uidotdev/usehooks sonner next-themes"

case "$UI" in
  demo|root|composed|custom) PACKAGES="$CORE $PEERS" ;;
  none) PACKAGES="@nqlib/nqgantt" ;;
  *) echo "Invalid --ui: $UI"; exit 1 ;;
esac

if [ "$DATA" = "items" ]; then
  PACKAGES="$PACKAGES @nqlib/nqgantt/item-gantt-adapter"
fi

echo "Installing: $PACKAGES"
$PM add $PACKAGES

echo "Done. Import UI from @nqlib/nqgantt/ui per references/ui-options.md (path: $UI)."
