import { useState, useEffect, useCallback } from "react";
import { fetchGrowth } from "../services/growthService";

export function useGrowth() {
  const [growth, setGrowth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchGrowth()
      .then(setGrowth)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { growth, loading, error, refresh };
}
