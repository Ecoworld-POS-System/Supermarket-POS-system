import { createPortal } from "react-dom";

export default function ModalPortal({ children }) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}

// Named import කර ඇති තැන් සඳහාද සහාය වීමට:
export { ModalPortal };