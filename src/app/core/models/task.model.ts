export interface Task {
  status: string
  message: string
  data: Data
}

export interface Data {
  _id: string
  title: string
  description: string
  deadline: string
  priority: string
  completed: boolean
  user: User
  subtasks?: Subtask[];
  __v: number
}

export interface Subtask {
  _id?: string;
  title: string;
  completed: boolean;
}

export interface User {
  _id: string
  email: string
  role: string
  __v: number
}
