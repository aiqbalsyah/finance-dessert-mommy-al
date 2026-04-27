export interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: UserRole
}

export type UserRole = "admin" | "editor" | "viewer"

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}
