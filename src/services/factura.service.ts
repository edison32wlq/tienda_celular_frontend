import { api } from "./api";

export type Factura = {
  id_factura: string;
  numero_factura: string;
  fecha_emision: string; // o Date en backend
  id_cliente: string;
  id_usuario: string;
  metodo_pago: string;
  subtotal: number | string;
  iva: number | string;
  total: number | string;

  // eager (pueden venir)
  cliente?: any;
  usuario?: any;
  detalles?: any[];
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

export async function getFacturas(params?: { page?: number; limit?: number }) {
  const { data } = await api.get<Pagination<Factura>>("/factura", {
    params: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
    },
  });

  return data; // OJO: aquí NO viene SuccessResponseDto
}

export async function getFacturaById(id: string) {
  const { data } = await api.get<Factura>(`/factura/${id}`);
  return data;
}

export async function createFactura(payload: {
  numero_factura: string;
  fecha_emision: string;
  id_cliente: string;
  id_usuario: string;
  metodo_pago: string;
  subtotal: number;
  iva: number;
  total: number;
}) {
  const { data } = await api.post<Factura>("/factura", payload);
  return data;
}
