import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export interface ParsedEvent {
  title: string;
  type: string;
  professor: string;
  room: string;
  startTime: string;
  endTime: string;
  day: number;
  description: string;
  subjectCode: string;
  level: string;
  filiere: string;
}

export interface ParseAnomaly {
  page: number;
  rawText: string;
  reason: string;
}

export interface ParseResult {
  events: ParsedEvent[];
  anomalies: ParseAnomaly[];
}

const DAY_HEADERS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const TIME_RANGE_REGEX = /(\d{1,2})[hH](\d{0,2})\s*[-–]\s*(\d{1,2})[hH](\d{0,2})/;
const COURSE_CODE_REGEX = /(?:TD\s+|TP\s+)?([A-Z]{2,5}\s?\d{3,4}[A-Z]?)\b/;
const ROOM_CODE_REGEX = /\b([A-Z]+\d{2,4}|A[I]{1,3}|S\d{2,3}|E\d{3}|R\d{3})\b/;

function parseHour(h: string, m: string): string {
  return `${h.padStart(2, "0")}:${(m || "00").padStart(2, "0")}`;
}

function parseTimeRange(text: string): { startTime: string; endTime: string } | null {
  const match = text.match(TIME_RANGE_REGEX);
  if (!match) return null;
  return {
    startTime: parseHour(match[1], match[2]),
    endTime: parseHour(match[3], match[4]),
  };
}

function detectType(text: string): string {
  const u = text.toUpperCase();
  if (/\bTD\b/.test(u)) return "td";
  if (/\bTP\b/.test(u)) return "tp";
  return "lecture";
}

function extractCourseCode(text: string): string {
  const match = text.match(COURSE_CODE_REGEX);
  return match ? match[1].trim() : "";
}

function extractRoom(text: string): string {
  const match = text.match(ROOM_CODE_REGEX);
  return match ? match[1].trim() : "";
}

function extractProfessor(text: string): string {
  const tokens = text.split(/[\n\/]/).map(t => t.trim()).filter(Boolean);
  const names = tokens.filter(t =>
    /^[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ][A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ\s\-']{2,}$/.test(t) &&
    !DAY_HEADERS.includes(t) &&
    !/^(GRPE|GRP|GROUPE|TD|TP|CM|NB|UE|BIOS|GEOS|INFO|CHIM|PHYS|MAT|BCH|BOA|BOV|MIB|ENR|PPE|ENG|FRA|DE|ET|PAUSE|CLASSES|GOOGLE|TOUT|SOUS|NIVEAU|FILIERE|ANNEE|SEMESTRE|GP\d|AI{1,3}|POLY)/.test(t) &&
    t.length > 2
  );
  return names.join(" / ") || "";
}

function extractLevel(courseCode: string): string {
  const match = courseCode.replace(/\s+/g, "").match(/[A-Z]{2,5}(\d)/);
  if (!match) return "";
  const n = parseInt(match[1]);
  if (n === 1) return "L1";
  if (n === 2) return "L2";
  if (n === 3) return "L3";
  if (n === 4) return "M1";
  if (n === 5) return "M2";
  return "";
}

function extractFiliere(texts: string[]): string {
  const fullText = texts.join(" ").toUpperCase();
  if (/\bINFO\b|INFORMATIQUE/.test(fullText)) return "INFO";
  if (/\bBIOS\b|BIOSCIENCES/.test(fullText)) return "BIOS";
  if (/\bGEOS\b|GEOSCIENCES/.test(fullText)) return "GEOS";
  if (/\bBCH\b|BIOCHIMIE/.test(fullText)) return "BCH";
  if (/\bBOV\b|\bBOA\b/.test(fullText)) return "BOV";
  if (/\bPHYS\b|PHYSIQUE/.test(fullText)) return "PHY";
  if (/\bMATH\b|MATHEMATIQUE/.test(fullText)) return "MAT";
  if (/\bCHIM\b|CHIMIE/.test(fullText)) return "CHIM";
  return "";
}

interface TextItem {
  str: string;
  x: number;
  y: number;
}

function groupByY(items: TextItem[], tolerance = 6): Map<number, TextItem[]> {
  const groups = new Map<number, TextItem[]>();
  for (const item of items) {
    if (!item.str.trim()) continue;
    let found: number | null = null;
    for (const key of groups.keys()) {
      if (Math.abs(key - item.y) <= tolerance) { found = key; break; }
    }
    if (found !== null) groups.get(found)!.push(item);
    else groups.set(item.y, [item]);
  }
  return groups;
}

// Détecte les colonnes jours dans TOUS les items de la page
function detectColumnBoundaries(items: TextItem[]): number[] {
  const dayItems = items.filter(i =>
    DAY_HEADERS.some(d => i.str.trim().toLowerCase().includes(d.toLowerCase()))
  );
  if (dayItems.length < 2) return [];
  return dayItems.map(i => i.x).sort((a, b) => a - b);
}

function getDayIndex(x: number, cols: number[]): number {
  for (let i = cols.length - 1; i >= 0; i--) {
    if (x >= cols[i] - 10) return i;
  }
  return -1;
}

async function parsePage(
  page: any,
  pageNum: number,
  sectionLabel: string,
  filiere: string
): Promise<{ events: ParsedEvent[]; anomalies: ParseAnomaly[] }> {
  const events: ParsedEvent[] = [];
  const anomalies: ParseAnomaly[] = [];

  const textContent = await page.getTextContent();
  const items: TextItem[] = textContent.items
    .filter((i: any) => i.str?.trim())
    .map((i: any) => ({ str: i.str.trim(), x: i.transform[4], y: i.transform[5] }));

  if (!items.length) return { events, anomalies };

  const columnBoundaries = detectColumnBoundaries(items);
  if (columnBoundaries.length < 2) return { events, anomalies };

  const lineGroups = groupByY(items);
  const sortedY = Array.from(lineGroups.keys()).sort((a, b) => b - a);

  let currentTime: { startTime: string; endTime: string } | null = null;
  const cellBuffer = new Map<number, string[]>();

  const flushCells = () => {
    if (!currentTime) return;
    for (const [dayIdx, lines] of cellBuffer.entries()) {
      const raw = lines.join("\n").trim();
      if (!raw || raw.length < 3) continue;
      if (/^(NB\s*:|UE\s|CLASSES\s|GOOGLE|PAUSE|ECOLE)/i.test(raw)) continue;

      const courseCode = extractCourseCode(raw);
      if (!courseCode) {
        anomalies.push({ page: pageNum, rawText: raw, reason: "Code cours non détecté" });
        continue;
      }

      const room = extractRoom(raw);
      const professor = extractProfessor(raw);
      const type = detectType(raw);

      if (!room) anomalies.push({
        page: pageNum, rawText: raw,
        reason: `Salle manquante pour "${courseCode}" — importé sans salle`,
      });
      if (!professor) anomalies.push({
        page: pageNum, rawText: raw,
        reason: `Enseignant non identifié pour "${courseCode}" — importé`,
      });

      events.push({
        title: courseCode,
        type,
        professor,
        room,
        startTime: currentTime.startTime,
        endTime: currentTime.endTime,
        day: dayIdx,
        description: sectionLabel,
        subjectCode: courseCode.replace(/\s+/g, ""),
        level: extractLevel(courseCode),
        filiere: filiere,
      });
    }
    cellBuffer.clear();
  };

  for (const y of sortedY) {
    const lineItems = lineGroups.get(y)!.sort((a, b) => a.x - b.x);
    const lineText = lineItems.map(i => i.str).join(" ").trim();

    if (/EMPLOI|SEMESTRE|UNIVERSITE|FACULTE|Division/i.test(lineText)) continue;
    if (/^Heures$/i.test(lineText.trim())) continue;
    if (lineItems.every(i => DAY_HEADERS.some(d => i.str.toLowerCase().includes(d.toLowerCase())))) continue;

    const time = parseTimeRange(lineText);
    if (time) {
      flushCells();
      currentTime = time;
      continue;
    }

    if (!currentTime) continue;

    for (const item of lineItems) {
      if (DAY_HEADERS.some(d => item.str.toLowerCase().includes(d.toLowerCase()))) continue;
      if (/^Heures$/i.test(item.str)) continue;

      const dayIdx = getDayIndex(item.x, columnBoundaries);
      if (dayIdx < 0 || dayIdx >= 7) continue;
      if (!cellBuffer.has(dayIdx)) cellBuffer.set(dayIdx, []);
      cellBuffer.get(dayIdx)!.push(item.str);
    }
  }

  flushCells();
  return { events, anomalies };
}

export async function parsePdfTimetable(file: File): Promise<ParseResult> {
  const allEvents: ParsedEvent[] = [];
  const allAnomalies: ParseAnomaly[] = [];

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

const firstTexts = textContent.items
  .map((i: any) => i.str?.trim()).filter(Boolean) as string[];

    const filiere = extractFiliere(firstTexts);

    let sectionLabel = `Page ${pageNum}`;
    for (const t of firstTexts) {
      if (/\b(INFO|INF|BIOS|GEOS|BCH|BOV|PHYS|MAT|CHIM)\b.{0,15}(L[123]|M[12])/i.test(t)) {
        sectionLabel = t.replace(/\s+/g, " ").trim();
        break;
      }
      if (/\b(BIOS|GEOS|INFO|CHIM|PHYS|MAT|BCH|BOA|BOV|MIB|ENR|STU)\b/i.test(t) &&
          /L[123]|M[12]|\bL1\b|\bL2\b/i.test(t)) {
        sectionLabel = t.replace(/\s+/g, " ").trim();
        break;
      }
    }

    const { events, anomalies } = await parsePage(page, pageNum, sectionLabel, filiere);
    allEvents.push(...events);
    allAnomalies.push(...anomalies);
  }

  const seen = new Set<string>();
  const uniqueEvents = allEvents.filter(e => {
    const key = `${e.subjectCode}-${e.day}-${e.startTime}-${e.room}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return { events: uniqueEvents, anomalies: allAnomalies };
}
