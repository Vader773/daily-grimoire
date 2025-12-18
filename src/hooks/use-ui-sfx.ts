import { useEffect, useRef } from "react";
import { haptic, playUiSfx } from "@/lib/juice";

// Global UI SFX: plays on most taps/clicks without touching business logic.
// Skips form fields and throttles so it never becomes annoying.
export const useUiSfx = () => {
  const lastAt = useRef(0);

  useEffect(() => {
    const shouldSkip = (el: EventTarget | null) => {
      if (!(el instanceof HTMLElement)) return true;
      const tag = el.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return true;
      if (el.isContentEditable) return true;
      return false;
    };

    const throttleOk = () => {
      const t = performance.now();
      if (t - lastAt.current < 90) return false;
      lastAt.current = t;
      return true;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (!throttleOk()) return;
      if (shouldSkip(e.target)) return;

      // Only for primary interactions
      if (e.button !== 0) return;

      playUiSfx("click");
      haptic(5);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!throttleOk()) return;
      if (e.key !== "Enter" && e.key !== " ") return;
      if (shouldSkip(e.target)) return;
      playUiSfx("click");
    };

    // Capture so we catch clicks on custom components
    window.addEventListener("pointerdown", onPointerDown, { capture: true });
    window.addEventListener("keydown", onKeyDown, { capture: true });

    return () => {
      window.removeEventListener("pointerdown", onPointerDown, { capture: true } as any);
      window.removeEventListener("keydown", onKeyDown, { capture: true } as any);
    };
  }, []);
};
