export interface EmailTemplate {
    _id: string;
    name: string;
    subject: string;
    header?: string;
    body: string;
    footer?: string;
    variables?: string[];
    status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
    createdBy: string;
    updatedBy: string;
    createdAt: string;
    updatedAt: string;
  }