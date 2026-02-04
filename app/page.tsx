"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Github, Sparkles, Zap, Menu, X } from "lucide-react";
import {
  FormData,
  GenerationStatus,
  AUDIENCE_LABELS,
  AudienceType,
  ToneStyle,
  TONE_STYLE_DESCRIPTIONS,
  SourceFetchSummary,
} from "@/types";

// Reusable Input Component
const InputField: React.FC<{
  label: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  rows?: number;
}> = ({ label, value, onChange, placeholder, type = "text", rows }) => (
  <div className="space-y-2">
    <label className="block label">{label}</label>
    {rows ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="input-field resize-none"
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field"
      />
    )}
  </div>
);

// Toggle Component
const Toggle: React.FC<{
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}> = ({ label, value, onChange }) => (
  <div className="card p-3 flex items-center justify-between">
    <span className="text-sm font-medium text-muted">{label}</span>
    <button
      onClick={() => onChange(!value)}
      className="toggle-track"
      data-active={value}
    >
      <motion.div
        className="toggle-thumb"
        animate={{ x: value ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  </div>
);

// Loading Spinner
const LoadingSpinner: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center space-y-4">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 2 }}
      className="spinner"
    />
    <p className="text-muted">{message}</p>
  </div>
);

// Audience Selector Component
const AudienceSelector: React.FC<{
  value: AudienceType;
  onChange: (value: AudienceType) => void;
}> = ({ value, onChange }) => {
  const audiences: AudienceType[] = ["developer", "team", "enduser"];
  const descriptions: Record<AudienceType, string> = {
    developer: "Technical documentation for developers (like CONTRIBUTING.md)",
    team: "Documentation for team members and colleagues",
    enduser: "Simple, user-friendly documentation for non-technical users",
  };

  return (
    <div className="space-y-3">
      <label className="block label">Target Audience</label>
      <div className="grid grid-cols-1 gap-2">
        {audiences.map((audience) => (
          <button
            key={audience}
            type="button"
            onClick={() => onChange(audience)}
            className={`card p-3 text-left transition-all border cursor-pointer ${
              value === audience
                ? "border-purple-500 bg-purple-500/10"
                : "border-neutral-700 hover:border-purple-500/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  value === audience
                    ? "border-purple-500 bg-purple-500"
                    : "border-neutral-600"
                }`}
              >
                {value === audience && (
                  <div className="w-2 h-2 bg-neutral-900 rounded-full" />
                )}
              </div>
              <div>
                <div className="font-medium text-sm">
                  {AUDIENCE_LABELS[audience]}
                </div>
                <div className="text-xs text-neutral-500">
                  {descriptions[audience]}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Tone Style Selector Component
const ToneStyleSelector: React.FC<{
  value: ToneStyle;
  onChange: (value: ToneStyle) => void;
}> = ({ value, onChange }) => {
  const tones: ToneStyle[] = [
    "casual",
    "professional",
    "friendly",
    "technical",
    "academic",
  ];
  const toneLabels: Record<ToneStyle, string> = {
    casual: "Casual",
    professional: "Professional",
    friendly: "Friendly",
    technical: "Technical",
    academic: "Academic",
  };

  return (
    <div className="space-y-3">
      <label className="block label">Writing Style</label>
      <div className="grid grid-cols-2 gap-2">
        {tones.map((tone) => (
          <button
            key={tone}
            type="button"
            onClick={() => onChange(tone)}
            className={`card p-3 text-left transition-all border cursor-pointer text-sm ${
              value === tone
                ? "border-purple-500 bg-purple-500/10"
                : "border-neutral-700 hover:border-purple-500/50"
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  value === tone
                    ? "border-purple-500 bg-purple-500"
                    : "border-neutral-600"
                }`}
              >
                {value === tone && (
                  <div className="w-1.5 h-1.5 bg-neutral-900 rounded-full" />
                )}
              </div>
              <div>
                <div className="font-medium text-sm">{toneLabels[tone]}</div>
                <div className="text-xs text-neutral-500 hidden sm:block">
                  {TONE_STYLE_DESCRIPTIONS[tone]}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    projectName: "",
    description: "",
    codeInput: "",
    sourcesInput: "",
    accentColor: "#D4AF37",
    includeSidebar: true,
    useDesignV2: false,
    generateFullDocs: true, // true = full documentation package, false = simple README
    audience: "developer", // Default audience
    toneStyle: "professional", // Default tone style
  });

  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>({
    isLoading: false,
    error: null,
    progress: 0,
    step: "idle",
  });

  const [sourceSummary, setSourceSummary] = useState<SourceFetchSummary | null>(
    null,
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setGenerationStatus((prev) => ({ ...prev, error: null }));
  };

  const handleGenerate = async () => {
    // Validation
    if (!formData.projectName.trim()) {
      setGenerationStatus({
        ...generationStatus,
        error: "Project name is required",
      });
      return;
    }

    if (!formData.codeInput.trim()) {
      setGenerationStatus({
        ...generationStatus,
        error: "Code input is required",
      });
      return;
    }

    // Start generation
    setGenerationStatus({
      isLoading: true,
      error: null,
      progress: 0,
      step: "analyzing",
    });
    setSourceSummary(null);

    try {
      // Call API
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectName: formData.projectName,
          description: formData.description,
          codeInput: formData.codeInput,
          sourcesInput: formData.sourcesInput,
          accentColor: formData.accentColor,
          includeSidebar: formData.includeSidebar,
          generateFullDocs: formData.generateFullDocs,
          audience: formData.audience,
          toneStyle: formData.toneStyle,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Generation failed");
      }

      setGenerationStatus((prev) => ({
        ...prev,
        step: "generating",
        progress: 50,
      }));

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      if (data.data?.sourceSummary) {
        setSourceSummary(data.data.sourceSummary);
      }

      setGenerationStatus((prev) => ({
        ...prev,
        step: "exporting",
        progress: 75,
      }));

      // For simple README mode, trigger direct download
      if (!formData.generateFullDocs) {
        const readmeFile = data.data.bundle.markdownFiles.find(
          (f: { name: string }) => f.name === "README.md",
        );
        const readmeContent = readmeFile?.content || "";

        const blob = new Blob([readmeContent], { type: "text/markdown" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${formData.projectName}-README.md`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // Create ZIP and download for full documentation
        const { createZipBundle } = await import("@/lib/export-service");
        const bundle = data.data.bundle;
        const zipBlob = await createZipBundle(bundle);

        // Trigger download
        const url = window.URL.createObjectURL(zipBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${formData.projectName}-docs-${Date.now()}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      setGenerationStatus({
        isLoading: false,
        error: null,
        progress: 100,
        step: "complete",
      });

      // Reset after 2 seconds
      setTimeout(() => {
        setGenerationStatus({
          isLoading: false,
          error: null,
          progress: 0,
          step: "idle",
        });
        setFormData({
          projectName: "",
          description: "",
          codeInput: "",
          sourcesInput: "",
          accentColor: "#D4AF37",
          includeSidebar: true,
          useDesignV2: false,
          generateFullDocs: true,
          audience: "developer",
          toneStyle: "professional",
        });
      }, 2000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Generation error:", error);
      setGenerationStatus({
        isLoading: false,
        error: errorMessage,
        progress: 0,
        step: "idle",
      });
    }
  };

  return (
    <div className="app-shell">
      <div className="grid-bg" />

      {/* Header */}
      <header className="header-nav">
        <div className="header-content">
          <motion.a
            href="/"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="logo"
          >
            <img
              src="https://jumpstone4477.de/devreadme/assets/img/logo.png"
              alt="DevRead.me Logo"
              className="logo-img"
            />
            DevRead.me
          </motion.a>

          <nav aria-label="Hauptnavigation" className="nav-wrapper">
            <ul className="nav-links">
              <li>
                <a href="/" aria-current="page">
                  Home
                </a>
              </li>
              <li>
                <a href="https://jumpstone4477.de/devreadme">Website</a>
              </li>
            </ul>
          </nav>

          <div className="social-card">
            <a
              href="https://github.com/devread-me"
              className="Btn github"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <span className="svgContainer">
                <img
                  src="https://jumpstone4477.de/assets/img/badges/github-mark-white.png"
                  alt="GitHub"
                  className="social-icon"
                />
              </span>
              <span className="BG"></span>
            </a>

            <a
              href="https://discord.gg/yKU4Q2mHj8"
              className="Btn discord"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Discord"
            >
              <span className="svgContainer">
                <img
                  src="https://jumpstone4477.de/assets/img/badges/Discord-Symbol-White-square.png"
                  alt="Discord"
                  className="social-icon"
                />
              </span>
              <span className="BG"></span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden btn-ghost"
            aria-label="Toggle navigation"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {sidebarOpen && (
          <div className="mobile-menu">
            <a href="https://devreadme.jumpstone4477.de">Home</a>
            <a href="https://devreadme.jumpstone4477.de/docs">Docs</a>
            <a href="https://jumpstone4477.de">JumpStone</a>
            <div className="mobile-socials">
              <a
                href="https://github.com/devread-me"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              <a
                href="https://discord.gg/yKU4Q2mHj8"
                target="_blank"
                rel="noopener noreferrer"
              >
                Discord
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-full px-4 sm:px-6 lg:px-8 py-12 mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Options Section (Left) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4 options-panel"
          >
            {/* Target Audience */}
            <motion.div className="card p-6 space-y-4">
              <AudienceSelector
                value={formData.audience}
                onChange={(value) => handleInputChange("audience", value)}
              />
            </motion.div>

            {/* Writing Style */}
            <motion.div className="card p-6 space-y-4">
              <ToneStyleSelector
                value={formData.toneStyle}
                onChange={(value) => handleInputChange("toneStyle", value)}
              />
            </motion.div>

            {/* Full Doc Package Toggle */}
            <motion.div className="card p-6 space-y-4">
              <Toggle
                label="Generate Full Documentation Package"
                value={formData.generateFullDocs}
                onChange={(value) =>
                  handleInputChange("generateFullDocs", value)
                }
              />
            </motion.div>

            {/* Accent Color (Show only when Full Docs enabled) */}
            {formData.generateFullDocs && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6 space-y-4"
              >
                <div className="space-y-2">
                  <label className="block label">Accent Color</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={formData.accentColor}
                      onChange={(e) =>
                        handleInputChange("accentColor", e.target.value)
                      }
                      className="color-swatch cursor-pointer"
                    />
                    <code className="input-chip">{formData.accentColor}</code>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Sidebar Toggle (Show only when Full Docs enabled) */}
            {formData.generateFullDocs && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6 space-y-4"
              >
                <Toggle
                  label="Include Sidebar Navigation"
                  value={formData.includeSidebar}
                  onChange={(value) =>
                    handleInputChange("includeSidebar", value)
                  }
                />
              </motion.div>
            )}

            {/* Footer Info */}
            <div className="text-xs text-muted text-center space-y-1 pt-4">
              <p>
                © 2026{" "}
                <a
                  href="https://jumpstone4477.de/devreadme"
                  className="hover:text-accent transition-colors"
                >
                  DevRead.me
                </a>{" "}
                is licensed under GNU GPLv3.
              </p>
              <p>Made by developers for developers.</p>
            </div>
          </motion.div>

          {/* Input Section (Right - 2 columns) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Hero Section */}
            <div className="space-y-4 mb-8">
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Transform Your Code into{" "}
                <span className="text-gradient">Beautiful Docs</span>
              </h2>
              <p className="text-lg text-muted leading-relaxed max-w-2xl">
                Powered by AI. Create comprehensive Docsify documentation from
                your GitHub repositories in seconds.
              </p>
            </div>

            {/* Form Card */}
            <motion.div
              className="card card-lg space-y-6 relative"
              whileHover={{ borderColor: "rgba(161, 161, 170, 0.8)" }}
            >
              {/* Loading State */}
              {generationStatus.isLoading && (
                <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <LoadingSpinner
                    message={
                      generationStatus.step === "analyzing"
                        ? "Analyzing your code..."
                        : generationStatus.step === "generating"
                          ? `Generating ${formData.generateFullDocs ? "documentation" : "README"}...`
                          : generationStatus.step === "exporting"
                            ? `Creating ${formData.generateFullDocs ? "Docsify package" : "README file"}...`
                            : "Complete! Downloading..."
                    }
                  />
                </div>
              )}

              <InputField
                label="Project Name"
                value={formData.projectName}
                onChange={(value) => handleInputChange("projectName", value)}
                placeholder="e.g., MyAwesomeProject"
              />

              <InputField
                label={
                  <span className="flex items-center gap-2">
                    <span>Project Description</span>
                    <span className="input-chip text-[9px] uppercase tracking-wide text-neutral-400/80 bg-neutral-800/40">
                      Optional
                    </span>
                  </span>
                }
                value={formData.description}
                onChange={(value) => handleInputChange("description", value)}
                placeholder="Brief description of your project"
              />

              <div className="space-y-2">
                <InputField
                  label={
                    <span className="flex items-center gap-2">
                      <span>Sources</span>
                      <span className="input-chip text-[9px] uppercase tracking-wide text-neutral-400/80 bg-neutral-800/40">
                        Optional
                      </span>
                    </span>
                  }
                  value={formData.sourcesInput}
                  onChange={(value) => handleInputChange("sourcesInput", value)}
                  placeholder="GitHub/Codeberg/Google Docs/Text URLs, comma-separated"
                />
                <p className="text-xs text-neutral-500">
                  Example: https://github.com/user/repo/blob/main/README.md,
                  https://codeberg.org/user/repo/src/branch/main/README.md,
                  https://docs.google.com/document/d/FILE_ID/edit
                </p>
                {sourceSummary && (
                  <div className="space-y-2">
                    {sourceSummary.fetched.length > 0 && (
                      <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-xs">
                        <div className="font-medium mb-1">Fetched sources</div>
                        <ul className="space-y-1">
                          {sourceSummary.fetched.map((item) => (
                            <li key={item.url} className="break-all">
                              {item.url} · {item.chars} chars
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {sourceSummary.failed.length > 0 && (
                      <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs">
                        <div className="font-medium mb-1">Failed sources</div>
                        <ul className="space-y-1">
                          {sourceSummary.failed.map((item) => (
                            <li key={item.url} className="break-all">
                              {item.url} · {item.error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <InputField
                label="Code/README Input"
                value={formData.codeInput}
                onChange={(value) => handleInputChange("codeInput", value)}
                placeholder="Paste your README.md, code snippets, or project overview..."
                rows={6}
              />

              {/* Error Message */}
              {generationStatus.error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/10 border border-red-500/40 rounded-lg text-red-200 text-sm"
                >
                  {generationStatus.error}
                </motion.div>
              )}

              {/* Success Message */}
              {generationStatus.step === "complete" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-emerald-500/10 border border-emerald-500/40 rounded-lg text-emerald-200 text-sm flex items-center space-x-2"
                >
                  <span>✓</span>
                  <span>
                    {formData.generateFullDocs
                      ? "Documentation package generated and downloaded successfully!"
                      : "README generated and downloaded successfully!"}
                  </span>
                </motion.div>
              )}

              {/* Generate Button */}
              <motion.button
                onClick={handleGenerate}
                disabled={generationStatus.isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary w-full"
              >
                {generationStatus.isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="btn-spinner"
                    />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>Generate Documentation</span>
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
