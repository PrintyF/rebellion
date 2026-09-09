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
// systems-accurate.csv, sectors-accurate.csv), délimité par ";".
// facilities.csv/defenses.csv viennent d'un export communautaire (feuille
// de calcul, même source que characters.csv/capital-ships.csv/etc.) : une
// seule colonne "Type" garantie, délimité par "," (export CSV standard
// d'un tableur). characters.csv, capital-ships.csv, fighters.csv,
// troops.csv et special-forces.csv (même feuille) sont traités à part par
// extractPositionalSheet (cf. POSITIONAL_SHEETS) : header multi-ligne et/ou
// colonne Faction à propager, incompatibles avec `columns: true`.
const ENTITY_FILES: readonly EntityFileConfig[] = [
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

// Plusieurs fichiers viennent du même export communautaire (feuille de
// calcul) et partagent deux particularités absentes des CSV de
// l'éditeur .NET : un header sur 1 ou 2 lignes (catégorie + sous-
// catégorie pour les tableaux d'armement, cellules fusionnées côté
// tableur) et une colonne Faction qui n'est renseignée que sur la 1re
// ligne de chaque bloc (à propager sur les lignes suivantes). On les
// parse positionnellement plutôt qu'avec `columns: true`.
interface PositionalSheetConfig {
  file: string;
  headerRows: 1 | 2;
  columns: readonly string[]; // nom de champ pour chaque index de colonne
  nameIndex: number;
  factionIndex: number | null; // null si le fichier n'a pas de colonne Faction
}

const CHARACTERS_SHEET: PositionalSheetConfig = {
  file: "characters.csv",
  headerRows: 2,
  nameIndex: 0,
  factionIndex: 1,
  columns: [
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
  ],
};

const CAPITAL_SHIPS_SHEET: PositionalSheetConfig = {
  file: "capital-ships.csv",
  headerRows: 2,
  nameIndex: 1,
  factionIndex: 0,
  columns: [
    "faction", "name", "cost", "maintenanceCost",
    "hullStrength", "damageControl", "maxShields", "shieldRecharge",
    "researchTier", "detectionRating", "hyperdrive", "sublightSpeed",
    "maneuverability", "fighterCapacity", "troopCapacity",
    "turbolaserForward", "turbolaserAft", "turbolaserPort", "turbolaserStarboard", "turbolaserRange",
    "ionCannonForward", "ionCannonAft", "ionCannonPort", "ionCannonStarboard", "ionCannonRange",
    "laserCannonForward", "laserCannonAft", "laserCannonPort", "laserCannonStarboard", "laserCannonRange",
    "tractorBeamPower", "tractorBeamRange", "weaponRecharge", "bombardment", "gravityWell",
  ],
};

const FIGHTERS_SHEET: PositionalSheetConfig = {
  file: "fighters.csv",
  headerRows: 2,
  nameIndex: 1,
  factionIndex: 0,
  columns: [
    "faction", "name", "cost", "maintenanceCost", "squadronSize",
    "detectionRating", "hyperdrive", "sublightSpeed", "agility", "researchTier",
    "bombardment",
    "laserCannonStrength", "laserCannonRange",
    "ionCannonStrength", "ionCannonRange",
    "torpedoesStrength", "torpedoesRange",
    "shieldStrength",
  ],
};

const TROOPS_SHEET: PositionalSheetConfig = {
  file: "troops.csv",
  headerRows: 1,
  nameIndex: 1,
  factionIndex: 0,
  columns: [
    "faction", "name", "cost", "maintenanceCost",
    "attackRating", "defenseRating", "bombDefense", "researchTier", "detectionRating",
  ],
};

const SPECIAL_FORCES_SHEET: PositionalSheetConfig = {
  file: "special-forces.csv",
  headerRows: 1,
  nameIndex: 1,
  factionIndex: 0,
  columns: ["faction", "name", "missions", "cost", "maintenanceCost", "espionage", "combat", "leadership"],
};

const POSITIONAL_SHEETS: readonly PositionalSheetConfig[] = [
  CHARACTERS_SHEET, CAPITAL_SHIPS_SHEET, FIGHTERS_SHEET, TROOPS_SHEET, SPECIAL_FORCES_SHEET,
];

function extractPositionalSheet(inputDir: string, config: PositionalSheetConfig): { rows: Record<string, string>[]; summary: ExtractSummary } {
  const { file, headerRows, columns, nameIndex, factionIndex } = config;
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

  const dataRows = records.slice(headerRows);
  const rows: Record<string, string>[] = [];
  let lastFaction = "";

  dataRows.forEach((cols, index) => {
    const lineNumber = index + headerRows + 1;
    const name = cols[nameIndex]?.trim();
    if (!name) {
      errors.push(`${file}:${lineNumber} — colonne manquante ou vide : ${columns[nameIndex]}`);
      return;
    }

    let faction: string | null = null;
    if (factionIndex !== null) {
      faction = cols[factionIndex]?.trim() || lastFaction;
      if (!faction) {
        errors.push(`${file}:${lineNumber} — faction introuvable (ni sur cette ligne, ni sur une ligne précédente) pour "${name}"`);
        return;
      }
      lastFaction = faction;
    }

    const row: Record<string, string> = {};
    columns.forEach((fieldName, i) => {
      row[fieldName] = i === factionIndex && faction !== null ? faction : (cols[i] ?? "");
    });
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

  for (const config of POSITIONAL_SHEETS) {
    const { rows, summary } = extractPositionalSheet(inputDir, config);
    const outputPath = path.join(outputDir, config.file.replace(/\.csv$/, ".json"));
    fs.writeFileSync(outputPath, JSON.stringify(rows, null, 2));
    summaries.push(summary);
  }

  for (const config of ENTITY_FILES) {
    const { rows, summary } = extractFile(inputDir, config);
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
