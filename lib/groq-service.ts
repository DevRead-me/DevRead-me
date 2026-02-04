import { Groq } from "groq-sdk";
import { GroqGenerationResult, AudienceType, ToneStyle } from "@/types";

const MODEL = "llama-3.3-70b-versatile";

/**
 * Get tone style specific instructions for documentation generation
 */
function getToneContext(toneStyle: ToneStyle): string {
  const tones: Record<ToneStyle, string> = {
    casual: `
TONE: Casual and relaxed
- Use conversational language as if speaking to a friend
- Use contractions (it's, that's, we're)
- Avoid overly formal phrases
- Include informal expressions and light humor where appropriate
- Use "we" and "you" frequently
- Keep sentences short and punchy
- Make it feel approachable and fun`,
    professional: `
TONE: Professional and formal
- Use formal language and complete sentences
- Avoid contractions and slang
- Use precise terminology
- Maintain a business-like tone throughout
- Use passive voice where appropriate
- Avoid humor or casual expressions
- Sound authoritative and well-researched`,
    friendly: `
TONE: Warm and friendly
- Use warm, welcoming language
- Be encouraging and supportive
- Use "we" and "your" to create connection
- Include helpful tips and positive feedback
- Use simple, everyday language
- Be empathetic to user challenges
- Make it feel like talking to a helpful friend`,
    technical: `
TONE: Technical and precise
- Use exact technical terminology
- Be highly specific and detailed
- Avoid simplifications or metaphors
- Use passive voice for objectivity
- Include technical specifications
- Focus on accuracy over accessibility
- Sound authoritative and expert-level`,
    academic: `
TONE: Scholarly and structured
- Use formal academic language
- Include proper citations and references
- Use structured reasoning and argumentation
- Avoid colloquialisms
- Use third-person perspective
- Include detailed explanations and context
- Sound scholarly and well-researched`,
  };

  return tones[toneStyle];
}

/**
 * Get audience-specific context for documentation generation
 */
function getAudienceContext(audience: AudienceType): string {
  const contexts: Record<AudienceType, string> = {
    developer: `
You are writing documentation for DEVELOPERS who have technical expertise.
- Include technical implementation details and architecture
- Reference code files and functions specifically
- Include API signatures and type definitions
- Assume knowledge of programming concepts
- Include contribution guidelines and code style
- Cover advanced features and configurations
- Add debugging and troubleshooting for developers
- Style: Similar to CONTRIBUTING.md files`,
    team: `
You are writing documentation for TEAM MEMBERS with varying technical levels.
- Balance technical and user-friendly content
- Include both "what" and "how" explanations
- Provide workflow and process documentation
- Include best practices and tips
- Add common issues and solutions
- Use clear examples and screenshots descriptions
- Assume some technical knowledge but explain jargon
- Style: Professional and collaborative`,
    enduser: `
You are writing documentation for END USERS with little/no technical background.
- Use simple, everyday language
- Avoid technical jargon or explain it clearly
- Include step-by-step instructions with screenshots descriptions
- Focus on common tasks and workflows
- Add visual hierarchy with lots of headings
- Use analogies and simple explanations
- Include FAQ section for common questions
- Emphasize what the user can DO, not technical implementation
- Style: Friendly, helpful, and accessible`,
  };

  return contexts[audience];
}

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
  audience: AudienceType = "developer",
  toneStyle: ToneStyle = "professional",
): Promise<string> {
  const groq = getGroqClient();

  const analysisPrompt = `You are an expert technical documentation writer. ${getAudienceContext(audience)}

${getToneContext(toneStyle)}

Analyze the following project information and code snippets, then create a comprehensive documentation structure.

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
  audience: AudienceType = "developer",
  toneStyle: ToneStyle = "professional",
): Promise<GroqGenerationResult> {
  const groq = getGroqClient();

  const fileGuidance: Record<AudienceType, string> = {
    developer: `Create files like: README.md, CONTRIBUTING.md, ARCHITECTURE.md, API.md, SETUP.md (advanced), TROUBLESHOOTING.md (for devs)`,
    team: `Create files like: README.md, GETTING_STARTED.md, USER_GUIDE.md, FAQ.md, WORKFLOW.md, TROUBLESHOOTING.md`,
    enduser: `Create files like: README.md (simple), QUICK_START.md, HOW_TO.md, FAQ.md, TROUBLESHOOTING.md (simple)`,
  };

  const generationPrompt = `You are an expert technical documentation writer. ${getAudienceContext(audience)}

${getToneContext(toneStyle)}

Based on the project analysis below, generate comprehensive markdown documentation files.

Project Name: ${projectName}

Analysis Results:
${analysis}

Code Context:
\`\`\`
${codeInput}
\`\`\`

${fileGuidance[audience]}

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
MANDATORY QUALITY BAR:
- Every file must be substantive, not a stub or outline
- README.md must be at least 500 words with multiple sections and concrete guidance
- Other files must be at least 250 words each
- Each section must include a short explanatory paragraph before any lists
- Avoid bullet-only sections; every list item must include 1-2 sentences of explanation
- Include at least one concrete example (code or command) in each file
- Do not repeat the same content across files; each file must add unique value
${
  audience === "developer"
    ? `- Use clear hierarchies with H1, H2, H3 headings
- Include detailed code examples and technical specifications
- Provide implementation details and architecture diagrams (in text)
- Document API endpoints or functions with signatures
- Include contributing guidelines and code style requirements
- Add debugging and troubleshooting for developers`
    : audience === "team"
      ? `- Use clear hierarchies with H1, H2, H3 headings
- Include both technical and workflow documentation
- Provide examples relevant to team processes
- Document team workflows and best practices
- Add tips and common issues
- Balance detail with accessibility`
      : `- Use simple, clear language
- Break down complex topics into steps
- Provide lots of examples with descriptions
- Focus on "how to do" tasks
- Include a comprehensive FAQ
- Add helpful tips and common pitfalls
- Use short paragraphs and lists
- Make content visually scannable`
}
- Use proper markdown formatting (code blocks, lists, tables)
- Use proper markdown formatting (code blocks, lists, tables)
- Make content easily scannable
- Prefer practical guidance over generic statements`;

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
  audience: AudienceType = "developer",
  toneStyle: ToneStyle = "professional",
): Promise<GroqGenerationResult> {
  const groq = getGroqClient();

  const readmeGuidance: Record<AudienceType, string> = {
    developer: `Include: API documentation, architecture overview, setup for development, contribution guidelines, advanced configuration, debugging tips.`,
    team: `Include: Project overview, setup instructions, common workflows, team guidelines, tips and best practices, FAQ.`,
    enduser: `Include: What the product does, simple setup, step-by-step guides, common tasks, helpful tips, simple FAQ.`,
  };

  const simplePrompt = `You are an expert technical documentation writer. ${getAudienceContext(audience)}

${getToneContext(toneStyle)}

Generate a comprehensive, well-structured README.md file for the following project.

Project Name: ${projectName}
Description: ${description || "No description provided"}

Code/Project Information:
\`\`\`
${codeInput}
\`\`\`

${readmeGuidance[audience]}

Create a SINGLE, comprehensive README.md that includes all relevant sections for the target audience.

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

MANDATORY QUALITY BAR:
- README.md must be at least 700 words
- Each section must include an explanatory paragraph (not just bullets)
- Any list must contain items with 1-2 sentences of explanation
- Include at least two concrete examples (code/commands)
- Provide practical, project-specific guidance; avoid generic filler

Make the README comprehensive, professional, and include all necessary information in one file, tailored for the specified audience.`;

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
  audience: AudienceType = "developer",
  toneStyle: ToneStyle = "professional",
): Promise<GroqGenerationResult> {
  try {
    // Step 1: Analyze
    console.log("[Groq] Analyzing code and creating structure...");
    const analysis = await analyzeCode(
      projectName,
      codeInput,
      readmeContent,
      audience,
      toneStyle,
    );
    console.log("[Groq] Analysis complete");

    // Step 2: Generate
    console.log("[Groq] Generating documentation files...");
    const result = await generateDocumentation(
      projectName,
      codeInput,
      analysis,
      audience,
      toneStyle,
    );
    console.log("[Groq] Documentation generation complete");

    return result;
  } catch (error) {
    console.error("[Groq] Error:", error);
    throw error;
  }
}
