"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark, light } from "@clerk/themes";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function LayoutWrapper({ children }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const baseTheme = resolvedTheme === "dark" ? dark :undefined ;

  return (
    <ClerkProvider appearance={{ baseTheme }}>
      {mounted && children}
    </ClerkProvider>
  );
}
