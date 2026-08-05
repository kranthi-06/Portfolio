import { useState, useEffect } from "react";
import type { PortfolioData } from "@/lib/portfolio/types";

export function useLivePortfolio() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchPortfolio() {
      try {
        const response = await fetch("/api/portfolio");
        if (!response.ok) {
          throw new Error("Failed to fetch portfolio data");
        }
        
        const result = await response.json();
        if (mounted) {
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error("Unknown error"));
          setLoading(false);
        }
      }
    }

    fetchPortfolio();

    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
}
