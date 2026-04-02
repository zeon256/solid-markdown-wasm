import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./monaco";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Missing #root element for React example");
}

createRoot(rootElement).render(<App />);
