"use client";

import { Provider, useDispatch } from "react-redux";
import { store } from "./store/store";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { useEffect } from "react";
import { login as loginAction } from "@/app/store/slices/userSlice";

function AuthSync() {
  const dispatch = useDispatch();
  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          dispatch(loginAction(data.user));
        }
      });
  }, [dispatch]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthSync />
      <TooltipProvider>{children}</TooltipProvider>
    </Provider>
  );
}
