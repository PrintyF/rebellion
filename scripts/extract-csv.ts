import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";

/**
 * US1.1 — Extraction des CSV générés par l'export 1-clic de
 * StarWarsRebellionEditor.NET. Une ligne malformée est loggée et ignorée ;
 * elle n'arrête jamais le script. Sortie : un JSON brut par fichier source
 * (une ligne CSV = un objet, valeurs encore sous forme de chaînes — le
 * typage/la validation métier sont faits par `data:build`, cf. US1.2).
 */

interface EntityFileConfig {
  file: string;
  requiredColumns: readonly string[];
  delimiter: string;
}

// Id/Name sont les deux seules colonnes garanties par l'export de l'éditeur
// sur toutes les entités (vérifié sur les CSV réels disponibles :
// systems-accurate.csv, sectors-accurate.csv, capitalships.csv), délimité
// par ";". facilities.csv/defenses.csv viennent d'un export communautaire
// (feuille de calcul, même source que characters.csv) : une seule colonne
// "Type" garantie, délimité par "," (export CSV standard d'un tableur).
const ENTITY_FILES: readonly EntityFileConfig[] = [
  { file: "characters.csv", requiredColumns: ["Id", "Name"], delimiter: ";" },
  { file: "units.csv", requiredColumns: ["Id", "Name"], delimiter: ";" },
  { file: "facilities.csv", requiredColumns: ["Type"], delimiter: "," },
  { file: "defenses.csv", requiredColumns: ["Type"], delimiter: "," },
  { file: "systems.csv", requiredColumns: ["Id", "Name"], delimiter: ";" },
  { file: "sectors.csv", requiredColumns: ["Id", "Name"], delimiter: ";" },
];

interface ExtractSummary {
  file: string;
  linesRead: number;
  kept: number;
  errorCount: number;
}

// characters.csv (export communautaire, pas encore l'export officiel de
// l'éditeur — cf. conversation) a un header sur 2 lignes (catégorie +
// sous-catégorie, cellules fusionnées côté tableur) au lieu du header
// simple des autres fichiers. On le parse positionnellement plutôt
// qu'avec `columns: true`, et on reconstitue la colonne Faction
// (valeur uniquement sur la 1re ligne de chaque bloc faction, à
// propager sur les lignes suivantes).
const CHARACTERS_COLUMNS = [
  "name", "faction", "canBetray",
  "diplomacyBase", "diplomacyVariance",
  "espionageBase", "espionageVariance",
  "combatBase", "combatVariance",
  "leadershipBase", "leadershipVariance",
  "canBeAdmiral", "canBeCommander", "canBeGeneral",
  "researchShipBase", "researchShipVariance",
  "researchTroopBase", "researchTroopVariance",
  "researchFacilityBase", "researchFacilityVariance",
  "jediProbability", "jediLevelBase", "jediLevelVariance",
  "jediKnown", "jediTrainer",
] as const;

function extractCharactersFile(inputDir: string, file: string): { rows: Record<string, string>[]; summary: ExtractSummary } {
  const filePath = path.join(inputDir, file);
  const errors: string[] = [];

  if (!fs.existsSync(filePath)) {
    console.error(`[extract] ${file} : fichier introuvable (${filePath}) — ignoré`);
    return { rows: [], summary: { file, linesRead: 0, kept: 0, errorCount: 1 } };
  }

  const content = fs.readFileSync(filePath, "utf-8");
  let records: string[][];
  try {
    records = parse(content, {
      columns: false,
      skip_empty_lines: true,
      relax_column_count: true,
      bom: true,
    });
  } catch (err) {
    console.error(`[extract] ${file} : échec complet du parsing (${(err as Error).message}) — ignoré`);
    return { rows: [], summary: { file, linesRead: 0, kept: 0, errorCount: 1 } };
  }

  const dataRows = records.slice(2); // 2 lignes de header (catégorie + sous-catégorie)
  const rows: Record<string, string>[] = [];
  let lastFaction = "";

  dataRows.forEach((cols, index) => {
    const lineNumber = index + 3;
    const name = cols[0]?.trim();
    if (!name) {
      errors.push(`${file}:${lineNumber} — colonne manquante ou vide : name`);
      return;
    }
    const faction = cols[1]?.trim() || lastFaction;
    if (!faction) {
      errors.push(`${file}:${lineNumber} — faction introuvable (ni sur cette ligne, ni sur une ligne précédente) pour "${name}"`);
      return;
    }
    lastFaction = faction;

    const row: Record<string, string> = { name, faction };
    for (let i = 2; i < CHARACTERS_COLUMNS.length; i++) {
      row[CHARACTERS_COLUMNS[i]] = cols[i] ?? "";
    }
    rows.push(row);
  });

  for (const error of errors) {
    console.error(`[extract] ${error}`);
  }

  return { rows, summary: { file, linesRead: dataRows.length, kept: rows.length, errorCount: errors.length } };
}

function extractFile(inputDir: string, config: EntityFileConfig): { rows: Record<string, string>[]; summary: ExtractSummary } {
  const { file, requiredColumns, delimiter } = config;
  const filePath = path.join(inputDir, file);
  const errors: string[] = [];

  if (!fs.existsSync(filePath)) {
    console.error(`[extract] ${file} : fichier introuvable (${filePath}) — ignoré`);
    return { rows: [], summary: { file, linesRead: 0, kept: 0, errorCount: 1 } };
  }

  const content = fs.readFileSync(filePath, "utf-8");
  let records: Record<string, string>[];
  try {
    records = parse(content, {
      delimiter,
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
      skip_records_with_error: true,
      bom: true,
      on_record: (record, context) => {
        if (context.error) {
          errors.push(`${file}:${context.lines} — ligne CSV non parsable (${context.error.message})`);
        }
        return record;
      },
    });
  } catch (err) {
    console.error(`[extract] ${file} : échec complet du parsing (${(err as Error).message}) — ignoré`);
    return { rows: [], summary: { file, linesRead: 0, kept: 0, errorCount: 1 } };
  }

  const rows: Record<string, string>[] = [];
  records.forEach((record, index) => {
    const lineNumber = index + 2; // ligne 1 = header
    const missing = requiredColumns.filter((col) => !record[col] || record[col].trim() === "");
    if (missing.length > 0) {
      errors.push(`${file}:${lineNumber} — colonne(s) manquante(s) ou vide(s) : ${missing.join(", ")}`);
      return;
    }
    rows.push(record);
  });

  for (const error of errors) {
    console.error(`[extract] ${error}`);
  }

  return { rows, summary: { file, linesRead: records.length, kept: rows.length, errorCount: errors.length } };
}

function main(): void {
  const inputDir = process.argv[2] ?? "data-source";
  const outputDir = process.argv[3] ?? "data-raw";
  fs.mkdirSync(outputDir, { recursive: true });

  const summaries: ExtractSummary[] = [];

  for (const config of ENTITY_FILES) {
    const { rows, summary } = config.file === "characters.csv"
      ? extractCharactersFile(inputDir, config.file)
      : extractFile(inputDir, config);
    const outputPath = path.join(outputDir, config.file.replace(/\.csv$/, ".json"));
    fs.writeFileSync(outputPath, JSON.stringify(rows, null, 2));
    summaries.push(summary);
  }

  console.log("\nRésumé extraction :");
  for (const s of summaries) {
    console.log(`  ${s.file} — ${s.linesRead} ligne(s) lue(s), ${s.kept} conservée(s), ${s.errorCount} erreur(s)`);
  }
  const totalErrors = summaries.reduce((sum, s) => sum + s.errorCount, 0);
  console.log(`Total : ${totalErrors} erreur(s)`);
}

main();
