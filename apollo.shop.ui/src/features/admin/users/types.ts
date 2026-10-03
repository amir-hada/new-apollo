export type UserStatus = "active" | "inactive";

export type UserRole = "admin" | "customer";

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber: string;
  status: UserStatus;
  role: UserRole;
  isActive: boolean;
  createdAtUtc?: string;
  lastLoginAtUtc?: string | null;
  roles: string[];
};

export type UsersDialogType = "invite" | "add" | "edit" | "delete";
