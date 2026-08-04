"use client";

import React from "react";
import { Sparkles, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="w-full h-full min-h-[400px] flex items-center justify-center p-6 bg-background rounded-3xl border border-line">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-background-elevated border border-line mb-6">
              <Sparkles className="w-8 h-8 text-accent opacity-50" />
            </div>
            <h3 className="text-2xl font-display font-medium text-ink mb-3">
              Something went wrong
            </h3>
            <p className="text-ink-secondary mb-8 leading-relaxed text-sm">
              We encountered an unexpected issue while rendering this section. Our team has been notified.
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-ink text-background text-sm font-semibold hover:shadow-glow transition-all duration-300"
            >
              <RefreshCcw className="w-4 h-4" />
              Try again
            </button>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
