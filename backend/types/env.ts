export type JwtPayload = {
  id: number;
  email: string;
  username: string;
};

export type Env = {
  Variables: {
    JWT_SECRET: string;
    user: JwtPayload;
  };
};
