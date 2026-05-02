import tseslint from "typescript-eslint";

export default tseslint.config(
    ...tseslint.configs.recommended,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-floating-promises": "error",
        },
    },
    {
        ignores: ["lib/", "node_modules/"],
    }
);
