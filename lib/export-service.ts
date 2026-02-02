import JSZip from "jszip";
import { ExportBundle, DocumentationFile } from "@/types";

/**
 * Create a ZIP bundle with all documentation files
 * Structure:
 * - index.html (root)
 * - themes/docs.css
 * - _sidebar.md
 * - *.md (all generated documentation files)
 */
export async function createZipBundle(bundle: ExportBundle): Promise<Blob> {
  const zip = new JSZip();

  try {
    // Add index.html to root
    zip.file("index.html", bundle.indexHtml);

    // Create themes folder and add docs.css
    zip.folder("themes")?.file("docs.css", bundle.themeCss);

    // Add _sidebar.md (template for navigation)
    const sidebarContent = generateSidebar(bundle.markdownFiles);
    zip.file("_sidebar.md", sidebarContent);

    // Add all markdown documentation files
    bundle.markdownFiles.forEach((file) => {
      zip.file(file.name, file.content);
    });

    // Generate and return ZIP as blob
    const blob = await zip.generateAsync({ type: "blob" });
    return blob;
  } catch (error) {
    console.error("[ExportService] Error creating ZIP:", error);
    throw new Error("Failed to create documentation package");
  }
}

/**
 * Generate sidebar navigation from markdown files
 */
function generateSidebar(markdownFiles: DocumentationFile[]): string {
  let sidebar = "# Navigation\n\n";

  const sortedFiles = [...markdownFiles].sort((a, b) => {
    // Prioritize README.md
    if (a.name === "README.md") return -1;
    if (b.name === "README.md") return 1;
    // Then alphabetical
    return a.name.localeCompare(b.name);
  });

  sortedFiles.forEach((file) => {
    const displayName = file.name.replace(".md", "").replace(/_/g, " ");
    const link = `/${file.name}`;
    sidebar += `- [${displayName}](${link})\n`;
  });

  sidebar += `\n---\n\n- [DevRead.me](https://devreadme.jumpstone4477.de/)\n`;
  return sidebar;
}

/**
 * Trigger download of the ZIP bundle in the browser
 * This function should only be called on the client side
 */
export function downloadBundle(blob: Blob, projectName: string): void {
  // Create a temporary URL for the blob
  const url = window.URL.createObjectURL(blob);

  // Create a temporary anchor element
  const link = document.createElement("a");
  link.href = url;
  link.download = `${projectName}-docs-${Date.now()}.zip`;

  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  window.URL.revokeObjectURL(url);

  console.log(`[ExportService] Download triggered: ${link.download}`);
}

/**
 * Create bundle and prepare for download (server-side preparation)
 */
export async function prepareBundleForDownload(
  bundle: ExportBundle,
): Promise<Buffer> {
  const blobZip = await createZipBundle(bundle);
  const arrayBuffer = await blobZip.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Validate bundle contents before export
 */
export function validateBundle(bundle: ExportBundle): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!bundle.indexHtml || bundle.indexHtml.trim().length === 0) {
    errors.push("HTML template is empty");
  }

  if (!bundle.themeCss || bundle.themeCss.trim().length === 0) {
    errors.push("CSS theme is empty");
  }

  if (!bundle.markdownFiles || bundle.markdownFiles.length === 0) {
    errors.push("No markdown files in bundle");
  }

  // Check for required files
  const fileNames = bundle.markdownFiles.map((f) => f.name);
  if (!fileNames.includes("README.md")) {
    errors.push("Missing README.md");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate bundle size for progress indication
 */
export function calculateBundleSize(bundle: ExportBundle): number {
  let totalSize = 0;

  // Estimate size of HTML and CSS
  totalSize += new Blob([bundle.indexHtml]).size;
  totalSize += new Blob([bundle.themeCss]).size;

  // Add size of all markdown files
  bundle.markdownFiles.forEach((file) => {
    totalSize += new Blob([file.content]).size;
  });

  return totalSize;
}
