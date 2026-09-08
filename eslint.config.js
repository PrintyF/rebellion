import tseslint from "typescript-eslint";

// Scope actuel : uniquement types/ (schémas Zod), cf. critère d'acceptation
// US1.2 sur l'absence de `any` non justifié. src/ reste JS vanilla sans lint
// pour l'instant — à étendre epic par epic si besoin.
export default tseslint.config({
  files: ["types/**/*.ts"],
  extends: [...tseslint.configs.recommended],
  rules: {
    "@typescript-eslint/no-explicit-any": "error",
  },
});
