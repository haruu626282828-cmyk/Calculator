import { useCallback, useMemo, useState } from "react";
import {
  CalculatorError,
  evaluateExpression,
  formatResult,
} from "./calculator-engine";
import type { AngleModeValue } from "./types";
import { useHistory } from "./use-history";
import { useSound } from "./use-sound";

const MAX_EXPRESSION_LENGTH = 200;

export function useCalculator() {
  const [expression, setExpression] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [angleMode, setAngleMode] = useState<AngleModeValue>("DEG");
  const [memory, setMemory] = useState(0);
  const [hasMemory, setHasMemory] = useState(false);

  const history = useHistory();
  const sound = useSound();

  const updatePreview = useCallback(
    (expr: string) => {
      if (!expr.trim()) {
        setPreview(null);
        return;
      }
      try {
        const value = evaluateExpression(expr, angleMode);
        setPreview(formatResult(value));
      } catch {
        setPreview(null);
      }
    },
    [angleMode],
  );

  const input = useCallback(
    (token: string) => {
      sound.playKeyPress();
      setError(null);
      setExpression((prev) => {
        const base = justEvaluated && /^[0-9.π]/.test(token) ? "" : prev;
        const next = (base + token).slice(0, MAX_EXPRESSION_LENGTH);
        updatePreview(next);
        return next;
      });
      setJustEvaluated(false);
    },
    [justEvaluated, sound, updatePreview],
  );

  const inputFunction = useCallback(
    (fnToken: string) => {
      sound.playKeyPress();
      setError(null);
      setExpression((prev) => {
        const base = justEvaluated ? "" : prev;
        const next = `${base}${fnToken}(`.slice(0, MAX_EXPRESSION_LENGTH);
        updatePreview(next);
        return next;
      });
      setJustEvaluated(false);
    },
    [justEvaluated, sound, updatePreview],
  );

  const backspace = useCallback(() => {
    sound.playKeyPress();
    setError(null);
    setJustEvaluated(false);
    setExpression((prev) => {
      const next = prev.slice(0, -1);
      updatePreview(next);
      return next;
    });
  }, [sound, updatePreview]);

  const clearEntry = useCallback(() => {
    sound.playKeyPress();
    setExpression("");
    setPreview(null);
    setError(null);
    setJustEvaluated(false);
  }, [sound]);

  const allClear = useCallback(() => {
    sound.playKeyPress();
    setExpression("");
    setPreview(null);
    setError(null);
    setJustEvaluated(false);
  }, [sound]);

  const toggleSign = useCallback(() => {
    setError(null);
    setExpression((prev) => {
      if (!prev) return prev;

      const match = prev.match(/(-?\d+\.?\d*)$/);
      if (!match) return prev;

      const numberToken = match[1];
      const start = prev.length - numberToken.length;
      const before = prev.slice(0, start);

      let next: string;
      if (numberToken.startsWith("-")) {
        next = before + numberToken.slice(1);
      } else {
        const prevBefore = before.replace(/\s+$/, "");
        if (prevBefore.endsWith("(") || prevBefore === "") {
          next = before + "-" + numberToken;
        } else {
          next = before + "(-" + numberToken + ")";
        }
      }
      updatePreview(next);
      return next;
    });
  }, [updatePreview]);

  const execute = useCallback(() => {
    if (!expression.trim()) return;
    try {
      const value = evaluateExpression(expression, angleMode);
      const formatted = formatResult(value);
      history.addEntry(expression, formatted);
      sound.playEquals();
      setExpression(formatted);
      setPreview(null);
      setError(null);
      setJustEvaluated(true);
    } catch (err) {
      sound.playError();
      const message =
        err instanceof CalculatorError ? err.message : "Invalid expression";
      setError(message);
      setPreview(null);
    }
  }, [angleMode, expression, history, sound]);

  const memoryClear = useCallback(() => {
    setMemory(0);
    setHasMemory(false);
  }, []);

  const memoryRecall = useCallback(() => {
    if (!hasMemory) return;
    input(formatResult(memory).replace(/,/g, ""));
  }, [hasMemory, input, memory]);

  const currentValue = useCallback((): number | null => {
    const source = expression || preview;
    if (!source) return null;
    try {
      return evaluateExpression(source, angleMode);
    } catch {
      return null;
    }
  }, [angleMode, expression, preview]);

  const memoryAdd = useCallback(() => {
    const value = currentValue();
    if (value === null) return;
    setMemory((prev) => prev + value);
    setHasMemory(true);
  }, [currentValue]);

  const memorySubtract = useCallback(() => {
    const value = currentValue();
    if (value === null) return;
    setMemory((prev) => prev - value);
    setHasMemory(true);
  }, [currentValue]);

  const memoryStore = useCallback(() => {
    const value = currentValue();
    if (value === null) return;
    setMemory(value);
    setHasMemory(true);
  }, [currentValue]);

  const insertRandom = useCallback(() => {
    input(Math.random().toFixed(6));
  }, [input]);

  const pasteExpression = useCallback(
    (text: string) => {
      const sanitized = text.replace(/[^0-9+\-*/^().!%πe a-zA-Z√∛²³]/g, "");
      if (!sanitized) return;
      setError(null);
      setJustEvaluated(false);
      setExpression((prev) => {
        const next = (prev + sanitized).slice(0, MAX_EXPRESSION_LENGTH);
        updatePreview(next);
        return next;
      });
    },
    [updatePreview],
  );

  const reuseFromHistory = useCallback((expr: string) => {
    setError(null);
    setJustEvaluated(false);
    setExpression(expr);
    setPreview(null);
  }, []);

  const copyResult = useCallback(async () => {
    const value = currentValue();
    if (value === null) return false;
    try {
      await navigator.clipboard.writeText(formatResult(value));
      return true;
    } catch {
      return false;
    }
  }, [currentValue]);

  const displayValue = useMemo(() => expression || "0", [expression]);

  return {
    expression: displayValue,
    rawExpression: expression,
    preview,
    error,
    justEvaluated,
    angleMode,
    setAngleMode,
    memory,
    hasMemory,
    input,
    inputFunction,
    backspace,
    clearEntry,
    allClear,
    toggleSign,
    execute,
    memoryClear,
    memoryRecall,
    memoryAdd,
    memorySubtract,
    memoryStore,
    insertRandom,
    pasteExpression,
    copyResult,
    reuseFromHistory,
    history,
    sound,
  };
}

export type UseCalculatorReturn = ReturnType<typeof useCalculator>;
