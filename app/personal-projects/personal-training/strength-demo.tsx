"use client";

import { useReducer, useState } from "react";
import styles from "./personal-training.module.css";

type DemoSet = {
  id: number;
  type: "Warm-up" | "Working";
  weight: string;
  reps: string;
};

type DemoState = {
  name: string;
  setup: string;
  sets: DemoSet[];
  nextId: number;
};

type DemoAction =
  | { type: "field"; field: "name" | "setup"; value: string }
  | { type: "set"; id: number; field: "type" | "weight" | "reps"; value: string }
  | { type: "add" }
  | { type: "remove"; id: number }
  | { type: "reset" };

const INITIAL_STATE: DemoState = {
  name: "Studio Cable Row — Demo",
  setup: "Seat 4 · neutral grip · illustrative",
  sets: [
    { id: 1, type: "Warm-up", weight: "25", reps: "12" },
    { id: 2, type: "Working", weight: "42.5", reps: "8" },
  ],
  nextId: 3,
};

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
      sets: [...state.sets, { id: state.nextId, type: "Working", weight: "40", reps: "8" }],
      nextId: state.nextId + 1,
    };
  }
  if (action.type === "remove") return { ...state, sets: state.sets.filter((set) => set.id !== action.id) };
  return INITIAL_STATE;
}

export default function StrengthDemo() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [status, setStatus] = useState("Illustrative session ready.");

  const addSet = () => {
    dispatch({ type: "add" });
    setStatus("Temporary demo set added.");
  };

  const removeSet = (id: number) => {
    dispatch({ type: "remove", id });
    setStatus("Temporary demo set removed.");
  };

  const reset = () => {
    dispatch({ type: "reset" });
    setStatus("Demo reset to its fictional starting values.");
  };

  return (
    <div className={styles.demoPanel} aria-labelledby="strength-demo-title">
      <div className={styles.demoHeader}>
        <div>
          <span className={styles.demoBadge}>DEMO</span>
          <p>INTERACTIVE DEMO · ILLUSTRATIVE DATA ONLY</p>
        </div>
        <p className={styles.demoSession}>Illustrative session</p>
      </div>

      <h3 id="strength-demo-title">A temporary strength set builder</h3>
      <p className={styles.demoDisclosure}>No account is created. Nothing is saved. Refreshing this page resets the demo.</p>

      <div className={styles.demoFields}>
        <label>
          <span>Exercise or machine name</span>
          <input
            value={state.name}
            onChange={(event) => dispatch({ type: "field", field: "name", value: event.target.value })}
            autoComplete="off"
          />
        </label>
        <label>
          <span>Setup note</span>
          <textarea
            value={state.setup}
            onChange={(event) => dispatch({ type: "field", field: "setup", value: event.target.value })}
            rows={2}
          />
        </label>
      </div>

      <fieldset className={styles.demoSetFieldset}>
        <legend>Temporary training sets</legend>
        <div className={styles.demoSetLabels} aria-hidden="true">
          <span>Set type</span><span>Weight (kg)</span><span>Reps</span><span>Action</span>
        </div>
        <div className={styles.demoSets}>
          {state.sets.map((set, index) => (
            <div className={styles.demoSetRow} key={set.id}>
              <label>
                <span className={styles.mobileFieldLabel}>Set {index + 1} type</span>
                <select
                  value={set.type}
                  onChange={(event) => dispatch({ type: "set", id: set.id, field: "type", value: event.target.value })}
                  aria-label={`Set ${index + 1} type`}
                >
                  <option>Warm-up</option>
                  <option>Working</option>
                </select>
              </label>
              <label>
                <span className={styles.mobileFieldLabel}>Set {index + 1} weight in kilograms</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="1000"
                  step="0.5"
                  value={set.weight}
                  onChange={(event) => dispatch({ type: "set", id: set.id, field: "weight", value: event.target.value })}
                  aria-label={`Set ${index + 1} weight in kilograms`}
                />
              </label>
              <label>
                <span className={styles.mobileFieldLabel}>Set {index + 1} repetitions</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="100"
                  step="1"
                  value={set.reps}
                  onChange={(event) => dispatch({ type: "set", id: set.id, field: "reps", value: event.target.value })}
                  aria-label={`Set ${index + 1} repetitions`}
                />
              </label>
              <button type="button" className={styles.removeSet} onClick={() => removeSet(set.id)} aria-label={`Remove demo set ${index + 1}`}>
                Remove
              </button>
            </div>
          ))}
        </div>
      </fieldset>

      <div className={styles.demoActions}>
        <button type="button" onClick={addSet}>Add demo set</button>
        <button type="button" onClick={reset}>Reset demo</button>
      </div>
      <p className={styles.demoStatus} role="status" aria-live="polite">{status}</p>
      <p className={styles.demoBoundary}>Not connected to the private training app · all values are fictional and temporary.</p>
    </div>
  );
}
