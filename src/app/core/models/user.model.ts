export type Users = User[];

export interface User {
  _id: string;
  email: string;
  password: string;
  role: 'user' | 'admin' | 'super';
  __v: number;
}
