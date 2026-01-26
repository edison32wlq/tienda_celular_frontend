import { api } from "./api";

export type Paginated<T> = {
  items: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
};

export type SuccessResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type UsuarioDto = {
  id_usuario: string;
  id_rol: string;
  usuario: string;
  nombres: string;
  apellidos: string;
  correo: string;
  estado: boolean;
  profile?: string | null;
  rol?: { id_rol: string; nombre_rol: string; descripcion: string; isActive: boolean } | null;
};

export async function getUsuarios(params?: {
  page?: number;
  limit?: number;
  search?: string;
  searchField?: "usuario" | "correo" | "nombres" | "apellidos";
  sort?: string;
  order?: "ASC" | "DESC";
  estado?: "true" | "false";
}): Promise<Paginated<UsuarioDto>> {
  const { data } = await api.get<SuccessResponse<Paginated<UsuarioDto>>>("/usuarios", {
    params: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
      search: params?.search || undefined,
      searchField: params?.searchField || undefined,
      sort: params?.sort || undefined,
      order: params?.order || undefined,
      estado: params?.estado || undefined,
    },
  });
  return data.data;
}

export async function createUsuario(payload: {
  id_rol: string;
  usuario: string;
  contrasena: string;
  nombres: string;
  apellidos: string;
  correo: string;
  estado?: boolean;
}): Promise<UsuarioDto> {
  const { data } = await api.post<SuccessResponse<UsuarioDto>>("/usuarios", payload);
  return data.data;
}

export async function updateUsuario(id_usuario: string, payload: Partial<{
  id_rol: string;
  usuario: string;
  contrasena: string;
  nombres: string;
  apellidos: string;
  correo: string;
  estado: boolean;
  profile: string | null;
}>): Promise<UsuarioDto> {
  const { data } = await api.put<SuccessResponse<UsuarioDto>>(`/usuarios/${id_usuario}`, payload);
  return data.data;
}

export async function deleteUsuario(id_usuario: string): Promise<UsuarioDto> {
  const { data } = await api.delete<SuccessResponse<UsuarioDto>>(`/usuarios/${id_usuario}`);
  return data.data;
}
