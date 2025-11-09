import { useState, useCallback } from "react";

export function useHistory<T>(initialValue: T) {
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState<T[]>([initialValue]);

  const state = history[index];

  const setState = useCallback((newState: T | ((prev: T) => T)) => {
    const resolvedState = typeof newState === "function" 
      ? (newState as (prev: T) => T)(history[index])
      : newState;

    const newHistory = history.slice(0, index + 1);
    newHistory.push(resolvedState);
    
    setHistory(newHistory);
    setIndex(newHistory.length - 1);
  }, [history, index]);

  const undo = useCallback(() => {
    if (index > 0) {
      setIndex(index - 1);
    }
  }, [index]);

  const redo = useCallback(() => {
    if (index < history.length - 1) {
      setIndex(index + 1);
    }
  }, [index, history.length]);

  const canUndo = index > 0;
  const canRedo = index < history.length - 1;

  return { state, setState, undo, redo, canUndo, canRedo };
}
