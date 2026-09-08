import fs from "node:fs";
import path from "node:path";
import {
  SectorListSchema,
  PlanetListSchema,
  CharacterListSchema,
  UnitListSchema,
  InstallationListSchema,
  type Sector,
  type Planet,
  type Character,
  type Unit,
  type Installation,
} from "../types/index.js";

/**
 * US1.2 — Convertit les JSON bruts produits par `data:extract` (une ligne
 * CSV source = un objet, valeurs en string) en JSON structuré et typé,
 * validé par les schémas Zod de types/.
 *
 * Gap connu (signalé à l'utilisateur, pas une erreur d'implémentation) :
 * plusieurs champs cibles n'existent pas dans l'export de l'éditeur
 * (connexions entre secteurs/hyperlanes, loyalty initiale, garrison,
 * capabilities des personnages, unlockedByResearch). Ils sont défaultés
 * ici avec un warning explicite — à trancher côté game design plus tard.
 */

type RawRow = Record<string, string>;

function readRawRows(rawDir: string, file: string): RawRow[] {
  const filePath = path.join(rawDir, file);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function warn(message: string): void {
  console.warn(`[build] ${message}`);
}

// --- sectors.csv -> Sector[] -------------------------------------------

function mapSectors(rows: RawRow[], systemsByPlanetSectorId: Map<string, string[]>): Sector[] {
  let missingAdjacency = 0;
  const sectors = rows.map((row): Sector => {
    // "Group" (Core / Rim (inner) / Rim (outer)) est la colonne la plus
    // proche de la notion de bordure extérieure/intérieure du schéma cible.
    const type = row.Group === "Rim (outer)" ? "outer-rim" : "inner-rim";
    missingAdjacency += 1;
    return {
      id: row.Id,
      type,
      systemIds: systemsByPlanetSectorId.get(row.Id) ?? [],
      adjacentSectorIds: [], // absent de l'export éditeur, cf. gap connu
    };
  });
  if (missingAdjacency > 0) {
    warn(`sectors.json — adjacentSectorIds défaulté à [] pour ${missingAdjacency} secteur(s) (donnée absente du CSV source)`);
  }
  return sectors;
}

// --- systems.csv -> Planet[] ---------------------------------------------

function mapPlanets(rows: RawRow[]): Planet[] {
  if (rows.length > 0) {
    warn(`planets.json — loyalty (50/50) et garrison ([]) défaultés pour ${rows.length} planète(s) (donnée absente du CSV source)`);
  }
  return rows.map((row): Planet => ({
    id: row.Id,
    name: row.Name,
    sectorId: row.SectorId,
    position: { x: Number(row.XPosition), y: Number(row.YPosition) },
    loyalty: { empire: 50, alliance: 50 },
    garrison: [],
    description: row.EncyclopediaDescription || undefined,
  }));
}

// --- units.csv -> Unit[] ---------------------------------------------------

// Colonnes non-numériques ou hors-stats de gameplay : exclues du sac `stats`.
const UNIT_NON_STAT_COLUMNS = new Set([
  "Id", "Name", "EncyclopediaDescription", "IsAlliance", "IsEmpire",
  "RefinedMaterialCost", "MaintenanceCost",
  "Field2_1", "ProductionFamily", "NextProductionFamily", "FamilyId",
  "TextStraDllId", "Field7_2", "Field51_0",
]);

function mapUnitFaction(row: RawRow): "empire" | "alliance" {
  const isAlliance = row.IsAlliance === "1";
  const isEmpire = row.IsEmpire === "1";
  if (isAlliance && !isEmpire) return "alliance";
  if (isEmpire && !isAlliance) return "empire";
  // Ni l'un ni l'autre (ou les deux) : cas non observé dans les CSV réels
  // disponibles (IsAlliance/IsEmpire toujours mutuellement exclusifs), mais
  // on ne veut pas assigner silencieusement une faction arbitraire si ça
  // change un jour côté source.
  warn(`units.json — unité "${row.Id}" (${row.Name}) a IsAlliance="${row.IsAlliance}" et IsEmpire="${row.IsEmpire}" (ambigu) — faction défaultée à "empire"`);
  return "empire";
}

function mapUnits(rows: RawRow[]): Unit[] {
  if (rows.length > 0) {
    warn(`units.json — unlockedByResearch défaulté à null pour ${rows.length} unité(s) (pas d'ID de recherche référençable dans le CSV source, seulement un ordre numérique) ; category défaulté à "capital-ship" (seul CSV source disponible actuellement)`);
  }
  return rows.map((row): Unit => {
    const stats: Record<string, number> = {};
    for (const [key, value] of Object.entries(row)) {
      if (UNIT_NON_STAT_COLUMNS.has(key)) continue;
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) stats[key] = parsed;
    }
    return {
      id: row.Id,
      name: row.Name,
      faction: mapUnitFaction(row),
      category: "capital-ship",
      cost: Number(row.RefinedMaterialCost) || 0,
      maintenanceCost: Number(row.MaintenanceCost) || 0,
      unlockedByResearch: null,
      stats,
      description: row.EncyclopediaDescription || undefined,
    };
  });
}

// --- characters.csv / buildings.csv -----------------------------------
// Pas de CSV source réel disponible actuellement (nécessite l'éditeur
// WinForms .NET, Windows-only). Le mapping produira un tableau vide tant
// que ces fichiers ne sont pas fournis — voir CLAUDE.md / conversation.

function mapCharacters(_rows: RawRow[]): Character[] {
  return [];
}

function mapInstallations(_rows: RawRow[]): Installation[] {
  return [];
}

// --- Cohérence croisée ---------------------------------------------------

function checkReferences(
  planets: Planet[],
  sectors: Sector[],
  characters: Character[],
  units: Unit[],
  installations: Installation[],
): string[] {
  const errors: string[] = [];
  const sectorIds = new Set(sectors.map((s) => s.id));
  const containerIds = new Set([...planets.map((p) => p.id), ...units.map((u) => u.id)]);
  const researchSourceIds = new Set([...units.map((u) => u.id), ...installations.map((i) => i.id)]);

  for (const planet of planets) {
    if (!sectorIds.has(planet.sectorId)) {
      errors.push(`planets.json — planète "${planet.id}" référence un sectorId inexistant : "${planet.sectorId}"`);
    }
  }
  for (const character of characters) {
    if (!containerIds.has(character.containerId)) {
      errors.push(`characters.json — personnage "${character.id}" référence un containerId inexistant : "${character.containerId}"`);
    }
  }
  for (const unit of units) {
    if (unit.unlockedByResearch !== null && !researchSourceIds.has(unit.unlockedByResearch)) {
      errors.push(`units.json — unité "${unit.id}" référence un unlockedByResearch inexistant : "${unit.unlockedByResearch}"`);
    }
  }
  for (const installation of installations) {
    if (installation.unlockedByResearch !== null && !researchSourceIds.has(installation.unlockedByResearch)) {
      errors.push(`installations.json — installation "${installation.id}" référence un unlockedByResearch inexistant : "${installation.unlockedByResearch}"`);
    }
  }
  return errors;
}

// --- main ------------------------------------------------------------------

function main(): void {
  const rawDir = process.argv[2] ?? "data-raw";
  const outputDir = process.argv[3] ?? "src/data";
  fs.mkdirSync(outputDir, { recursive: true });

  const sectorRows = readRawRows(rawDir, "sectors.json");
  const systemRows = readRawRows(rawDir, "systems.json");
  const unitRows = readRawRows(rawDir, "units.json");
  const characterRows = readRawRows(rawDir, "characters.json");
  const buildingRows = readRawRows(rawDir, "buildings.json");

  const systemsByPlanetSectorId = new Map<string, string[]>();
  for (const row of systemRows) {
    const list = systemsByPlanetSectorId.get(row.SectorId) ?? [];
    list.push(row.Id);
    systemsByPlanetSectorId.set(row.SectorId, list);
  }

  const sectors = mapSectors(sectorRows, systemsByPlanetSectorId);
  const planets = mapPlanets(systemRows);
  const units = mapUnits(unitRows);
  const characters = mapCharacters(characterRows);
  const installations = mapInstallations(buildingRows);

  // Validation par schéma Zod (structure + unicité des IDs par fichier).
  const results = [
    { name: "sectors.json", data: sectors, schema: SectorListSchema },
    { name: "planets.json", data: planets, schema: PlanetListSchema },
    { name: "characters.json", data: characters, schema: CharacterListSchema },
    { name: "units.json", data: units, schema: UnitListSchema },
    { name: "installations.json", data: installations, schema: InstallationListSchema },
  ];

  let hasError = false;
  for (const { name, data, schema } of results) {
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      hasError = true;
      for (const issue of parsed.error.issues) {
        console.error(`[build] ${name} — ${issue.path.join(".")}: ${issue.message}`);
      }
    }
  }

  // Cohérence croisée entre entités (sectorId, containerId, unlockedByResearch).
  const referenceErrors = checkReferences(planets, sectors, characters, units, installations);
  for (const error of referenceErrors) {
    console.error(`[build] ${error}`);
  }
  if (referenceErrors.length > 0) hasError = true;

  if (hasError) {
    console.error("\n[build] Échec de la validation — aucun fichier écrit dans " + outputDir);
    process.exit(1);
  }

  for (const { name, data } of results) {
    fs.writeFileSync(path.join(outputDir, name), JSON.stringify(data, null, 2));
  }

  console.log("\nRésumé build :");
  for (const { name, data } of results) {
    console.log(`  ${name} — ${data.length} entrée(s) écrite(s)`);
  }
}

main();
