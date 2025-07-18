import { User } from "../user/user.model";

export interface ProjectContributorTag {
  _id: string;
  userId: User;
  joinedAt: string;
  projectRoleId: ProjectRoleTag;
}

export interface ProjectRoleTag {
  _id: string;
  name: string;
}

export interface ProjectContributor {
  _id?: string;
  userId: string;
  projectId: string;
  projectRoleId: string | null;
  joinedAt?: Date;
}
