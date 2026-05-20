import { useState, useCallback, useRef } from "react";
import {
  ACCEPTED_FORMATS,
  ImportResult,
  ImportStatus,
  RoomImportRow,
  ScheduleEventImportRow,
  TeacherImportRow,
} from "./import.types";
import { importTeachers, importRooms, importScheduleEvents } from "./importApi";
import { parseFile } from "./importParsers";

const IconUpload = () => (
  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);
const IconCheck = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconX = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconFile = () => (
  <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
const IconInfo = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const IconWarning = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

type TabId = "teachers" | "schedule" | "rooms";
interface FieldInfo { name: string; required: boolean; description: string; }
interface Tab { id: TabId; label: string; description: string; fields: FieldInfo[]; }

// ── Validateur de structure — déclaré avant tout composant qui l'utilise ──

const REQUIRED_FIELDS: Record<TabId, string[]> = {
  teachers: ["email"],
  schedule: ["title", "day", "startTime", "endTime"],
  rooms: ["code", "nom", "capacite"],
};

const FIELD_LABELS: Record<string, string> = {
  email: "email (adresse e-mail)",
  title: "title (intitulé du cours)",
  day: "day (jour de la semaine)",
  startTime: "startTime (heure de début)",
  endTime: "endTime (heure de fin)",
  code: "code (code unique de la salle)",
  nom: "nom (nom de la salle)",
  capacite: "capacite (nombre de places)",
};

const TAB_LABELS: Record<TabId, string> = {
  teachers: "Enseignants",
  schedule: "Emploi du temps",
  rooms: "Salles",
};

function validateRows(rows: unknown[], tabId: TabId): string | null {
  if (!rows.length) return "Le fichier est vide ou n'a pas pu être analysé.";
  const required = REQUIRED_FIELDS[tabId];
  const firstRow = rows[0] as Record<string, unknown>;
  const presentFields = Object.keys(firstRow);
  const missingFields = required.filter((f) => !presentFields.includes(f));
  if (missingFields.length > 0) {
    const missing = missingFields.map((f) => `"${FIELD_LABELS[f] ?? f}"`).join(", ");
    return (
      `Ce fichier ne semble pas adapté à l'onglet "${TAB_LABELS[tabId]}". ` +
      `Les champs obligatoires suivants sont absents : ${missing}. ` +
      `Vérifiez que vous importez le bon fichier dans le bon onglet.`
    );
  }
  return null;
}

// ── Interpréteur d'erreurs backend ───────────────────────────────────────

function parseErrorMessage(raw: string, identifier: string): string {
  try {
    const parsed = JSON.parse(raw);
    const msg: string = parsed.message ?? parsed.error ?? raw;
    const msgLower = msg.toLowerCase();
    if (msgLower.includes("username or email already taken") || msgLower.includes("already taken") || msgLower.includes("duplicate") || parsed.status === 409)
      return `"${identifier}" — Le nom d'utilisateur ou l'adresse e-mail est déjà utilisé(e). Modifiez cet enregistrement dans votre fichier.`;
    if (msgLower.includes("not-null") || msgLower.includes("null"))
      return `"${identifier}" — Un champ obligatoire est manquant ou vide.`;
    if (msgLower.includes("unique") || msgLower.includes("constraint"))
      return `"${identifier}" — Cet enregistrement existe déjà en base de données.`;
    if (parsed.status === 400)
      return `"${identifier}" — Données invalides. Vérifiez le format et les valeurs de cet enregistrement.`;
    if (parsed.status === 500)
      return `"${identifier}" — Erreur serveur inattendue. Réessayez ou contactez l'administrateur.`;
    return `"${identifier}" — ${msg}`;
  } catch {
    return `"${identifier}" — ${raw}`;
  }
}

// ── Définition des onglets ────────────────────────────────────────────────

const TABS: Tab[] = [
  {
    id: "teachers", label: "Enseignants",
    description: "Importez les comptes enseignants. Un mot de passe par défaut sera attribué si absent.",
    fields: [
      { name: "username", required: true, description: "Identifiant unique de connexion" },
      { name: "fullName", required: true, description: "Nom complet (prénom + nom)" },
      { name: "email", required: true, description: "Adresse e-mail institutionnelle" },
      { name: "password", required: false, description: "Mot de passe (défaut : Campushub@2025)" },
      { name: "role", required: true, description: "Doit valoir exactement TEACHER" },
      { name: "department", required: false, description: "Département d'appartenance" },
      { name: "grade", required: false, description: "Grade académique (ex : Professeur)" },
      { name: "officeNumber", required: false, description: "Numéro de bureau" },
    ],
  },
  {
    id: "schedule", label: "Emploi du temps",
    description: "Importez les créneaux de cours en lot. Les créneaux existants seront intégralement remplacés.",
    fields: [
      { name: "title", required: true, description: "Intitulé du cours" },
      { name: "type", required: true, description: "lecture · td · tp · exam · meeting" },
      { name: "day", required: true, description: "Jour (0 = Lundi … 6 = Dimanche)" },
      { name: "startTime", required: true, description: "Heure de début au format HH:mm" },
      { name: "endTime", required: true, description: "Heure de fin au format HH:mm" },
      { name: "roomId", required: false, description: "Identifiant numérique de la salle" },
      { name: "teacherId", required: false, description: "Identifiant numérique de l'enseignant" },
      { name: "subjectCode", required: false, description: "Code matière (ex : ALGO-L2)" },
      { name: "description", required: false, description: "Remarques ou précisions" },
      { name: "academicYear", required: false, description: "Année académique (ex : 2025-2026)" },
      { name: "semester", required: false, description: "Semestre (1 ou 2)" },
    ],
  },
  {
    id: "rooms", label: "Salles",
    description: "Importez le référentiel des salles disponibles sur le campus.",
    fields: [
      { name: "code", required: true, description: "Code unique de la salle (ex : TD-101)" },
      { name: "nom", required: true, description: "Nom d'affichage de la salle" },
      { name: "batiment", required: true, description: "Bâtiment ou bloc (ex : Bloc A)" },
      { name: "capacite", required: true, description: "Nombre de places (entier)" },
      { name: "filiere", required: false, description: "Filière associée (ex : INFO)" },
      { name: "equipements", required: false, description: "Équipements séparés par des virgules" },
    ],
  },
];

// ── Composants UI ─────────────────────────────────────────────────────────

function DropZone({ onFile, status, fileName }: { onFile: (f: File) => void; status: ImportStatus; fileName: string | null }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isLoading = status === "parsing" || status === "uploading";
  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200
        ${dragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"}
        ${isLoading ? "pointer-events-none opacity-60" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
      onClick={() => inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept={ACCEPTED_FORMATS} className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
      {isLoading ? (
        <div className="flex flex-col items-center gap-3 text-blue-600">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm font-medium">{status === "parsing" ? "Analyse du fichier en cours…" : "Envoi vers le serveur…"}</p>
        </div>
      ) : fileName ? (
        <div className="flex flex-col items-center gap-2 text-gray-700">
          <IconFile />
          <p className="text-sm font-semibold mt-1">{fileName}</p>
          <p className="text-xs text-gray-400">Cliquez ou déposez un nouveau fichier pour remplacer</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <IconUpload />
          <div>
            <p className="text-sm font-semibold text-gray-600">Glissez-déposez ou cliquez pour sélectionner</p>
            <p className="text-xs mt-1">Formats acceptés : JSON, CSV — PDF avec contenu JSON embarqué</p>
          </div>
        </div>
      )}
    </div>
  );
}

function FieldsGuide({ fields }: { fields: FieldInfo[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-semibold text-gray-700">
        <span className="flex items-center gap-2"><IconInfo />Champs attendus dans le fichier</span>
        <span className="text-gray-400 text-xs">{open ? "Masquer" : "Afficher"}</span>
      </button>
      {open && (
        <div className="divide-y divide-gray-100">
          {fields.map((f) => (
            <div key={f.name} className="flex items-start gap-3 px-4 py-2.5">
              <span className={`mt-0.5 text-xs font-mono px-2 py-0.5 rounded-full shrink-0
                ${f.required ? "bg-blue-50 text-blue-700 border border-blue-100" : "bg-gray-50 text-gray-500 border border-gray-200"}`}>
                {f.name}
              </span>
              <p className="flex-1 text-xs text-gray-600">{f.description}</p>
              <span className={`text-xs shrink-0 font-medium ${f.required ? "text-red-500" : "text-gray-400"}`}>
                {f.required ? "obligatoire" : "optionnel"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ResultCard({ result }: { result: ImportResult }) {
  return (
    <div className="mt-4 rounded-xl border overflow-hidden">
      <div className="flex">
        <div className="flex-1 p-4 bg-green-50 border-r flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><IconCheck /></span>
          <div>
            <p className="text-xs text-green-600 font-medium uppercase tracking-wide">Succès</p>
            <p className="text-2xl font-bold text-green-700">{result.success}</p>
          </div>
        </div>
        <div className="flex-1 p-4 bg-red-50 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center"><IconX /></span>
          <div>
            <p className="text-xs text-red-500 font-medium uppercase tracking-wide">Échecs</p>
            <p className="text-2xl font-bold text-red-600">{result.failed}</p>
          </div>
        </div>
      </div>
      {result.errors.length > 0 && (
        <div className="p-4 bg-red-50 border-t max-h-52 overflow-y-auto space-y-2">
          <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-3">Enregistrements en échec</p>
          {result.errors.map((err, i) => (
            <div key={i} className="flex items-start gap-2 p-3 bg-white rounded-lg border border-red-100 text-sm text-red-700">
              <span className="mt-0.5 shrink-0 text-red-400"><IconX /></span>
              <span>{err}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PreviewTable({ data }: { data: unknown[] }) {
  if (!data.length) return null;
  const headers = Object.keys(data[0] as object);
  const rows = data.slice(0, 5);
  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200">
      <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 border-b">
        Aperçu — {data.length} enregistrement{data.length > 1 ? "s" : ""} détecté{data.length > 1 ? "s" : ""}
        {data.length > 5 && ` (5 premiers affichés)`}
      </p>
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-50">
            {headers.map((h) => <th key={h} className="px-3 py-2 text-left font-semibold text-gray-600 border-b">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
              {headers.map((h) => (
                <td key={h} className="px-3 py-2 text-gray-700 font-mono">
                  {String((row as Record<string, unknown>)[h] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Composant ImportTab ───────────────────────────────────────────────────

function ImportTab({ tab }: { tab: Tab }) {
  const [status, setStatus] = useState<ImportStatus>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<unknown[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reset = () => { setStatus("idle"); setFileName(null); setPreview([]); setResult(null); setErrorMessage(null); };

  const handleFile = useCallback(async (file: File) => {
    setStatus("parsing"); setFileName(file.name); setResult(null); setErrorMessage(null);
    try {
      const data = await parseFile(file);
      setPreview(data);
      setStatus("idle");
    } catch (e) {
      setErrorMessage((e as Error).message);
      setStatus("error");
    }
  }, []);

  const handleImport = async () => {
    if (!preview.length) return;

    // Validation de structure avant envoi
    const validationError = validateRows(preview, tab.id);
    if (validationError) {
      setErrorMessage(validationError);
      setStatus("error");
      return;
    }

    setStatus("uploading"); setResult(null); setErrorMessage(null);
    try {
      let res: ImportResult;
      if (tab.id === "teachers") res = await importTeachers(preview as TeacherImportRow[]);
      else if (tab.id === "rooms") res = await importRooms(preview as RoomImportRow[]);
      else res = await importScheduleEvents(preview as ScheduleEventImportRow[]);

      res.errors = res.errors.map((raw) => {
        const identifierMatch = raw.match(/^"?([^"—]+)"?\s*—\s*/);
        const identifier = identifierMatch ? identifierMatch[1].trim() : "Enregistrement inconnu";
        const errorPart = raw.replace(/^"?[^"—]+"?\s*—\s*/, "");
        return parseErrorMessage(errorPart, identifier);
      });

      setResult(res);
      setStatus(res.failed === 0 ? "success" : "error");
    } catch (e) {
      setErrorMessage((e as Error).message);
      setStatus("error");
    }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-start justify-between">
        <p className="text-sm text-gray-500 max-w-lg">{tab.description}</p>
        {(fileName || result) && (
          <button onClick={reset} className="text-xs text-gray-400 hover:text-red-500 underline transition-colors shrink-0 ml-4">
            Réinitialiser
          </button>
        )}
      </div>

      <FieldsGuide fields={tab.fields} />
      <DropZone onFile={handleFile} status={status} fileName={fileName} />

      {status === "error" && errorMessage && !result && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <span className="shrink-0 mt-0.5 text-amber-500"><IconWarning /></span>
          <span>{errorMessage}</span>
        </div>
      )}

      {preview.length > 0 && <PreviewTable data={preview} />}

      {preview.length > 0 && status !== "uploading" && !result && (
        <button onClick={handleImport}
          className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors duration-200 flex items-center justify-center gap-2">
          <IconUpload />
          Importer {preview.length} enregistrement{preview.length > 1 ? "s" : ""}
        </button>
      )}

      {result && <ResultCard result={result} />}

      {status === "success" && result && result.failed === 0 && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-medium">
          <IconCheck />
          Import réalisé avec succès — {result.success} enregistrement{result.success > 1 ? "s" : ""} intégré{result.success > 1 ? "s" : ""}.
        </div>
      )}
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────

export default function ImportPage() {
  const [activeTab, setActiveTab] = useState<TabId>("teachers");
  const currentTab = TABS.find((t) => t.id === activeTab)!;
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Import de données</h1>
          <p className="text-gray-500 mt-1">Importez des enseignants, des créneaux horaires ou des salles à partir de fichiers JSON ou CSV.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200 bg-gray-50">
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-6 text-sm font-semibold transition-all duration-150
                  ${activeTab === tab.id ? "text-blue-600 bg-white border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}>
                {tab.label}
              </button>
            ))}
          </div>
          <ImportTab key={activeTab} tab={currentTab} />
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">
          Les enseignants importés reçoivent le mot de passe par défaut{" "}
          <span className="font-mono text-gray-500">Campushub@2025</span>.
          Il leur est conseillé de le modifier dès leur première connexion.
        </p>
      </div>
    </div>
  );
}
