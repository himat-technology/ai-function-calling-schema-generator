export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export function downloadFile(
  content: string,
  filename: string,
  mime = "application/json"
): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function samplePayloadFromDefinition(
  definition: { parameters: { name: string; type: string; required: boolean; enumEnabled?: boolean; enumValues?: string[]; defaultValue?: string }[] }
): string {
  const obj: Record<string, unknown> = {};
  for (const p of definition.parameters) {
    if (!p.name.trim()) continue;
    if (p.defaultValue !== undefined && p.defaultValue !== "") {
      try {
        if (p.type === "string") obj[p.name] = p.defaultValue;
        else obj[p.name] = JSON.parse(p.defaultValue);
      } catch {
        obj[p.name] = p.defaultValue;
      }
      continue;
    }
    if (p.enumEnabled && p.enumValues?.[0]) {
      obj[p.name] = p.enumValues[0];
      continue;
    }
    switch (p.type) {
      case "string":
        obj[p.name] = "example";
        break;
      case "number":
        obj[p.name] = 1.5;
        break;
      case "integer":
        obj[p.name] = 1;
        break;
      case "boolean":
        obj[p.name] = true;
        break;
      case "array":
        obj[p.name] = [];
        break;
      case "object":
        obj[p.name] = {};
        break;
    }
  }
  return JSON.stringify(obj, null, 2);
}
