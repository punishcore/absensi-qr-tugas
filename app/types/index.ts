export interface User {
  id: string;
  name: string;
  username: string;
  role: 'admin' | 'guru' | 'user';
  password?: string;
  approved?: boolean;
}

export interface Session {
  id: string;
  name: string;
  matkul: string;
  createdAt: string;
  guruId?: string;
  guruName?: string;
}

export interface Attendance {
  userId: string;
  userName: string;
  sessionId: string;
  sessionName: string;
  matkul: string;
  timestamp: string;
}
