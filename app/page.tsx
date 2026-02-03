"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Github, Sparkles, Zap, Menu, X } from "lucide-react";
import { FormData, GenerationStatus } from "@/types";

// Reusable Input Component
const InputField: React.FC<{
  label: string;
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

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    projectName: "",
    description: "",
    codeInput: "",
    accentColor: "#D4AF37",
    includeSidebar: true,
    useDesignV2: false,
    generateFullDocs: true, // true = full documentation package, false = simple README
  });

  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>({
    isLoading: false,
    error: null,
    progress: 0,
    step: "idle",
  });

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
          accentColor: formData.accentColor,
          includeSidebar: formData.includeSidebar,
          generateFullDocs: formData.generateFullDocs,
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
          accentColor: "#D4AF37",
          includeSidebar: true,
          useDesignV2: false,
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
      <div className="relative z-10 container-xl content-offset py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
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
                label="Project Description (Optional)"
                value={formData.description}
                onChange={(value) => handleInputChange("description", value)}
                placeholder="Brief description of your project"
              />

              <InputField
                label="Code/README Input"
                value={formData.codeInput}
                onChange={(value) => handleInputChange("codeInput", value)}
                placeholder="Paste your README.md, code snippets, or project overview..."
                rows={6}
              />

              {/* Toggles */}
              <div className="space-y-3">
                <Toggle
                  label="Generate Full Documentation Package"
                  value={formData.generateFullDocs}
                  onChange={(value) =>
                    handleInputChange("generateFullDocs", value)
                  }
                />
                {formData.generateFullDocs && (
                  <>
                    {/* Color Picker */}
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
                        <code className="input-chip">
                          {formData.accentColor}
                        </code>
                      </div>
                    </div>

                    <Toggle
                      label="Include Sidebar Navigation"
                      value={formData.includeSidebar}
                      onChange={(value) =>
                        handleInputChange("includeSidebar", value)
                      }
                    />
                    {/* <Toggle
                      label="Modern Design (V2)"
                      value={formData.useDesignV2}
                      onChange={(value) =>
                        handleInputChange("useDesignV2", value)
                      }
                    /> */}
                  </>
                )}
              </div>

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

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Features Card */}
            <motion.div className="card p-6 space-y-4">
              <h3 className="text-lg font-bold flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-accent" />
                <span>Features</span>
              </h3>
              <ul className="space-y-3 text-sm text-muted">
                {[
                  "AI-Powered Analysis",
                  "Docsify Integration",
                  "Custom Themes",
                  "Auto Sidebars",
                  "One-Click Export",
                  "Markdown Support",
                ].map((feature) => (
                  <li key={feature} className="flex items-center space-x-2">
                    <span className="accent-dot" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Tech Stack Card */}
            <motion.div className="card p-6 space-y-4">
              <h3 className="text-lg font-bold flex items-center space-x-2">
                <Github className="w-5 h-5 text-accent" />
                <span>Tech Stack</span>
              </h3>
              <div className="space-y-2 text-sm text-muted">
                <p>
                  <span className="text-accent font-semibold">Frontend:</span>{" "}
                  Next.js, TypeScript, Tailwind
                </p>
                <p>
                  <span className="text-accent font-semibold">AI:</span> Groq
                  Llama 3.3 70B
                </p>
                <p>
                  <span className="text-accent font-semibold">Export:</span>{" "}
                  JSZip, Docsify
                </p>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div className="grid grid-cols-2 gap-4">
              {[
                { label: "Generated Docs", value: "1000+" },
                { label: "Happy Users", value: "500+" },
                { label: "Avg Time", value: "30s" },
                { label: "Success Rate", value: "99.9%" },
              ].map((stat) => (
                <div key={stat.label} className="stat-card">
                  <p className="text-2xl font-bold text-accent">{stat.value}</p>
                  <p className="text-xs text-muted mt-1">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 app-footer mt-20">
        <div className="container-xl py-8 text-center text-muted text-sm">
          <p>
            Powered by{" "}
            <span className="text-accent font-semibold">Groq Cloud</span> &
            built with{" "}
            <span className="text-accent font-semibold">Next.js</span>
          </p>
          <p className="mt-2">
            © 2026 <a href="https://jumpstone4477.de/devreadme">DevRead.me </a>
            is licensed under GNU GPLv3.
          </p>
          <p>Made by developers for developers.</p>
        </div>
      </footer>
    </div>
  );
}
