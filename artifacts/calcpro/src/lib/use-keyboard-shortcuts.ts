import { useEffect } from "react";
import type { UseCalculatorReturn } from "./use-calculator";

const DIGIT_KEYS = "0123456789".split("");

export function useKeyboardShortcuts(calc: UseCalculatorReturn) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (DIGIT_KEYS.includes(e.key)) {
        calc.input(e.key);
        return;
      }

      if (e.key === ".") {
        calc.input(".");
        return;
      }

      if (e.key === "+") {
        calc.input("+");
        return;
      }

      if (e.key === "-") {
        calc.input("-");
        return;
      }

      if (e.key === "*") {
        calc.input("*");
        return;
      }

      if (e.key === "/") {
        e.preventDefault();
        calc.input("/");
        return;
      }

      if (e.key === "^") {
        calc.input("^");
        return;
      }

      if (e.key === "%") {
        calc.input("%");
        return;
      }

      if (e.key === "(" || e.key === ")") {
        calc.input(e.key);
        return;
      }

      if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        calc.execute();
        return;
      }

      if (e.key === "Backspace") {
        calc.backspace();
        return;
      }

      if (e.key === "Escape") {
        calc.allClear();
        return;
      }

      if (e.key === "Delete") {
        calc.clearEntry();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
        void calc.copyResult();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
        navigator.clipboard
          .readText()
          .then((text) => calc.pasteExpression(text))
          .catch(() => {
            // Clipboard read may be blocked by browser permissions; ignore.
          });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [calc]);
}
