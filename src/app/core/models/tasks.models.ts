export interface Task {
  status: string;
  message: string;
  data: Data;
}

export interface Data {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  priority: string;
  completed: boolean;
  user: string;
  __v: number;
}