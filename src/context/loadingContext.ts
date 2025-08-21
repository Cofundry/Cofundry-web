// src/context/LoadingContext.tsx
import { createContext } from "react";

export const LoadingContext = createContext<{ loading: boolean; setLoading: (v: boolean) => void }>({
  loading: false,
  setLoading: () => {},
});
