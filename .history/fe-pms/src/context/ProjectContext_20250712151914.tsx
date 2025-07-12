// fe-pms/src/context/ProjectContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type ProjectContextType = {
  projectId: string | null;
  setProjectId: (id: string | null) => void;
};

export const ProjectContext = createContext<ProjectContextType>({
  projectId: null,
  setProjectId: () => {},
});

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projectId, setProjectId] = useState<string | null>(null);

  return (
    <ProjectContext.Provider value={{ projectId, setProjectId }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => useContext(ProjectContext);
