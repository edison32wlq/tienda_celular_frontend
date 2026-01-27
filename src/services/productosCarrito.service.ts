import { api } from "./api";

// Esta entidad trae "celular" eager:true
export type CelularLite = {
  id_celular: string;
  codigo: string;
  marca: string;
  modelo: string;
  precio_venta?: string | number;
};

export type ProductoCarrito = {
  id_producto_carrito: string;
  id_carrito: string;
  id_celular: string;
  cantidad: number;
  precio_unitario: string | number;

  celular?: CelularLite; // eager
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

export async function getProductosCarrito(params?: {
  page?: number;
  limit?: number;
  search?: string;
  searchField?: string;
  sort?: string;
  order?: "ASC" | "DESC";
}) {
  const { data } = await api.get<SuccessResponse<Paginated<ProductoCarrito>>>("/productosCarrito", {
    params: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 50,
      search: params?.search || undefined,
      searchField: params?.searchField || undefined,
      sort: params?.sort || undefined,
      order: params?.order || undefined,
    },
  });

  return data.data;
}

export async function createProductoCarrito(payload: {
  id_carrito: string;
  id_celular: string;
  cantidad: number;
  precio_unitario: number;
}) {
  const { data } = await api.post<SuccessResponse<ProductoCarrito>>("/productosCarrito", payload);
  return data.data;
}

export async function updateProductoCarrito(
  id: string,
  payload: Partial<{
    id_carrito: string;
    id_celular: string;
    cantidad: number;
    precio_unitario: number;
  }>
) {
  const { data } = await api.put<SuccessResponse<ProductoCarrito>>(`/productosCarrito/${id}`, payload);
  return data.data;
}

export async function deleteProductoCarrito(id: string) {
  const { data } = await api.delete<SuccessResponse<ProductoCarrito>>(`/productosCarrito/${id}`);
  return data.data;
}
