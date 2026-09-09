import fs from "node:fs";
import path from "node:path";
import {
  SectorListSchema,
  PlanetListSchema,
  CharacterListSchema,
  ShipListSchema,
  TroopListSchema,
  SpecialForceListSchema,
  InstallationListSchema,
  type Sector,
  type SectorSize,
  type Planet,
  type Character,
  type CharacterCapability,
  type Ship,
  type ShipCategory,
  type Troop,
  type SpecialForce,
  type Installation,
  type InstallationCategory,
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

function mapSectorSize(row: RawRow): SectorSize {
  const normalized = row.GalaxySize.trim().toLowerCase();
  if (normalized === "standard" || normalized === "large" || normalized === "huge") {
    return normalized;
  }
  warn(`sectors.json — secteur "${row.Id}" a un GalaxySize non reconnu : "${row.GalaxySize}" — défaulté à "standard"`);
  return "standard";
}

function mapSectors(rows: RawRow[], systemsByPlanetSectorId: Map<string, string[]>): Sector[] {
  if (rows.length > 0) {
    warn(`sectors.json — adjacentSectorIds défaulté à [] pour ${rows.length} secteur(s) (donnée absente du CSV source)`);
  }
  return rows.map((row): Sector => {
    // "Group" (Core / Rim (inner) / Rim (outer)) est la colonne la plus
    // proche de la notion de bordure extérieure/intérieure du schéma cible.
    const type = row.Group === "Rim (outer)" ? "outer-rim" : "inner-rim";
    return {
      id: row.Id,
      name: row.Name,
      type,
      size: mapSectorSize(row),
      position: { x: Number(row.XPosition), y: Number(row.YPosition) },
      systemIds: systemsByPlanetSectorId.get(row.Id) ?? [],
      adjacentSectorIds: [], // absent de l'export éditeur, cf. gap connu
    };
  });
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

// --- capital-ships.csv + fighters.csv -> Ship[] --------------------------
// Source : export communautaire (même feuille de calcul que
// characters.csv), déjà en camelCase depuis extract-csv.ts (colonnes
// positionnelles avec header multi-ligne, cf. POSITIONAL_SHEETS).

// Champs communs aux fiches "capacité de combat" issues du même
// spreadsheet (ships, troops) : partagé plutôt que dupliqué par entité.
const COMBAT_UNIT_NON_STAT_COLUMNS = new Set(["faction", "name", "cost", "maintenanceCost", "researchTier"]);

function mapFaction(entityLabel: string, row: RawRow): "empire" | "alliance" {
  const normalized = row.faction.trim().toLowerCase();
  if (normalized === "alliance") return "alliance";
  if (normalized === "empire") return "empire";
  warn(`${entityLabel} — "${row.name}" a une faction non reconnue : "${row.faction}" — défaultée à "empire"`);
  return "empire";
}

function mapShipRow(row: RawRow, category: ShipCategory): Ship {
  const stats: Record<string, number> = {};
  for (const [key, value] of Object.entries(row)) {
    if (COMBAT_UNIT_NON_STAT_COLUMNS.has(key)) continue;
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) stats[key] = parsed;
  }
  return {
    id: slugify(row.name),
    name: row.name,
    faction: mapFaction("ships.json", row),
    category,
    cost: Number(row.cost) || 0,
    maintenanceCost: Number(row.maintenanceCost) || 0,
    unlockedByResearch: null,
    stats,
  };
}

function mapShips(capitalShipRows: RawRow[], fighterRows: RawRow[]): Ship[] {
  const total = capitalShipRows.length + fighterRows.length;
  if (total > 0) {
    warn(`ships.json — unlockedByResearch défaulté à null pour ${total} vaisseau(x) (researchTier présent en source mais aucune entité de recherche référençable, gardé dans stats.researchTier)`);
  }
  const capitalShips = capitalShipRows.map((row) => mapShipRow(row, "capital-ship"));
  const fighters = fighterRows.map((row) => mapShipRow(row, "fighter"));
  return [...capitalShips, ...fighters];
}

// --- troops.csv -> Troop[] -------------------------------------------------

function mapTroops(rows: RawRow[]): Troop[] {
  if (rows.length > 0) {
    warn(`troops.json — unlockedByResearch défaulté à null pour ${rows.length} troupe(s) (researchTier présent en source mais aucune entité de recherche référençable, gardé dans stats.researchTier)`);
  }
  return rows.map((row): Troop => {
    const stats: Record<string, number> = {};
    for (const [key, value] of Object.entries(row)) {
      if (COMBAT_UNIT_NON_STAT_COLUMNS.has(key)) continue;
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) stats[key] = parsed;
    }
    return {
      id: slugify(row.name),
      name: row.name,
      faction: mapFaction("troops.json", row),
      cost: Number(row.cost) || 0,
      maintenanceCost: Number(row.maintenanceCost) || 0,
      unlockedByResearch: null,
      stats,
    };
  });
}

// --- special-forces.csv -> SpecialForce[] ---------------------------------
// Pas de colonne Research dans cette source (contrairement aux autres
// unités) : pas d'unlockedByResearch pour ces entités.

function mapSpecialForces(rows: RawRow[]): SpecialForce[] {
  return rows.map((row): SpecialForce => ({
    id: slugify(row.name),
    name: row.name,
    faction: mapFaction("special-forces.json", row),
    missions: row.missions.split(",").map((m) => m.trim()).filter(Boolean),
    cost: Number(row.cost) || 0,
    maintenanceCost: Number(row.maintenanceCost) || 0,
    espionage: Number(row.espionage) || 0,
    combat: Number(row.combat) || 0,
    leadership: Number(row.leadership) || 0,
  }));
}

// --- characters.csv -> Character[] -----------------------------------
// Source : export communautaire (feuille de calcul), pas encore l'export
// officiel de l'éditeur .NET — cf. conversation. Colonnes Base/Variance
// (malgré le libellé "Min/Max" de la feuille) : [Base, Base + Variance]
// est la plage dans laquelle la vraie valeur de la stat du personnage
// est tirée aléatoirement UNE FOIS en début de partie (pas un jet par
// mission) — la valeur tirée reste fixe pour toute la partie.

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "") // accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toRange(base: string, variance: string): { min: number; max: number } {
  const b = Number(base) || 0;
  const v = Number(variance) || 0;
  return { min: b, max: b + v };
}

const TRUTHY = new Set(["true", "1", "yes"]);
function toBool(value: string): boolean {
  return TRUTHY.has((value ?? "").trim().toLowerCase());
}

function mapCharacters(rows: RawRow[]): Character[] {
  const nonDerivableCapabilities: CharacterCapability[] = ["recruitment", "sabotage", "incite-uprising"];
  if (rows.length > 0) {
    warn(`characters.json — containerId défaulté à null pour ${rows.length} personnage(s) (placement de départ absent de la source, relève d'un scénario/sauvegarde) ; capabilities [${nonDerivableCapabilities.join(", ")}] non dérivables de cette source (pas de colonne dédiée) et laissées vides`);
  }
  return rows.map((row): Character => {
    const diplomacy = toRange(row.diplomacyBase, row.diplomacyVariance);
    const espionage = toRange(row.espionageBase, row.espionageVariance);
    const combat = toRange(row.combatBase, row.combatVariance);
    const leadership = toRange(row.leadershipBase, row.leadershipVariance);
    const research = {
      ship: toRange(row.researchShipBase, row.researchShipVariance),
      troop: toRange(row.researchTroopBase, row.researchTroopVariance),
      facility: toRange(row.researchFacilityBase, row.researchFacilityVariance),
    };

    const capabilities: CharacterCapability[] = [];
    if (diplomacy.max > 0) capabilities.push("diplomacy");
    if (espionage.max > 0) capabilities.push("espionage");
    if (research.ship.max > 0) capabilities.push("naval-research");
    if (research.troop.max > 0) capabilities.push("troop-research");
    if (research.facility.max > 0) capabilities.push("installation-research");

    return {
      id: slugify(row.name),
      name: row.name,
      faction: mapFaction("characters.json", row),
      containerId: null,
      status: "stationed",
      canBetray: toBool(row.canBetray),
      canBeAdmiral: toBool(row.canBeAdmiral),
      canBeCommander: toBool(row.canBeCommander),
      canBeGeneral: toBool(row.canBeGeneral),
      diplomacy,
      espionage,
      combat,
      leadership,
      research,
      jedi: {
        probability: Number(row.jediProbability) || 0,
        level: toRange(row.jediLevelBase, row.jediLevelVariance),
        isKnown: toBool(row.jediKnown),
        isTrainer: toBool(row.jediTrainer),
      },
      capabilities,
    };
  });
}

// --- facilities.csv + defenses.csv -> Installation[] --------------------
// Source : export communautaire (même feuille de calcul que
// characters.csv). "Const. Cost" est un coût, pas une durée de
// construction : buildTimeInTurns n'est pas dans la source (cf. warning).
// "Bombardment" (dans stats) = résistance au bombardement de
// l'installation, pas une valeur d'attaque (confirmé par l'utilisateur).
// "Research" (0 = disponible dès le départ, >0 = palier/ordre de
// déblocage — confirmé par l'utilisateur, pas une difficulté) ne
// référence aucune entité de recherche modélisée pour l'instant (même
// situation que unlockedByResearch sur units.json) : défaulté à null,
// la valeur brute est gardée dans stats.Research plutôt que perdue.

const PRODUCTION_FACILITY_NAMES = new Set([
  "construction facility",
  "advanced construction facility",
  "training center",
  "advanced training center",
  "orbital shipyard",
  "advanced orbital shipyard",
]);
const RESOURCE_FACILITY_NAMES = new Set(["mining facility", "refinery"]);

function mapFacilityCategory(name: string): InstallationCategory {
  const normalized = name.trim().toLowerCase();
  if (RESOURCE_FACILITY_NAMES.has(normalized)) return "resources";
  if (PRODUCTION_FACILITY_NAMES.has(normalized)) return "production";
  // Type non reconnu dans les 8 noms de la source actuelle : on ne veut
  // pas classer silencieusement une future installation inconnue.
  warn(`installations.json — type de facility non reconnu : "${name}" — catégorie défaultée à "production"`);
  return "production";
}

// Champs portés par des propriétés explicites du schéma : le reste des
// colonnes numériques (Bombardment, Production Rate, Weapon Power,
// Shield Strength, Research...) part dans `stats`, qui varie selon que
// la ligne vient de facilities.csv ou defenses.csv.
const INSTALLATION_NON_STAT_COLUMNS = new Set(["Type", "Const. Cost", "Maint. Cost"]);

function mapInstallationRow(row: RawRow, category: InstallationCategory): Installation {
  const researchTier = Number(row.Research) || 0;
  if (researchTier > 0) {
    warn(`installations.json — "${row.Type}" nécessite un palier de recherche ${researchTier} dans la source, non modélisé (pas d'entité de recherche référençable) — unlockedByResearch défaulté à null, palier gardé dans stats.Research`);
  }

  const stats: Record<string, number> = {};
  for (const [key, value] of Object.entries(row)) {
    if (INSTALLATION_NON_STAT_COLUMNS.has(key)) continue;
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) stats[key] = parsed;
  }

  return {
    id: slugify(row.Type),
    name: row.Type,
    category,
    cost: Number(row["Const. Cost"]) || 0,
    maintenanceCost: Number(row["Maint. Cost"]) || 0,
    buildTimeInTurns: 1, // absent de la source, cf. warning global au build
    unlockedByResearch: null,
    isStartingInstallation: false, // absent de la source (relève d'un scénario), cf. warning global
    stats,
  };
}

function mapInstallations(facilityRows: RawRow[], defenseRows: RawRow[]): Installation[] {
  if (facilityRows.length + defenseRows.length > 0) {
    warn(`installations.json — buildTimeInTurns défaulté à 1 et isStartingInstallation à false pour ${facilityRows.length + defenseRows.length} installation(s) (absents de la source, relèvent respectivement d'un équilibrage à définir et d'un scénario/sauvegarde)`);
  }
  const facilities = facilityRows.map((row) => mapInstallationRow(row, mapFacilityCategory(row.Type)));
  const defenses = defenseRows.map((row) => mapInstallationRow(row, "defense"));
  return [...facilities, ...defenses];
}

// --- Cohérence croisée ---------------------------------------------------

function checkReferences(
  planets: Planet[],
  sectors: Sector[],
  characters: Character[],
  ships: Ship[],
  troops: Troop[],
  installations: Installation[],
): string[] {
  const errors: string[] = [];
  const sectorIds = new Set(sectors.map((s) => s.id));
  const containerIds = new Set([...planets.map((p) => p.id), ...ships.map((s) => s.id)]);
  const researchSourceIds = new Set([...ships.map((s) => s.id), ...troops.map((t) => t.id), ...installations.map((i) => i.id)]);

  for (const planet of planets) {
    if (!sectorIds.has(planet.sectorId)) {
      errors.push(`planets.json — planète "${planet.id}" référence un sectorId inexistant : "${planet.sectorId}"`);
    }
  }
  for (const character of characters) {
    if (character.containerId !== null && !containerIds.has(character.containerId)) {
      errors.push(`characters.json — personnage "${character.id}" référence un containerId inexistant : "${character.containerId}"`);
    }
  }
  for (const ship of ships) {
    if (ship.unlockedByResearch !== null && !researchSourceIds.has(ship.unlockedByResearch)) {
      errors.push(`ships.json — vaisseau "${ship.id}" référence un unlockedByResearch inexistant : "${ship.unlockedByResearch}"`);
    }
  }
  for (const troop of troops) {
    if (troop.unlockedByResearch !== null && !researchSourceIds.has(troop.unlockedByResearch)) {
      errors.push(`troops.json — troupe "${troop.id}" référence un unlockedByResearch inexistant : "${troop.unlockedByResearch}"`);
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
  const capitalShipRows = readRawRows(rawDir, "capital-ships.json");
  const fighterRows = readRawRows(rawDir, "fighters.json");
  const troopRows = readRawRows(rawDir, "troops.json");
  const specialForceRows = readRawRows(rawDir, "special-forces.json");
  const characterRows = readRawRows(rawDir, "characters.json");
  const facilityRows = readRawRows(rawDir, "facilities.json");
  const defenseRows = readRawRows(rawDir, "defenses.json");

  const systemsByPlanetSectorId = new Map<string, string[]>();
  for (const row of systemRows) {
    const list = systemsByPlanetSectorId.get(row.SectorId) ?? [];
    list.push(row.Id);
    systemsByPlanetSectorId.set(row.SectorId, list);
  }

  const sectors = mapSectors(sectorRows, systemsByPlanetSectorId);
  const planets = mapPlanets(systemRows);
  const ships = mapShips(capitalShipRows, fighterRows);
  const troops = mapTroops(troopRows);
  const specialForces = mapSpecialForces(specialForceRows);
  const characters = mapCharacters(characterRows);
  const installations = mapInstallations(facilityRows, defenseRows);

  // Validation par schéma Zod (structure + unicité des IDs par fichier).
  const results = [
    { name: "sectors.json", data: sectors, schema: SectorListSchema },
    { name: "planets.json", data: planets, schema: PlanetListSchema },
    { name: "characters.json", data: characters, schema: CharacterListSchema },
    { name: "ships.json", data: ships, schema: ShipListSchema },
    { name: "troops.json", data: troops, schema: TroopListSchema },
    { name: "special-forces.json", data: specialForces, schema: SpecialForceListSchema },
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
  const referenceErrors = checkReferences(planets, sectors, characters, ships, troops, installations);
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
