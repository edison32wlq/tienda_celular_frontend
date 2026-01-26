import { api } from "./api";

export type SuccessResponseDto<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type AuthTokenData = {
  access_token: string;
};

export async function loginApi(payload: {
  correo: string;
  contrasena: string;
}): Promise<string> {
  const { data } = await api.post<SuccessResponseDto<AuthTokenData>>("/auth/login", payload);
  return data.data.access_token;
}

export async function registerApi(payload: {
  id_rol: string;
  usuario: string;
  contrasena: string;
  nombres: string;
  apellidos: string;
  correo: string;
  estado?: boolean;
}): Promise<string> {
  const { data } = await api.post<SuccessResponseDto<AuthTokenData>>("/auth/register", payload);
  return data.data.access_token;
}
