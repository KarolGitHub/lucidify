import { UserInfo } from "firebase/auth";
export interface User extends UserInfo {
  id: string;
  created?: Date;
  isVerified?: boolean;
  jwtToken?: string;
  lastName?: string;
  role?: string;
  title?: string;
  updated: unknown;
  balance?: number;
}
