// context/ProjectContext.tsx
"use client";

import { createContext, useContext } from "react";

export const ProjectContext = createContext<{ projectId: string | null }>({
  projectId: null,
});
export const useProject = () => useContext(ProjectContext);
