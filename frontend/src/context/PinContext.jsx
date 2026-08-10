import { createContext, useCallback, useEffect, useRef, useState } from "react";
import pinSession from "../services/pinSession";
import adminService from "../services/adminService";

export const PinContext = createContext(null);

export function PinProvider({ children }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [msRemaining, setMsRemaining] = useState(0);
  const pendingRef = useRef(null); // the action waiting on unlock

  useEffect(() => {
    const unsub = pinSession.subscribe(() => setMsRemaining(pinSession.msRemaining()));
    const interval = setInterval(() => setMsRemaining(pinSession.msRemaining()), 1000);
    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  /** Call with an async/sync function. Runs it immediately if already unlocked,
   *  otherwise opens the PIN prompt and runs it right after a successful unlock. */
  const requirePin = useCallback((action) => {
    if (pinSession.isUnlocked()) {
      action();
      return;
    }
    pendingRef.current = action;
    setPin("");
    setError("");
    setModalOpen(true);
  }, []);

  async function submitPin(e) {
    e?.preventDefault();
    if (!pin.trim()) return;
    setVerifying(true);
    setError("");
    try {
      const data = await adminService.verifyPin(pin.trim());
      pinSession.unlock(data.pin_token, data.expires_in);
      setModalOpen(false);
      const action = pendingRef.current;
      pendingRef.current = null;
      if (action) action();
    } catch (err) {
      setError(err.response?.data?.detail || "Incorrect PIN. Please try again.");
    } finally {
      setVerifying(false);
    }
  }

  function cancel() {
    pendingRef.current = null;
    setModalOpen(false);
  }

  return (
    <PinContext.Provider value={{ requirePin, msRemaining, isUnlocked: msRemaining > 0 }}>
      {children}
      {modalOpen && (
        <PinPromptOverlay
          pin={pin}
          setPin={setPin}
          onSubmit={submitPin}
          onCancel={cancel}
          verifying={verifying}
          error={error}
        />
      )}
    </PinContext.Provider>
  );
}

function PinPromptOverlay({ pin, setPin, onSubmit, onCancel, verifying, error }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <form
        onSubmit={onSubmit}
        className="relative bg-white rounded-2xl shadow-lift border border-line w-full max-w-sm p-6"
      >
        <h3 className="text-lg font-semibold text-primary mb-1">Enter PIN</h3>
        <p className="text-sm text-muted mb-4">
          This action changes data. Enter the PIN to unlock changes for 2 minutes.
        </p>
        <input
          autoFocus
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="••••"
          className="w-full text-center text-2xl tracking-[0.5em] font-semibold border border-line rounded-xl py-3 outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-100 transition-all"
        />
        {error && <p className="text-danger text-xs mt-2">{error}</p>}
        <div className="flex gap-3 mt-5">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-muted hover:bg-primary-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={verifying || !pin.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-accent-gradient hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {verifying ? "Checking..." : "Unlock"}
          </button>
        </div>
      </form>
    </div>
  );
}
