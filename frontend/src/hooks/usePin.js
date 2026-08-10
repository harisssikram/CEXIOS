import { useContext } from "react";
import { PinContext } from "../context/PinContext.jsx";

export function usePin() {
  const ctx = useContext(PinContext);
  if (!ctx) throw new Error("usePin must be used within a PinProvider");
  return ctx;
}
