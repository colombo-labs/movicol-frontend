import { HeroUIProvider } from "@heroui/react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { App } from "./app/App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <HeroUIProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </HeroUIProvider>,
);
