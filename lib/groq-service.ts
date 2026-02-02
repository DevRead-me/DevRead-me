import { Groq } from "groq-sdk";
import { GroqGenerationResult } from "@/types";

const MODEL = "llama-3.3-70b-versatile";

/**
 * Initialize Groq client with API key
 */
function getGroqClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY environment variable is not set. Please add it to your .env.local file.",
    );
  }

  return new Groq({
    apiKey,
  });
}

/**
 * Step 1: Analyze the input code and create a documentation structure
 */
export async function analyzeCode(
  projectName: string,
  codeInput: string,
  readmeContent?: string,
): Promise<string> {
  const groq = getGroqClient();

  const analysisPrompt = `You are an expert technical documentation writer. Analyze the following project information and code snippets, then create a comprehensive documentation structure.

Project Name: ${projectName}
${readmeContent ? `Existing README:\n${readmeContent}\n\n` : ""}
Code Input:
\`\`\`
${codeInput}
\`\`\`

Provide a JSON response with this structure:
{
  "structure": ["File1.md", "File2.md", ...],
  "summary": "Brief project description",
  "keyFeatures": ["Feature 1", "Feature 2", ...]
}`;

  const message = await groq.chat.completions.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: analysisPrompt,
      },
    ],
  });

  const content = message.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Unexpected response format from Groq API");
  }

  return content;
}

/**
 * Step 2: Generate markdown documentation files
 */
export async function generateDocumentation(
  projectName: string,
  codeInput: string,
  analysis: string,
): Promise<GroqGenerationResult> {
  const groq = getGroqClient();

  const generationPrompt = `You are an expert technical documentation writer. Based on the project analysis below, generate comprehensive markdown documentation files.

Project Name: ${projectName}

Analysis Results:
${analysis}

Code Context:
\`\`\`
${codeInput}
\`\`\`

Generate documentation in the following JSON format. Create at least these files: README.md, SETUP.md, API.md, FEATURES.md, and TROUBLESHOOTING.md
Return ONLY valid JSON in this format:
{
  "files": {
    "README.md": "# ${projectName}\\n\\n...",
    "SETUP.md": "# Setup Guide\\n\\n...",
    "API.md": "# API Reference\\n\\n...",
    "FEATURES.md": "# Features\\n\\n...",
    "TROUBLESHOOTING.md": "# Troubleshooting\\n\\n..."
  },
  "analysis": {
    "structure": ["README.md", "SETUP.md", ...],
    "summary": "Project summary",
    "keyFeatures": ["Feature 1", ...]
  }
}

Guidelines for Markdown Generation:
- Use clear hierarchies with H1, H2, H3 headings
- Include code examples where relevant
- Provide installation instructions
- Document API endpoints or functions
- Add troubleshooting sections
- Include links between related documents
- Make content beginner-friendly but technically accurate
- Use proper markdown formatting (code blocks, lists, tables)`;

  const message = await groq.chat.completions.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: generationPrompt,
      },
    ],
  });

  const content = message.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Unexpected response format from Groq API");
  }

  try {
    // Extract JSON from response (handle cases where model returns extra text)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const result: GroqGenerationResult = JSON.parse(jsonMatch[0]);
    return result;
  } catch (error) {
    console.error("Failed to parse Groq response:", content);
    throw new Error("Failed to parse documentation from Groq API");
  }
}

/**
 * Generate a simple, comprehensive README.md only
 */
export async function generateSimpleReadme(
  projectName: string,
  description: string,
  codeInput: string,
): Promise<GroqGenerationResult> {
  const groq = getGroqClient();

  const simplePrompt = `You are an expert technical documentation writer. Generate a comprehensive, well-structured README.md file for the following project.

Project Name: ${projectName}
Description: ${description || "No description provided"}

Code/Project Information:
\`\`\`
${codeInput}
\`\`\`

Create a SINGLE, comprehensive README.md that includes:
- Project title and description
- Key features
- Installation/setup instructions
- Usage examples with code snippets
- Configuration options
- API documentation (if applicable)
- Troubleshooting tips
- Contributing guidelines (if relevant)
- License information

Return ONLY valid JSON in this exact format:
{
  "files": {
    "README.md": "# ${projectName}\\n\\n## Description\\n\\n...\\n\\n## Features\\n\\n...\\n\\n## Installation\\n\\n...\\n\\n## Usage\\n\\n...\\n\\n## Configuration\\n\\n...\\n\\n## Troubleshooting\\n\\n..."
  },
  "analysis": {
    "structure": ["README.md"],
    "summary": "Comprehensive single-file documentation",
    "keyFeatures": ["Feature 1", "Feature 2"]
  }
}

Make the README comprehensive, professional, and include all necessary information in one file.`;

  const message = await groq.chat.completions.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: simplePrompt,
      },
    ],
  });

  const content = message.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No content received from Groq API");
  }

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const result: GroqGenerationResult = JSON.parse(jsonMatch[0]);
    return result;
  } catch (error) {
    console.error("Failed to parse Groq response:", content);
    throw new Error("Failed to parse README from Groq API");
  }
}

/**
 * Main orchestration: Analyze → Generate
 */
export async function generateCompleteDocumentation(
  projectName: string,
  codeInput: string,
  readmeContent?: string,
): Promise<GroqGenerationResult> {
  try {
    // Step 1: Analyze
    console.log("[Groq] Analyzing code and creating structure...");
    const analysis = await analyzeCode(projectName, codeInput, readmeContent);
    console.log("[Groq] Analysis complete");

    // Step 2: Generate
    console.log("[Groq] Generating documentation files...");
    const result = await generateDocumentation(
      projectName,
      codeInput,
      analysis,
    );
    console.log("[Groq] Documentation generation complete");

    return result;
  } catch (error) {
    console.error("[Groq] Error:", error);
    throw error;
  }
}
