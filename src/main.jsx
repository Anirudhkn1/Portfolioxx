import { createRoot } from "react-dom/client";
import "@fontsource/anton";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/700.css";
import "@fontsource/silkscreen";
import "@fontsource/vt323";
import "./styles/base.css";
import App from "./App";

createRoot(document.getElementById("root")).render(<App />);
