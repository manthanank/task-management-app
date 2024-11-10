export interface Users {
    status: string
    message: string
    data: Data
  }
  
  export interface Data {
    users: User[]
    totalUsers: number
    totalPages: number
    currentPage: number
  }
  
  export interface User {
    _id: string
    email: string
    role: string
    __v: number
  }
  