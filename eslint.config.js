import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  // Scroll containers are nqui's ScrollArea — never native overflow-auto /
  // overflow-scroll — and controls are nqui components, never raw HTML.
  // See CLAUDE.md "Scrolling" / "nqui only" and .cursor/rules/.
  // A container that truly cannot be a ScrollArea (a library-owned scroller,
  // a <pre> code sample) takes an eslint-disable-next-line with the reason.
  {
    files: ['src/**/*.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: String.raw`Literal[value=/\boverflow-(?:[xy]-)?(?:auto|scroll)\b/]`,
          message: 'Use ScrollArea from @nqlib/nqui instead of a native overflow-auto/overflow-scroll container.',
        },
        {
          selector: String.raw`TemplateElement[value.raw=/\boverflow-(?:[xy]-)?(?:auto|scroll)\b/]`,
          message: 'Use ScrollArea from @nqlib/nqui instead of a native overflow-auto/overflow-scroll container.',
        },
        // The showcase exists to show nqui: raw HTML controls are the wrong
        // demo. See CLAUDE.md "nqui only" and .cursor/rules/nqui-only.mdc.
        {
          selector: 'JSXOpeningElement[name.name=/^(button|input|select|textarea|label|table)$/]',
          message:
            'Use the nqui component (Button, Input, NativeSelect/Select, Textarea, Label, Table) instead of a raw HTML control.',
        },
      ],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  // Loupe (src/devtools/loupe/) is a dev-only tool copied as it is from SecoLab and
  // kept portable: it imports only react and react-dom, so it draws raw HTML
  // controls instead of nqui, and its ref reads during render are the upstream
  // code (SecoLab lints without the React Compiler rules). The import fence keeps
  // the folder free of app imports so it can be copied back. Last, so it wins.
  {
    files: ['src/devtools/loupe/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': 'off',
      'react-hooks/refs': 'off',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/*', '@/**', '../*', '../**'],
              message:
                'Loupe imports nothing from the app, so the folder can be copied into another app. Pass the value in LoupeConfig (src/devtools/loupe.config.ts).',
            },
          ],
        },
      ],
    },
  },
])
