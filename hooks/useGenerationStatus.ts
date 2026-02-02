import { useState, useCallback } from "react";
import { GenerationStatus } from "@/types";

/**
 * Custom hook for managing generation state
 */
export function useGenerationStatus() {
  const [status, setStatus] = useState<GenerationStatus>({
    isLoading: false,
    error: null,
    progress: 0,
    step: "idle",
  });

  const startGeneration = useCallback(() => {
    setStatus({
      isLoading: true,
      error: null,
      progress: 0,
      step: "analyzing",
    });
  }, []);

  const setAnalyzing = useCallback(() => {
    setStatus((prev) => ({ ...prev, step: "analyzing", progress: 25 }));
  }, []);

  const setGenerating = useCallback(() => {
    setStatus((prev) => ({ ...prev, step: "generating", progress: 50 }));
  }, []);

  const setExporting = useCallback(() => {
    setStatus((prev) => ({ ...prev, step: "exporting", progress: 75 }));
  }, []);

  const setComplete = useCallback(() => {
    setStatus({
      isLoading: false,
      error: null,
      progress: 100,
      step: "complete",
    });
  }, []);

  const setError = useCallback((error: string) => {
    setStatus({
      isLoading: false,
      error,
      progress: 0,
      step: "idle",
    });
  }, []);

  const reset = useCallback(() => {
    setStatus({
      isLoading: false,
      error: null,
      progress: 0,
      step: "idle",
    });
  }, []);

  return {
    status,
    startGeneration,
    setAnalyzing,
    setGenerating,
    setExporting,
    setComplete,
    setError,
    reset,
  };
}
