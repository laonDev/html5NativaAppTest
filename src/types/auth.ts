export interface AuthInfo {
  authid: string;
  accountidx: number;
  auth_platform: string;
}

export interface LoginResult {
  authid: string;
  accountidx: number;
  token: string;
  server_group: number;
  useridx: number;
}

export interface AccountDeleteInfo {
  deleted: boolean;
  deleted_request_date: string;
  deleted_start_date: string;
}

export interface CreateUserParameter {
  userId: string;
  password: string;
  email: string;
  securityQuestion: string;
  securityAnswer: string;
  gender: string;
  lastName: string;
  firstName: string;
  birthDate: string;
  adress: string;
  currency: string;
  promoCode: string;
  phoneNumber: string;
}

export interface ServerInfo {
  status: number;
  message?: string;
  version?: string;
  multiServerUrl?: string;
  suprStompUrl?: string;
}
