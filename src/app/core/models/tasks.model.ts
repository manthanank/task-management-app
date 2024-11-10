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
  user: string
  __v: number
}
