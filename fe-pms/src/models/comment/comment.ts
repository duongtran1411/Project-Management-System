export interface Comment {
  _id?: string;
  content: string;
  task: string;
  author: {
    name: string;
    avatar: string;
  };
  mentions: string[];
  attachments: {
    filename: string;
    url: string;
  }[];
  createdAt?: string;
  isEdited?: boolean;
  editedAt?: string;
}
