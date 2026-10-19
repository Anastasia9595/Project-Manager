/** Byte Order Mark – damit Excel Umlaute in UTF-8-CSV-Dateien richtig erkennt. */
const UTF8_BOM = "﻿"

/** Bietet `content` im Browser als Datei zum Speichern an. */
export function downloadCsvFile(fileName: string, content: string): void {
  const blob = new Blob([UTF8_BOM, content], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  link.click()
  // Erst nach dem Klick freigeben – sofortiges Freigeben bricht in manchen
  // Browsern den Download ab.
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
