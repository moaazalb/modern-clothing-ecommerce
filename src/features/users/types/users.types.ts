/**
 * Defines the data required to create a new user account.
 */
export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  avatar?: string;
}

/**
 * Defines the optional data used to update an existing user.
 */
export interface UpdateUserPayload {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  avatar?: string | null;
}