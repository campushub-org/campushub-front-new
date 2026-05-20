import Papa from "papaparse";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export async function parseJSON<T>(file: File): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(Array.isArray(data) ? data : [data]);
      } catch {
        reject(new Error("JSON malformé : impossible de l'analyser."));
      }
    };
    reader.onerror = () => reject(new Error("Échec de lecture du fichier JSON."));
    reader.readAsText(file);
  });
}

export async function parseCSV<T>(file: File): Promise<T[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<T>(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          const msg = results.errors.map((e) => e.message).join(", ");
          reject(new Error(`Erreurs CSV : ${msg}`));
        } else {
          resolve(results.data);
        }
      },
      error: (err) => reject(new Error(err.message)),
    });
  });
}

async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const rawLines: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    content.items.forEach((item) => {
      if (!("str" in item)) return;
      const str = item.str.trim();
      if (str) rawLines.push(str);
    });
  }
  return rawLines.join("\n");
}

export async function parsePDF<T>(file: File): Promise<T[]> {
  const text = await extractTextFromPDF(file);

  // Tentative JSON embarqué
  const cleaned = text.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
  const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    try {
      const data = JSON.parse(jsonMatch[0]);
      return Array.isArray(data) ? data : [data];
    } catch { /* fallthrough */ }
  }

  // Reconstitution CSV
  const rawLines = text.split("\n").filter(Boolean);
  if (rawLines.length < 2) {
    throw new Error(
      "Format PDF non reconnu. Pour les PDF, intégrez un tableau JSON valide dans le document. " +
      "Préférez les formats CSV ou JSON pour un import plus fiable."
    );
  }

  const header = rawLines[0];
  const expectedColumns = header.split(",").length;
  const reconstructed: string[] = [header];
  let buffer = "";

  for (let i = 1; i < rawLines.length; i++) {
    buffer = buffer ? `${buffer} ${rawLines[i]}` : rawLines[i];
    if (buffer.split(",").length >= expectedColumns) {
      reconstructed.push(buffer.trim());
      buffer = "";
    }
  }
  if (buffer.trim()) reconstructed.push(buffer.trim());

  return new Promise((resolve, reject) => {
    Papa.parse<T>(reconstructed.join("\n"), {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => resolve(results.data),
      error: (err) => reject(new Error(err.message)),
    });
  });
}

export async function parseFile<T>(file: File): Promise<T[]> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "json": return parseJSON<T>(file);
    case "csv": return parseCSV<T>(file);
    case "pdf": return parsePDF<T>(file);
    default: throw new Error(`Format non pris en charge : .${ext}`);
  }
}
