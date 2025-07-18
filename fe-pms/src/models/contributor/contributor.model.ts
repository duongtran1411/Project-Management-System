export interface Contributor {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
    avatar: string;
  };
  roleId: string | null;
  joinedAt: string;
}
