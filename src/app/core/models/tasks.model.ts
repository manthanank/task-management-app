export interface Tasks {
  status: string
  message: string
  data: Data
}

export interface Data {
  tasks: Task[]
  totalTasks: number
  totalPages: number
  currentPage: number
}

export interface Task {
  _id: string
  title: string
  description: string
  deadline: string
  priority: string
  completed: boolean
  user: User | string
  createdAt?: string
  updatedAt?: string
  __v: number
}

export interface User {
  _id: string
  email: string
  role: string
  __v: number
}
