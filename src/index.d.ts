declare module "google.maps";

export {};

declare global {
  interface Window {
    google: any;
    // myChart: Chart
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: SpeechGrammarList;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror:
    | ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any)
    | null;
  onnomatch: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult:
    | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any)
    | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
  prototype: SpeechRecognition;
}

declare var SpeechRecognition: SpeechRecognitionConstructor;

interface SpeechGrammarList {
  length: number;
  item(index: number): SpeechGrammar;
  [index: number]: SpeechGrammar;
  addFromURI(src: string, weight?: number): void;
  addFromString(string: string, weight?: number): void;
}

interface SpeechGrammar {
  src: string;
  weight: number;
}

interface SpeechGrammarListConstructor {
  new (): SpeechGrammarList;
  prototype: SpeechGrammarList;
}

declare var SpeechGrammarList: SpeechGrammarListConstructor;

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
    overrideOptions?: AuthenticateOptions,
  );
  public login(user: Object): Promise<AxiosResponse>;
  public login(
    user: Object,
    requestOptions: AxiosRequestConfig,
  ): Promise<AxiosResponse>;
  public isAuthenticated(): boolean;
  public getToken(): string;
  public setToken(token: string | object): void;
  public register(
    user: any,
    requestOptions?: AxiosRequestConfig,
  ): Promise<AxiosResponse>;
  public logout(requestOptions?: AxiosRequestConfig): Promise<AxiosResponse>;
  public authenticate(
    provider: string,
    userData: any,
    requestOptions?: AxiosRequestConfig,
  ): Promise<{}>;
}
