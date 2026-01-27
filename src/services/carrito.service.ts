import { api } from "./api";

export type PerfilClienteLite = {
  id_cliente: string;
  nombres?: string;
  apellidos?: string;
  correo?: string;
};

export type Carrito = {
  id_carrito: string;
  id_cliente: string;
  estado: string;
  fecha_creacion?: string;

  // eager: true en tu entity
  cliente?: PerfilClienteLite;

  // a veces llega si lo incluyes, pero no dependemos de esto
  productos?: any[];
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

export type SuccessResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export async function getCarritos(params?: {
  page?: number;
  limit?: number;
  search?: string;
  searchField?: string;
  sort?: string;
  order?: "ASC" | "DESC";
}) {
  const { data } = await api.get<SuccessResponse<Paginated<Carrito>>>("/carrito", {
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

export async function getCarritoById(id: string) {
  const { data } = await api.get<SuccessResponse<Carrito>>(`/carrito/${id}`);
  return data.data;
}

export async function createCarrito(payload: { id_cliente: string; estado: string }) {
  const { data } = await api.post<SuccessResponse<Carrito>>("/carrito", payload);
  return data.data;
}

export async function updateCarrito(id: string, payload: Partial<Carrito>) {
  const { data } = await api.put<SuccessResponse<Carrito>>(`/carrito/${id}`, payload);
  return data.data;
}

export async function deleteCarrito(id: string) {
  const { data } = await api.delete<SuccessResponse<Carrito>>(`/carrito/${id}`);
  return data.data;
}
