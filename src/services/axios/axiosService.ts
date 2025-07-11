// @ts-nocheck
import loading from "../../store/modules/loading";
import apiClient from "./config";
import { AxiosError, AxiosResponse } from "axios";
import surePromise from "../../utils/surePromise";
import { Toast } from "../../interface/Toast";
import { notifications } from "../../store";
import { SurePromise } from "../../interface/SurePromise";
import { AuthErrorHandler } from "@/utils/authErrorHandler";

export class AxiosService<T, U> {
  async post(data: U, url: string): Promise<SurePromise<T>> {
    loading.actions.start("Loading...");
    try {
      return await surePromise(apiClient.post<AxiosResponse>(url, data));
    } catch (err: unknown) {
      if (err && err.response) {
        const axiosError = err as AxiosError;

        // Don't show error toast if it's an auth error (auto logout will handle it)
        if (!AuthErrorHandler.isAuthError(axiosError.response)) {
          const toast: Toast = {
            body: axiosError.response?.data.message,
            tittle: "Error",
            type: "error",
            show: true,
          };
          notifications.actions.presentToast(toast);
        }
      }
      throw err;
    } finally {
      loading.actions.finish();
    }
  }

  async get(data: U, url: string): Promise<SurePromise<T>> {
    loading.actions.start("Loading...");
    try {
      return await surePromise(apiClient.get<AxiosResponse>(url, data));
    } catch (err: unknown) {
      if (err && err.response) {
        const axiosError = err as AxiosError;

        // Don't show error toast if it's an auth error (auto logout will handle it)
        if (!AuthErrorHandler.isAuthError(axiosError.response)) {
          const toast: Toast = {
            body: axiosError.response?.data.message,
            tittle: "Error",
            type: "error",
            show: true,
          };
          notifications.actions.presentToast(toast);
        }
      }
      throw err;
    } finally {
      loading.actions.finish();
    }
  }
}

export const axiosSingleton = function <T, U>() {
  return new AxiosService<T, U>();
};

//export const axiosSingleton = new AxiosService()
