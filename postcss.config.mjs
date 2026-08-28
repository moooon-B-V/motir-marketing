// Tailwind v4's PostCSS entry — the only build step `@motir/design-system`
// needs. The package ships `theme.css` (the `@theme` layer, the `dark`
// variant, the Tier-3 `--el-*` tokens) and JSX that references Tailwind
// utility classes; both are compiled here, from `app/globals.css`.
const config = {
  plugins: ['@tailwindcss/postcss'],
}

export default config
