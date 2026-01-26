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

export type RolDto = {
  id_rol: string;
  nombre_rol: string;
  descripcion: string;
  isActive: boolean;
};

export async function getRoles(params?: {
  page?: number;
  limit?: number;
  search?: string;
  searchField?: "nombre_rol" | "descripcion";
  sort?: string;
  order?: "ASC" | "DESC";
}): Promise<Paginated<RolDto>> {
  const { data } = await api.get<SuccessResponse<Paginated<RolDto>>>("/roles", {
    params: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
      search: params?.search || undefined,
      searchField: params?.searchField || undefined,
      sort: params?.sort || undefined,
      order: params?.order || undefined,
    },
  });
  return data.data;
}

export async function createRol(payload: {
  nombre_rol: string;
  descripcion: string;
  isActive?: boolean;
}): Promise<RolDto> {
  const { data } = await api.post<SuccessResponse<RolDto>>("/roles", payload);
  return data.data;
}

export async function updateRol(id_rol: string, payload: Partial<{
  nombre_rol: string;
  descripcion: string;
  isActive: boolean;
}>): Promise<RolDto> {
  const { data } = await api.put<SuccessResponse<RolDto>>(`/roles/${id_rol}`, payload);
  return data.data;
}

export async function deleteRol(id_rol: string): Promise<RolDto> {
  const { data } = await api.delete<SuccessResponse<RolDto>>(`/roles/${id_rol}`);
  return data.data;
}
