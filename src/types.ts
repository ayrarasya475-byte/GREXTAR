export interface Prompt {
  id: string;
  name: string;
  content: string;
  modelId: string;
  category: 'legal' | 'illegal';
  likes: number;
  copyCount: number;
  downloadCount: number;
  createdAt: any;
  createdBy: string;
}

export interface Model {
  id: string;
  name: string;
}

export interface Suggestion {
  id: string;
  promptName: string;
  category: 'legal' | 'illegal';
  description: string;
  userEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
}

export interface Message {
  id: string;
  userId: string;
  userEmail: string;
  text: string;
  sender: 'user' | 'admin';
  timestamp: any;
}
