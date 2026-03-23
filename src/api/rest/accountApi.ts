import client from './client';
import type { AuthInfo, LoginResult, AccountDeleteInfo, ServerInfo, CreateUserParameter } from '@/types';
import type { GetUserAccountResponse } from '@/types';

export const accountApi = {
  serverInfo: () =>
    client.post<unknown, ServerInfo>('account/server_info', {}),

  createGuest: (params: { advertising_id?: string; af_id?: string; af_adflag?: string; af_advid?: string }) =>
    client.post<unknown, { create_result: AuthInfo }>('account/create_guest', params),

  createDev: (params: { dev_id: string; password: string; advertising_id?: string; af_id?: string; af_adflag?: string; af_advid?: string }) =>
    client.post<unknown, { create_result: AuthInfo }>('account/create_dev', params),

  createPlatform: (params: { auth_platform: string; platform_id: string; platform_token: string; advertising_id?: string; af_id?: string; af_adflag?: string; af_advid?: string }) =>
    client.post<unknown, { create_result: AuthInfo }>('account/create_platform', params),

  login: (params: { authid: string; advertising_id?: string; af_id?: string; af_adflag?: string; af_advid?: string }) =>
    client.post<unknown, { login_result: LoginResult; account_deletion?: AccountDeleteInfo }>('account/login', params),

  superNationLogin: (params: { id: string; cookie: string; advId: string; afId: string }) =>
    client.post<unknown, { login_result: LoginResult }>('account/login_supernation', params),

  loginMapping: (params: { auth_platform: string; platform_id: string; platform_token: string }) =>
    client.post<unknown, void>('account/login_mapping', params),

  changeNickname: (newNickname: string) =>
    client.post<unknown, void>('account/change_nickname', { new_nickname: newNickname }),

  checkNicknameDuplication: (nickname: string) =>
    client.post<unknown, void>('account/check_nickname_duplication', { nickname }),

  changeProfile: (profileUrl: string) =>
    client.post<unknown, void>('account/change_profile', { profileUrl }),

  pushToken: (pushToken: string) =>
    client.post<unknown, void>('account/push_token', { push_token: pushToken }),

  termsAgreement: (agreement: boolean) =>
    client.post<unknown, void>('account/terms_agreement', { agreement }),

  appTrackingAgreement: (attAgreement: boolean) =>
    client.post<unknown, void>('account/att_agreement', { att_agreement: attAgreement }),

  deleteAccount: (message: string) =>
    client.post<unknown, AccountDeleteInfo>('account/delete', { message }),

  cancelDelete: () =>
    client.post<unknown, { msg: string }>('account/delete_cancel'),

  changePassword: (currentPwd: string, changePwd: string) =>
    client.post<unknown, void>('account/update/password', { currentPwd, changePwd }),

  createUser: (params: CreateUserParameter) =>
    client.post<unknown, void>('user/create', params),

  getUser: (startRank: number, size: number) =>
    client.post<unknown, GetUserAccountResponse>('user/get', { startRank, size }),
};
