import { api } from "./api";

export type DetalleFactura = {
  id_detalle_factura: string;
  id_factura: string;
  id_celular: any; // ⚠️ backend dice number, tu app usa uuid -> lo dejo any
  cantidad: number;
  precio_unitario: number | string;
  subtotal: number | string;

  // eager
  celular?: any;
};

export type Pagination<T> = {
  items: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
  links?: any;
};

export async function getDetallesFactura(params?: { page?: number; limit?: number }) {
  const { data } = await api.get<Pagination<DetalleFactura>>("/detalle-factura", {
    params: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 50,
    },
  });

  return data;
}

export async function createDetalleFactura(payload: {
  id_factura: string;
  id_celular: any; // ⚠️
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}) {
  const { data } = await api.post<DetalleFactura>("/detalle-factura", payload);
  return data;
}
