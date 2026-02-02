import { GenerateApiRequest, GenerateApiResponse, ExportBundle } from "@/types";

/**
 * Call the documentation generation API
 */
export async function callGenerateAPI(request: GenerateApiRequest): Promise<{
  bundle: ExportBundle;
}> {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData: GenerateApiResponse = await response.json();
    throw new Error(errorData.error || `API error: ${response.statusText}`);
  }

  const data: GenerateApiResponse = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Unknown API error");
  }

  if (!data.data) {
    throw new Error("No data returned from API");
  }

  return data.data;
}

/**
 * Validate project name
 */
export function validateProjectName(name: string): boolean {
  return name.trim().length > 0 && name.trim().length <= 100;
}

/**
 * Validate hex color
 */
export function validateHexColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color);
}

/**
 * Validate code input
 */
export function validateCodeInput(code: string): boolean {
  return code.trim().length > 0 && code.trim().length <= 50000;
}

/**
 * Format file size in bytes to readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Create a sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9]/gi, "-")
    .replace(/-+/g, "-")
    .toLowerCase()
    .slice(0, 50);
}

/**
 * Generate timestamp-based filename
 */
export function generateFilename(
  projectName: string,
  extension: string = "zip",
): string {
  const timestamp = new Date().toISOString().split("T")[0];
  const sanitized = sanitizeFilename(projectName);
  return `${sanitized}-docs-${timestamp}.${extension}`;
}
