"use client";

import { ProjectRole } from "@/models/projectrole/project.role.model";
import { createContext, ReactNode, useContext } from "react";


interface RoleContextProps {
  role: ProjectRole;
  projectId: string;
}

const RoleContext = createContext<RoleContextProps | undefined>(undefined);

interface RoleProviderProps {
  role: ProjectRole;
  projectId: string;
  children: ReactNode;
}

export const RoleProvider = ({ role, projectId, children }: RoleProviderProps) => {
  return (
    <RoleContext.Provider value={{ role, projectId }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = (): RoleContextProps => {
  const context = useContext(RoleContext);
  if (!context) throw new Error("useRole must be used within RoleProvider");
  return context;
};
