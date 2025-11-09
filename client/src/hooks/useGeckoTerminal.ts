import { useState, useCallback } from "react";
import QueryHandler from "@/services/geckoterminal/QueryHandler";
import type { FormattedResponse } from "@/services/geckoterminal/ResponseFormatter";

interface GeckoTerminalState {
  loading: boolean;
  error: string | null;
  result: FormattedResponse | null;
}

export const useGeckoTerminal = () => {
  const [state, setState] = useState<GeckoTerminalState>({
    loading: false,
    error: null,
    result: null,
  });

  const query = useCallback(async (userQuery: string): Promise<FormattedResponse> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      console.log("[GeckoTerminal] Processing query", userQuery);
      const response = await QueryHandler.handleQuery(userQuery);

      if (response.success) {
        setState({ loading: false, error: null, result: response });
      } else {
        setState({ loading: false, error: response.message ?? "Query failed.", result: null });
      }

      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred";
      setState({ loading: false, error: message, result: null });
      return { success: false, message, error };
    }
  }, []);

  const clearResult = useCallback(() => {
    setState({ loading: false, error: null, result: null });
  }, []);

  return {
    query,
    loading: state.loading,
    error: state.error,
    result: state.result,
    clearResult,
  } as const;
};
