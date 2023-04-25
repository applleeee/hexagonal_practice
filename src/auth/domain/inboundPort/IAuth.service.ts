export interface IAuthService {
  getTest(): string;
}

export const IAuthService = Symbol('IAuthService');
