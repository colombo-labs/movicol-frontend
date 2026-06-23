import { HeroUIProvider } from "@heroui/react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { Layout } from "./app/Layout";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <HeroUIProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/planificar" replace />} />
          <Route path="planificar" element={null} />
          <Route path="rutas" element={null} />
          <Route path="accesibilidad" element={null} />
          <Route path="metricas" element={null} />
          <Route path="admin" element={null} />
        </Route>
      </Routes>
    </BrowserRouter>
  </HeroUIProvider>,
);
