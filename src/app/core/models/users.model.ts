export type Users = User[];

export interface User {
  _id: string;
  email: string;
  password: string;
  role: string;
  __v: number;
}
