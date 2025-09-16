import React from "react";
import { createRoot } from "react-dom/client";
import Checklist from "./checklist";
import "./checklist.css";

createRoot(document.getElementById("root"))
    .render(React.createElement(Checklist));
