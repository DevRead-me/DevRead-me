"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Copy,
  Download,
  Github,
  Sparkles,
  Zap,
  Menu,
  X,
  Moon,
} from "lucide-react";
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
    <label className="block text-sm font-medium text-gray-200">{label}</label>
    {rows ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-3 rounded-lg glass placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-lg glass placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
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
  <div className="flex items-center justify-between p-3 rounded-lg glass">
    <span className="text-sm font-medium text-gray-200">{label}</span>
    <button
      onClick={() => onChange(!value)}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        value ? "bg-primary" : "bg-gray-600"
      }`}
    >
      <motion.div
        className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
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
      className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full"
    />
    <p className="text-gray-300">{message}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Mesh Gradient Background */}
      <div className="fixed inset-0 mesh-gradient opacity-40 pointer-events-none" />

      {/* Animated Background Orbs */}
      <motion.div
        className="fixed top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, 100, 0],
        }}
        transition={{ repeat: Infinity, duration: 15 }}
      />
      <motion.div
        className="fixed bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
        animate={{
          x: [0, -50, 0],
          y: [0, -100, 0],
        }}
        transition={{ repeat: Infinity, duration: 15, delay: 5 }}
      />

      {/* Header */}
      <header className="relative sticky top-0 z-40 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-primary">DevRead.me</h1>
          </motion.div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Hero Section */}
            <div className="space-y-4 mb-8">
              <h2 className="text-4xl md:text-5xl font-bold leading-tight text-white">
                Transform Your Code into{" "}
                <span className="text-primary">Beautiful Docs</span>
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed max-w-2xl">
                Powered by AI. Create comprehensive Docsify documentation from
                your GitHub repositories in seconds.
              </p>
            </div>

            {/* Form Card */}
            <motion.div
              className="glass p-8 space-y-6"
              whileHover={{ borderColor: "rgba(212, 175, 55, 0.3)" }}
            >
              {/* Loading State */}
              {generationStatus.isLoading && (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950/50 to-transparent rounded-2xl flex items-center justify-center backdrop-blur-sm">
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
                      <label className="block text-sm font-medium text-gray-200">
                        Accent Color
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={formData.accentColor}
                          onChange={(e) =>
                            handleInputChange("accentColor", e.target.value)
                          }
                          className="w-16 h-12 rounded-lg cursor-pointer"
                        />
                        <code className="px-3 py-2 rounded-lg glass text-sm font-mono text-primary">
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
                  className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-200 text-sm"
                >
                  {generationStatus.error}
                </motion.div>
              )}

              {/* Success Message */}
              {generationStatus.step === "complete" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-200 text-sm flex items-center space-x-2"
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
                whileHover={{ scale: 1.02, borderColor: "#D4AF37" }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 px-6 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/80 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center space-x-2"
              >
                {generationStatus.isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
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
            <motion.div className="glass p-6 space-y-4 rounded-2xl">
              <h3 className="text-lg font-bold flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span>Features</span>
              </h3>
              <ul className="space-y-3 text-sm text-gray-300">
                {[
                  "AI-Powered Analysis",
                  "Docsify Integration",
                  "Custom Themes",
                  "Auto Sidebars",
                  "One-Click Export",
                  "Markdown Support",
                ].map((feature) => (
                  <li key={feature} className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Tech Stack Card */}
            <motion.div className="glass p-6 space-y-4 rounded-2xl">
              <h3 className="text-lg font-bold flex items-center space-x-2">
                <Github className="w-5 h-5 text-primary" />
                <span>Tech Stack</span>
              </h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p>
                  <span className="text-primary font-semibold">Frontend:</span>{" "}
                  Next.js, TypeScript, Tailwind
                </p>
                <p>
                  <span className="text-primary font-semibold">AI:</span> Groq
                  Llama 3.3 70B
                </p>
                <p>
                  <span className="text-primary font-semibold">Export:</span>{" "}
                  JSZip, Docsify
                </p>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div className="glass p-6 grid grid-cols-2 gap-4 rounded-2xl">
              {[
                { label: "Generated Docs", value: "1000+" },
                { label: "Happy Users", value: "500+" },
                { label: "Avg Time", value: "30s" },
                { label: "Success Rate", value: "99.9%" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-white/5 backdrop-blur-lg mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-400 text-sm">
          <p>
            Powered by{" "}
            <span className="text-primary font-semibold">Groq Cloud</span> &
            built with{" "}
            <span className="text-blue-400 font-semibold">Next.js</span>
          </p>
          <p className="mt-2">
            © 2026{" "}
            <a href="https://devreadme.jumpstone4477.de">DevRead.me Website</a>.
            Licensed under GNU GPLv3.
          </p>
          <p>Made by developers for developers.</p>
        </div>
      </footer>
    </div>
  );
}
