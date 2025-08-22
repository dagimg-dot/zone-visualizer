import antfu from '@antfu/eslint-config'

export default antfu({
  // Enable stylistic rules
  stylistic: true,
  // Enable formatters
  formatters: true,
  // Enable TypeScript support
  typescript: true,
  // Enable Vue support
  vue: true,
  // Specify files or directories to ignore
  ignores: [
    'node_modules',
    'dist',
    '*.sh',
    '*.md',
    '*.woff',
    '*.ttf',
    '.vscode',
    '.idea',
    '/public',
    '/docs',
    '.husky',
    '.local',
    '/bin',
    'Dockerfile',
    '*.min.js',
    '*.bundle.js',
  ],
})
