export type User = {
  id: string;
  email: string;
  password: string;
  name?: string;
};

export type SessionUser = {
  id: string;
  email: string;
  name?: string;
};
