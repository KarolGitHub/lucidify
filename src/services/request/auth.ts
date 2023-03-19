import { Login, Register } from "../../interface/Auth";
import { axiosSingleton } from "../index";
import { SurePromise } from "../../interface/SurePromise";
import { UserCredential } from "firebase/auth";
import { AxiosService } from "../axios/axiosService";

export default class Auth {
  private axiosService: AxiosService<UserCredential & Register, Login> =
    axiosSingleton<UserCredential & Register, Login>();

  //private axiosService = new AxiosService<Profile & Register, Login>()

  public async login(userForm: Login): Promise<SurePromise<UserCredential>> {
    //axiosService<Profile, Login>()
    //return await axiosService<Profile, Login>.instance.post()(userForm, '/accounts/authenticate')
    return await this.axiosService.post(userForm, "/accounts/authenticate");
  }

  public async register(
    registerForm: Register
  ): Promise<SurePromise<UserCredential>> {
    //const axiosService = axiosService<Login, Register>()
    return await this.axiosService.post(registerForm, "/accounts/register");
  }
}
