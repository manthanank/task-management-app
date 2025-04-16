export interface Organizations {
  status: string
  message: string
  data: OrganizationsData
}

export interface OrganizationsData {
  organizations: Organization[]
  totalOrganizations: number
  totalPages: number
  currentPage: number
}

export interface Organization {
  _id: string
  name: string
  description: string
  logo?: string
  createdAt: string
  owner: {
    _id: string
    email: string
  }
  members: Member[]
}

export interface Member {
  user: {
    _id: string
    email: string
  }
  role: 'admin' | 'member'
  joinedAt: string
  _id: string
}

export interface SingleOrganization {
  status: string
  message: string
  data: Organization
}