export type FieldType = {
  taskName?: string;
  taskDescription?: string;
};

export interface AssignedTaskItem {
  _id: string;
  name: string;
  status: "TO DO" | "IN PROGRESS" | "DONE";
  projectId: {
    _id: string;
    name: string;
  };
}

// project invite multiple member
export interface InviteMultiple {
  emails: string[];
  projectId: string;
  projectRoleId: string;
}
