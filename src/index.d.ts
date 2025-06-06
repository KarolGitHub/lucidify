declare module "google.maps";

export {};

declare global {
  interface Window {
    google: any;
    // myChart: Chart
  }
}

import { AxiosResponse, AxiosInstance, AxiosRequestConfig } from "axios";

export interface AuthenticateOptions {
  baseUrl?: string;
  tokenName?: string;
  tokenPrefix?: string;
  tokenHeader?: string;
  tokenType?: string;
  loginUrl?: string;
  registerUrl?: string;
  logoutUrl?: string;
  storageType?: string;
  storageNamespace?: string;
  cookieStorage?: CookieStorageOptions;
  requestDataKey?: string;
  responseDataKey?: string;
  withCredentials?: boolean;
  bindRequestInterceptor?: ($auth: VueAuthenticate) => void;
  providers: { [key: string]: ProviderOptions };
}

export interface CookieStorageOptions {
  domain?: string;
  path?: string;
  secure?: boolean;
}

export interface ProviderOptions {
  name?: string;
  url?: string;
  clientId?: string;
  authorizationEndpoint?: string;
  redirectUri?: string;
  requiredUrlParams?: string[];
  defaultUrlParams?: string[];
  optionalUrlParams?: string[];
  scope?: string[];
  scopePrefix?: string;
  scopeDelimiter?: string;
  state?: string;
  display?: string;
  oauthType?: string;
  responseType?: string;
  responseParams?: {
    code?: string;
    clientId?: string;
    redirectUri?: string;
  };
  popupOptions?: {
    width: number;
    height: number;
  };
}

export declare class VueAuthenticate {
  public constructor(
    $http: AxiosInstance,
    overrideOptions?: AuthenticateOptions
  );
  public login(user: Object): Promise<AxiosResponse>;
  public login(
    user: Object,
    requestOptions: AxiosRequestConfig
  ): Promise<AxiosResponse>;
  public isAuthenticated(): boolean;
  public getToken(): string;
  public setToken(token: string | object): void;
  public register(
    user: any,
    requestOptions?: AxiosRequestConfig
  ): Promise<AxiosResponse>;
  public logout(requestOptions?: AxiosRequestConfig): Promise<AxiosResponse>;
  public authenticate(
    provider: string,
    userData: any,
    requestOptions?: AxiosRequestConfig
  ): Promise<{}>;
}
