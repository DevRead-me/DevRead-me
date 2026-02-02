import { NextRequest, NextResponse } from "next/server";
import { generateCompleteDocumentation } from "@/lib/groq-service";
import { processTemplates } from "@/lib/template-processor";
import { validateBundle } from "@/lib/export-service";
import {
  GenerateApiRequest,
  GenerateApiResponse,
  ExportBundle,
  DocumentationFile,
} from "@/types";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Check for API key first
    if (!process.env.GROQ_API_KEY) {
      console.error("[API] GROQ_API_KEY environment variable not set");
      return NextResponse.json(
        {
          success: false,
          error:
            "Server configuration error: GROQ_API_KEY not set. Please contact the administrator.",
        } as GenerateApiResponse,
        { status: 500 },
      );
    }

    // Parse request body
    const body: GenerateApiRequest = await request.json();

    // Validate input
    const validation = validateInput(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.errors.join(", "),
        } as GenerateApiResponse,
        { status: 400 },
      );
    }

    console.log(`[API] Generation request: ${body.projectName}`);

    // Step 1: Generate documentation using Groq
    console.log("[API] Step 1: Generating documentation with Groq...");
    const generationResult = body.generateFullDocs
      ? await generateCompleteDocumentation(body.projectName, body.codeInput)
      : await (
          await import("@/lib/groq-service")
        ).generateSimpleReadme(
          body.projectName,
          body.description || "",
          body.codeInput,
        );

    // Step 2: Convert Groq results to DocumentationFile array
    console.log("[API] Step 2: Converting generated files...");
    const markdownFiles: DocumentationFile[] = Object.entries(
      generationResult.files,
    ).map(([name, content]) => ({
      name,
      content,
      path: `/${name}`,
    }));

    // Step 3: Process templates
    console.log("[API] Step 3: Processing templates...");
    const templateConfig = {
      projectName: body.projectName,
      repoUrl: "", // Could be enhanced to extract from input
      themeColor: body.accentColor,
      includeSidebar: body.includeSidebar,
    };

    const processedTemplates = await processTemplates(templateConfig);

    // Step 4: Create export bundle
    console.log("[API] Step 4: Creating export bundle...");
    const bundle: ExportBundle = {
      indexHtml: processedTemplates.htmlContent,
      themeCss: processedTemplates.cssContent,
      markdownFiles,
    };

    // Validate bundle
    const bundleValidation = validateBundle(bundle);
    if (!bundleValidation.valid) {
      console.error("[API] Bundle validation failed:", bundleValidation.errors);
      return NextResponse.json(
        {
          success: false,
          error: `Bundle validation failed: ${bundleValidation.errors.join(", ")}`,
        } as GenerateApiResponse,
        { status: 500 },
      );
    }

    console.log(
      `[API] Generation complete. Created ${markdownFiles.length} documentation files.`,
    );

    // Return success response with bundle data
    return NextResponse.json(
      {
        success: true,
        data: {
          bundle,
        },
      } as GenerateApiResponse,
      { status: 200 },
    );
  } catch (error) {
    console.error("[API] Generation error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        success: false,
        error: `Generation failed: ${errorMessage}`,
      } as GenerateApiResponse,
      { status: 500 },
    );
  }
}

/**
 * Validate incoming request
 */
function validateInput(body: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!body.projectName || body.projectName.trim().length === 0) {
    errors.push("Project name is required");
  }

  if (!body.codeInput || body.codeInput.trim().length === 0) {
    errors.push("Code input is required");
  }

  if (!body.accentColor || !/^#[0-9A-F]{6}$/i.test(body.accentColor)) {
    errors.push("Valid hex color code is required");
  }

  if (typeof body.includeSidebar !== "boolean") {
    errors.push("includeSidebar must be a boolean");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Handle other HTTP methods
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      error: "Method not allowed. Use POST to generate documentation.",
    } as GenerateApiResponse,
    { status: 405 },
  );
}
