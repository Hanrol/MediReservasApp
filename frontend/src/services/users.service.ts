import { mockUsers } from '../data/mockUsers.ts'
import { getUsers as readUsers, saveUsers } from '../storage/users.storage.ts'
import type { Role } from '../types/role.ts'
import type { ManagedUserValues, User } from '../types/user.ts'

export function getUsers(): User[] {
  return readUsers()
}

export function getUserById(userId: number): User | undefined {
  return readUsers().find((user) => user.userId === userId)
}

export function userExists(run: string, email: string): boolean {
  return readUsers().some(
    (user) => user.run === run || user.email.toLowerCase() === email.trim().toLowerCase(),
  )
}

export function isUserDataTaken(run: string, email: string, excludedUserId?: number): boolean {
  const normalizedEmail = email.trim().toLowerCase()
  return readUsers().some(
    (user) =>
      user.userId !== excludedUserId &&
      (user.run === run || user.email.toLowerCase() === normalizedEmail),
  )
}

export function createUser(values: ManagedUserValues): User {
  const userId = getNextUserId()
  const user: User = { ...values, userId, authUserId: userId, role: 'PATIENT', active: true }
  saveUsers([...readUsers(), user])
  return user
}

export function editUser(userId: number, changes: Partial<Omit<User, 'userId'>>): User | null {
  const users = readUsers()
  const index = users.findIndex((user) => user.userId === userId)
  if (index < 0) return null
  users[index] = { ...users[index], ...changes, userId }
  saveUsers(users)
  return users[index]
}

export function setUserStatus(userId: number, active: boolean): boolean {
  return Boolean(editUser(userId, { active }))
}

export function changeUserRole(userId: number, role: Role): User | null {
  return editUser(userId, { role })
}

export function initializeUsers(): void {
  const users = readUsers()
  const emails = new Set(users.map((user) => user.email.toLowerCase()))
  let nextId = users.reduce((max, user) => Math.max(max, user.userId), 0) + 1
  const usedIds = new Set(users.map((user) => user.userId))
  const missing = mockUsers
    .filter((user) => !emails.has(user.email.toLowerCase()))
    .map((user) => {
      const userId = usedIds.has(user.userId) ? nextId++ : user.userId
      usedIds.add(userId)
      nextId = Math.max(nextId, userId + 1)
      return { ...user, userId, authUserId: userId }
    })
  if (missing.length) saveUsers([...users, ...missing])
}

function getNextUserId(): number {
  return readUsers().reduce((max, user) => Math.max(max, user.userId), 0) + 1
}
