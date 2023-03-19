import { axiosSingleton } from "../index";
import { SurePromise } from "../../interface/SurePromise";
import { AxiosService } from "../axios/axiosService";
const axiosService: AxiosService<any, any> = axiosSingleton<any, any>();

export default class Stock {
  static async getStockPriceHistoryData(route: any): Promise<SurePromise<any>> {
    return await axiosService.get(undefined, route);
  }
}
