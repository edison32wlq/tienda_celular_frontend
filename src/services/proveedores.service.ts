import { api } from "./api";

export type ProveedorDto = {
  _id: string;
  nombre: string;
  ruc: string;
  telefono: string;
  correo: string;
  direccion: string;
  contacto: string;
  createdAt?: string;
  updatedAt?: string;
};

export async function getProveedores(): Promise<ProveedorDto[]> {
  const { data } = await api.get<ProveedorDto[]>("/proveedores");
  return data;
}

export async function getProveedorById(id: string): Promise<ProveedorDto> {
  const { data } = await api.get<ProveedorDto>(`/proveedores/${id}`);
  return data;
}

export async function createProveedor(payload: Omit<ProveedorDto, "_id" | "createdAt" | "updatedAt">) {
  const { data } = await api.post<ProveedorDto>("/proveedores", payload);
  return data;
}

export async function updateProveedor(
  id: string,
  payload: Partial<Omit<ProveedorDto, "_id" | "createdAt" | "updatedAt">>
) {
  const { data } = await api.put<ProveedorDto>(`/proveedores/${id}`, payload);
  return data;
}

export async function deleteProveedor(id: string) {
  const { data } = await api.delete<ProveedorDto>(`/proveedores/${id}`);
  return data;
}
