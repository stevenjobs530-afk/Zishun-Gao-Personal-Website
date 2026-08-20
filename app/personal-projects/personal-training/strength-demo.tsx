"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import type { Language } from "./personal-training-hero";
import styles from "./personal-training.module.css";

type SetType = "warmup" | "working";

type DemoSet = {
  id: number;
  type: SetType;
  weight: string;
  reps: string;
};

type DemoState = {
  name: string;
  setup: string;
  sets: DemoSet[];
  nextId: number;
};

type LocalisedDefaults = Pick<DemoState, "name" | "setup">;

type DemoAction =
  | { type: "field"; field: "name" | "setup"; value: string }
  | { type: "set"; id: number; field: "type" | "weight" | "reps"; value: string }
  | { type: "add" }
  | { type: "remove"; id: number }
  | { type: "reset"; defaults: LocalisedDefaults }
  | { type: "localise-defaults"; from: LocalisedDefaults; to: LocalisedDefaults };

export type StrengthDemoCopy = {
  badge: string;
  eyebrow: string;
  session: string;
  title: string;
  disclosure: string;
  nameLabel: string;
  setupLabel: string;
  setsLegend: string;
  columns: readonly [string, string, string, string];
  setTypeLabel: (index: number) => string;
  setWeightLabel: (index: number) => string;
  setRepsLabel: (index: number) => string;
  removeSetLabel: (index: number) => string;
  remove: string;
  warmup: string;
  working: string;
  add: string;
  reset: string;
  status: {
    ready: string;
    added: string;
    removed: string;
    reset: string;
  };
  boundary: string;
  defaults: LocalisedDefaults;
};

type StatusKey = keyof StrengthDemoCopy["status"];

function createInitialState(defaults: LocalisedDefaults): DemoState {
  return {
    ...defaults,
    sets: [
      { id: 1, type: "warmup", weight: "25", reps: "12" },
      { id: 2, type: "working", weight: "42.5", reps: "8" },
    ],
    nextId: 3,
  };
}

function reducer(state: DemoState, action: DemoAction): DemoState {
  if (action.type === "field") return { ...state, [action.field]: action.value };
  if (action.type === "set") {
    return {
      ...state,
      sets: state.sets.map((set) => set.id === action.id ? { ...set, [action.field]: action.value } : set),
    };
  }
  if (action.type === "add") {
    return {
      ...state,
      sets: [...state.sets, { id: state.nextId, type: "working", weight: "40", reps: "8" }],
      nextId: state.nextId + 1,
    };
  }
  if (action.type === "remove") return { ...state, sets: state.sets.filter((set) => set.id !== action.id) };
  if (action.type === "localise-defaults") {
    return {
      ...state,
      name: state.name === action.from.name ? action.to.name : state.name,
      setup: state.setup === action.from.setup ? action.to.setup : state.setup,
    };
  }
  return createInitialState(action.defaults);
}

export default function StrengthDemo({ language, copy }: { language: Language; copy: StrengthDemoCopy }) {
  const [state, dispatch] = useReducer(reducer, copy.defaults, createInitialState);
  const [statusKey, setStatusKey] = useState<StatusKey>("ready");
  const previousDefaults = useRef(copy.defaults);

  useEffect(() => {
    if (previousDefaults.current === copy.defaults) return;
    dispatch({ type: "localise-defaults", from: previousDefaults.current, to: copy.defaults });
    previousDefaults.current = copy.defaults;
  }, [copy.defaults]);

  const addSet = () => {
    dispatch({ type: "add" });
    setStatusKey("added");
  };

  const removeSet = (id: number) => {
    dispatch({ type: "remove", id });
    setStatusKey("removed");
  };

  const reset = () => {
    dispatch({ type: "reset", defaults: copy.defaults });
    setStatusKey("reset");
  };

  return (
    <div className={styles.demoPanel} aria-labelledby="strength-demo-title" lang={language === "zh" ? "zh-CN" : "en"}>
      <div className={styles.demoHeader}>
        <div>
          <span className={styles.demoBadge}>{copy.badge}</span>
          <p>{copy.eyebrow}</p>
        </div>
        <p className={styles.demoSession}>{copy.session}</p>
      </div>

      <h3 id="strength-demo-title">{copy.title}</h3>
      <p className={styles.demoDisclosure}>{copy.disclosure}</p>

      <div className={styles.demoFields}>
        <label>
          <span>{copy.nameLabel}</span>
          <input
            value={state.name}
            onChange={(event) => dispatch({ type: "field", field: "name", value: event.target.value })}
            autoComplete="off"
          />
        </label>
        <label>
          <span>{copy.setupLabel}</span>
          <textarea
            value={state.setup}
            onChange={(event) => dispatch({ type: "field", field: "setup", value: event.target.value })}
            rows={2}
          />
        </label>
      </div>

      <fieldset className={styles.demoSetFieldset}>
        <legend>{copy.setsLegend}</legend>
        <div className={styles.demoSetLabels} aria-hidden="true">
          {copy.columns.map((column) => <span key={column}>{column}</span>)}
        </div>
        <div className={styles.demoSets}>
          {state.sets.map((set, index) => (
            <div className={styles.demoSetRow} key={set.id}>
              <label>
                <span className={styles.mobileFieldLabel}>{copy.setTypeLabel(index + 1)}</span>
                <select
                  value={set.type}
                  onChange={(event) => dispatch({ type: "set", id: set.id, field: "type", value: event.target.value })}
                  aria-label={copy.setTypeLabel(index + 1)}
                >
                  <option value="warmup">{copy.warmup}</option>
                  <option value="working">{copy.working}</option>
                </select>
              </label>
              <label>
                <span className={styles.mobileFieldLabel}>{copy.setWeightLabel(index + 1)}</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="1000"
                  step="0.5"
                  value={set.weight}
                  onChange={(event) => dispatch({ type: "set", id: set.id, field: "weight", value: event.target.value })}
                  aria-label={copy.setWeightLabel(index + 1)}
                />
              </label>
              <label>
                <span className={styles.mobileFieldLabel}>{copy.setRepsLabel(index + 1)}</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="100"
                  step="1"
                  value={set.reps}
                  onChange={(event) => dispatch({ type: "set", id: set.id, field: "reps", value: event.target.value })}
                  aria-label={copy.setRepsLabel(index + 1)}
                />
              </label>
              <button type="button" className={styles.removeSet} onClick={() => removeSet(set.id)} aria-label={copy.removeSetLabel(index + 1)}>
                {copy.remove}
              </button>
            </div>
          ))}
        </div>
      </fieldset>

      <div className={styles.demoActions}>
        <button type="button" onClick={addSet}>{copy.add}</button>
        <button type="button" onClick={reset}>{copy.reset}</button>
      </div>
      <p className={styles.demoStatus} role="status" aria-live="polite">{copy.status[statusKey]}</p>
      <p className={styles.demoBoundary}>{copy.boundary}</p>
    </div>
  );
}
