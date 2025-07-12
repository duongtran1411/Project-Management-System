// fe-pms/src/context/ProjectContext.tsx
"use client";

import { Constants } from "@/lib/constants";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

type ProjectContextType = {
  projectId: string | null;
  setProjectId: (id: string | null) => void;
  token: string | null;
};

export const ProjectContext = createContext<ProjectContextType>({
  projectId: null,
  setProjectId: () => {},
  token: null,
});

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    const access_token = localStorage.getItem(Constants.API_TOKEN_KEY);
    if (access_token) {
      setToken(access_token);
    }
  }, []);

  return (
    <ProjectContext.Provider value={{ projectId, setProjectId, token }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => useContext(ProjectContext);
