import { api } from "./api";

export type PerfilCliente = {
  id_cliente: string;
  id_usuario: string;
  cedula: string;
  telefono: string;
  direccion: string;
  usuario?: any;
};

export type SuccessResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

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

// ✅ trae todos (sirve para admin o debug)
export async function getPerfilClientes(params?: { page?: number; limit?: number }) {
  const { data } = await api.get<SuccessResponse<Paginated<PerfilCliente>>>("/perfilClientes", {
    params: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
    },
  });
  return data.data;
}

export async function getPerfilClienteById(id_cliente: string) {
  const { data } = await api.get<SuccessResponse<PerfilCliente>>(`/perfilClientes/${id_cliente}`);
  return data.data;
}

export async function createPerfilCliente(payload: {
  id_usuario: string;
  cedula: string;
  telefono: string;
  direccion: string;
}) {
  const { data } = await api.post<SuccessResponse<PerfilCliente>>("/perfilClientes", payload);
  return data.data;
}

export async function updatePerfilCliente(
  id_cliente: string,
  payload: Partial<{ cedula: string; telefono: string; direccion: string }>
) {
  const { data } = await api.put<SuccessResponse<PerfilCliente>>(`/perfilClientes/${id_cliente}`, payload);
  return data.data;
}
