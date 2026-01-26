import { api } from "./api";

export type OrdenCompra = {
  id_orden_compra: string;
  id_proveedor: string;
  id_usuario: string;
  fecha_emision: string;
  estado: string;
  total: string | number;
  detalles: Array<{
    id_detalle_oc?: string;
    id_celular: string;
    cantidad: number;
    costo_unitario: number;
    subtotal?: number;
    celular?: any;
  }>;
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

export async function getOrdenCompras(params?: {
  page?: number;
  limit?: number;
  estado?: string;
}) {
  const { data } = await api.get<SuccessResponse<Paginated<OrdenCompra>>>("/ordenCompras", {
    params: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
      estado: params?.estado || undefined,
    },
  });
  return data.data;
}

export async function createOrdenCompra(payload: {
  id_proveedor: string;
  id_usuario: string;
  fecha_emision: string; // "YYYY-MM-DD"
  estado: string;
  detalles: Array<{ id_celular: string; cantidad: number; costo_unitario: number }>;
}) {
  const { data } = await api.post<SuccessResponse<OrdenCompra>>("/ordenCompras", payload);
  return data.data;
}

export async function confirmarOrdenCompra(id: string) {
  const { data } = await api.patch<SuccessResponse<OrdenCompra>>(`/ordenCompras/${id}/confirmar`);
  return data.data;
}

export async function anularOrdenCompra(id: string) {
  const { data } = await api.patch<SuccessResponse<OrdenCompra>>(`/ordenCompras/${id}/anular`);
  return data.data;
}

