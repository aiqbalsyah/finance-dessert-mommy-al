import "server-only"

export class UserNotFoundError extends Error {
  constructor(id: string) {
    super(`Pengguna dengan ID ${id} tidak ditemukan.`)
    this.name = "UserNotFoundError"
  }
}

export class UserAlreadyExistsError extends Error {
  constructor() {
    super("Email sudah terdaftar untuk pengguna lain.")
    this.name = "UserAlreadyExistsError"
  }
}

export class CannotDeleteSelfError extends Error {
  constructor() {
    super("Anda tidak dapat menghapus akun Anda sendiri.")
    this.name = "CannotDeleteSelfError"
  }
}

export class LastAdminError extends Error {
  constructor() {
    super("Tidak dapat menghapus atau mengubah role admin terakhir.")
    this.name = "LastAdminError"
  }
}
