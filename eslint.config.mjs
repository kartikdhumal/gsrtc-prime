const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    files: ["*.ts", "*.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn", // change from error to warning
    },
  },
];

export default eslintConfig;
