import { api } from "./api";

export type Celular = {
  id_celular: string;
  codigo: string;
  marca: string;
  modelo: string;
  color: string;
  almacenamiento: string;
  ram: string;
  precio_venta: string | number;
  costo_compra: string | number;
  stock_actual: number;
  estado: string;
  descripcion: string;
};

// ✅ alias para tu componente (CelularDto)
export type CelularDto = Celular;

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

export async function getCelulares(params?: {
  page?: number;
  limit?: number;
  search?: string;
  searchField?: string;
  sort?: string;
  order?: "ASC" | "DESC";
}) {
  const { data } = await api.get<SuccessResponse<Paginated<Celular>>>("/celulares", {
    params: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
      search: params?.search || undefined,
      searchField: params?.searchField || undefined,
      sort: params?.sort || undefined,
      order: params?.order || undefined,
    },
  });

  return data.data; // paginado directo
}

// ✅ GET /celulares/:id
export async function getCelularById(id: string): Promise<Celular> {
  const { data } = await api.get<SuccessResponse<Celular>>(`/celulares/${id}`);
  return data.data; // celular directo
}

export async function createCelular(payload: Partial<Celular>) {
  const { data } = await api.post<SuccessResponse<Celular>>("/celulares", payload);
  return data.data;
}

export async function updateCelular(id: string, payload: Partial<Celular>) {
  const { data } = await api.put<SuccessResponse<Celular>>(`/celulares/${id}`, payload);
  return data.data;
}

export async function deleteCelular(id: string) {
  const { data } = await api.delete<SuccessResponse<Celular>>(`/celulares/${id}`);
  return data.data;
}
