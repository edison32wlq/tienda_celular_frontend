import { api } from "./api";  // Tu archivo de configuración para Axios

export type Kardex = {
  id_kardex: string;
  fecha_movimiento: string;
  tipo_movimiento: string;
  origen: string;
  id_documento: string;
  cantidad: number;
  costo_unitario: number;
  stock_anterior: number;
  stock_nuevo: number;
};

export type Paginated<T> = {
  data: any;
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

// Obtener los movimientos de Kardex por celular
export async function getKardexByCelular(id_celular: string = '', page: number = 1, limit: number = 10) {
  try {
    // Si el id_celular está vacío, no se pasa el parámetro 'search'
    const params: any = {
      page,
      limit,
    };

    // Solo agregar 'search' si se tiene un id_celular
    if (id_celular) {
      params.search = id_celular;
    }

    const { data } = await api.get<SuccessResponse<Paginated<Kardex>>>("/kardex", {
      params,
    });

    return data.data; // Devuelve los movimientos de Kardex
  } catch (error) {
    console.error("Error al obtener los movimientos de Kardex:", error);
    throw new Error("Error al obtener los movimientos de Kardex.");
  }
}
