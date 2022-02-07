import {
  ApiMethod, JWTToken, User, UserDto,
} from './models';
import { AuthHelper } from './authHelper';
import { Controller } from './controller';

export class Authorization extends Controller {
  private helper: AuthHelper = new AuthHelper();

  constructor() {
    super('users');
  }

  public signIn(data: User): Promise<JWTToken> {
    return fetch('https://rs-lang-2022.herokuapp.com/signin', {
      method: ApiMethod.Post,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json());
  }

  public checkIfAuthorized(): void {
    const id = localStorage.getItem('user_id');
    const token = localStorage.getItem('user_access_token');

    if (id && token) {
      this.helper.removeLogInBtn();
      this.getUser(token, id)
        .then((user) => {
          this.helper.drawGreeting(user.name);
        });
    }
  }

  public logIn(): void {
    const logInBtn = document.querySelector('.login-btn') as HTMLElement;
    const inputRassword = document.querySelector('.input-login-password') as HTMLInputElement;
    const inputEmail = document.querySelector('.input-login-email') as HTMLInputElement;

    logInBtn.addEventListener('click', (event) => {
      event.preventDefault();

      const userInfo: User = {
        email: inputEmail.value,
        password: inputRassword.value,
      };

      this.signIn({ email: userInfo.email, password: userInfo.password })
        .then((tokenInfo) => {
          if (tokenInfo) {
            this.helper.saveUserInfoInLocalStorage(tokenInfo);
            this.helper.drawGreeting(tokenInfo.name);
            this.helper.removeLogInBtn();
            this.helper.closeAuthorizationForm();
          }
        });
    });
  }

  private getUser(token: string, id: string): Promise<UserDto> {
    return this.get(token, id);
  }
}
