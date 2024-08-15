export interface Tasks {
  status: string
  message: string
  data: Task[]
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
