import { TemplateConfig, TemplateProcessResult } from "@/types";
import fs from "fs";
import path from "path";

/**
 * Read template files from example-docs
 */
async function readTemplateFiles(includeSidebar: boolean): Promise<{
  htmlContent: string;
  cssContent: string;
}> {
  try {
    const baseDir = process.cwd();
    const templateDir = includeSidebar ? "with-sidebar" : "without-sidebar";
    const htmlPath = path.join(
      baseDir,
      "example-docs",
      templateDir,
      "index.html",
    );
    const cssPath = path.join(
      baseDir,
      "example-docs",
      templateDir,
      "themes",
      "docs.css",
    );
    const noSidebarCssPath = path.join(
      baseDir,
      "example-docs",
      templateDir,
      "themes",
      "no-sidebar.css",
    );

    const htmlContent = fs.readFileSync(htmlPath, "utf-8");
    let cssContent = fs.readFileSync(cssPath, "utf-8");

    if (!includeSidebar && fs.existsSync(noSidebarCssPath)) {
      const noSidebarCss = fs.readFileSync(noSidebarCssPath, "utf-8");
      cssContent = `${cssContent}\n\n${noSidebarCss}`;
    }

    return { htmlContent, cssContent };
  } catch (error) {
    console.error("Error reading template files:", error);
    throw new Error("Failed to read template files");
  }
}

/**
 * Process index.html with custom configuration
 * Replaces markers labeled "// Bearbeitung" with user settings
 */
function processHtmlTemplate(
  htmlContent: string,
  config: TemplateConfig,
): string {
  let processed = htmlContent;

  // Replace project name
  processed = processed.replace(
    /name:\s*"[^"]*",\s*\/\/\s*Bearbeitung/,
    `name: "${config.projectName}", // Bearbeitung`,
  );

  // Replace repository URL
  processed = processed.replace(
    /repo:\s*"[^"]*",\s*\/\/\s*Bearbeitung/,
    `repo: "${config.repoUrl}", // Bearbeitung`,
  );

  // Replace theme color
  processed = processed.replace(
    /themeColor:\s*"[^"]*",\s*\/\/\s*Bearbeitung/,
    `themeColor: "${config.themeColor}", // Bearbeitung`,
  );

  // Handle sidebar configuration
  if (!config.includeSidebar) {
    processed = processed.replace(
      /loadSidebar:\s*true,/,
      "loadSidebar: false,",
    );

    processed = processed.replace(
      /\s*<link[^>]*href="\/themes\/no-sidebar\.css"[^>]*>\s*/i,
      "\n",
    );
  }

  return processed;
}

/**
 * Process docs.css with custom theme color
 * Replaces {colorcode} placeholder with user's accent color
 */
function processCssTemplate(cssContent: string, themeColor: string): string {
  // Replace both primary and secondary accent colors
  let processed = cssContent.replace(/{colorcode}/g, themeColor);

  // Additional color variations (optional: lighter/darker versions)
  // These could be used for hover states or backgrounds
  return processed;
}

/**
 * Calculate color variations for better theme integration
 */
function generateColorVariations(hexColor: string): {
  primary: string;
  light: string;
  dark: string;
} {
  // Basic hex color validation and conversion
  const hex = hexColor.replace("#", "");

  if (!/^[0-9A-F]{6}$/i.test(hex)) {
    return {
      primary: "#D4AF37", // fallback to default gold
      light: "#E8C547",
      dark: "#B89F2E",
    };
  }

  return {
    primary: `#${hex}`,
    light: lightenHex(`#${hex}`, 20),
    dark: darkenHex(`#${hex}`, 20),
  };
}

/**
 * Lighten a hex color by percentage
 */
function lightenHex(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) + amt) & 0x00ff);
  const B = Math.min(255, (num & 0x0000ff) + amt);

  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

/**
 * Darken a hex color by percentage
 */
function darkenHex(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) - amt) & 0x00ff);
  const B = Math.max(0, (num & 0x0000ff) - amt);

  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

/**
 * Main function: Process templates with configuration
 */
export async function processTemplates(
  config: TemplateConfig,
): Promise<TemplateProcessResult> {
  try {
    // Read template files based on sidebar configuration
    const { htmlContent, cssContent } = await readTemplateFiles(
      config.includeSidebar,
    );

    // Process templates
    const processedHtml = processHtmlTemplate(htmlContent, config);
    const processedCss = processCssTemplate(cssContent, config.themeColor);

    console.log("[TemplateProcessor] Templates processed successfully");
    console.log(`  - Project: ${config.projectName}`);
    console.log(`  - Color: ${config.themeColor}`);
    console.log(
      `  - Sidebar: ${config.includeSidebar ? "enabled" : "disabled"}`,
    );
    console.log(
      `  - Template: ${config.includeSidebar ? "with-sidebar" : "without-sidebar"}`,
    );

    return {
      htmlContent: processedHtml,
      cssContent: processedCss,
    };
  } catch (error) {
    console.error("[TemplateProcessor] Error:", error);
    throw error;
  }
}

export { generateColorVariations };
