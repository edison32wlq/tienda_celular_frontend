import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext"; // Para acceder al usuario logueado
import { getFacturas } from "../../services/factura.service"; // Obtener facturas
import { getOrdenCompras } from "../../services/orden-compras.service"; // Obtener ordenes de compra

export default function KardexPage() {
  const { user } = useAuth(); // Para obtener el usuario logueado
  const [facturas, setFacturas] = useState<any[]>([]); // Historial de facturas (ventas)
  const [ordenes, setOrdenes] = useState<any[]>([]); // Historial de órdenes de compra (entradas)
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState<string | null>(null); // Error
  const [noDataMessage, setNoDataMessage] = useState<string>(""); // Mensaje de no datos

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        // Obtener todas las facturas (ventas) y órdenes de compra (entradas)
        const facturasData = await getFacturas({ page: 1, limit: 500 });
        const ordenesData = await getOrdenCompras({ page: 1, limit: 500 });

        setFacturas(facturasData.items);
        setOrdenes(ordenesData.items);

        // Verificar si hay datos
        if (facturasData.items.length === 0 && ordenesData.items.length === 0) {
          setNoDataMessage("No hay registros disponibles.");
        }
      } catch (error) {
        setError("Error al obtener los movimientos de Kardex.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistorial();
  }, [user]); // Dependencia para que se recargue cuando el `user` cambie

  const renderDetalleCelulares = (detalles: any[]) => {
    // Verifica que detalles sea un array antes de mapear
    if (!Array.isArray(detalles)) return null; // Si no es un array, no renderiza nada

    return detalles.map((detalle: any, index: number) => {
      const nombre = `${detalle?.celular?.marca} ${detalle?.celular?.modelo}`;
      const cantidad = detalle?.cantidad || 0;  // Asegurarse de que cantidad exista
      return (
        <div key={index}>
          {nombre} - x{cantidad}
        </div>
      );
    });
  };

  const safeTotal = (total: any) => {
    // Verificamos que total sea un número antes de usar .toFixed()
    return isNaN(Number(total)) ? 0 : Number(total).toFixed(2);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-white">Kardex</h1>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-t-4 border-blue-400 rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="mb-4 p-4 bg-red-500 text-white rounded-lg text-center">{error}</div>
      ) : (
        <div>
          {noDataMessage ? (
            <div className="mb-4 p-4 bg-yellow-500 text-white rounded-lg text-center">{noDataMessage}</div>
          ) : (
            <div>
              {/* Tabla de Ventas */}
              <h2 className="text-2xl font-semibold mb-4 text-white">Movimientos de Venta (Facturas)</h2>
              <table className="min-w-full table-auto border-collapse table-dark text-white rounded-lg shadow-md">
                <thead className="bg-blue-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Fecha</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Tipo Movimiento</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Origen</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Productos Comprados/Vendidos</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {facturas.map((item, index) => {
                    const detalles = item.detalles || []; // Asegúrate de que "detalles" sea un array
                    const total = item.total || 0; // Asegúrate de que sea un número

                    return (
                      <tr key={index} className="border-b hover:bg-gray-700">
                        <td className="px-6 py-3">{new Date(item.fecha_emision).toLocaleDateString()}</td>
                        <td className="px-6 py-3">Salida</td>
                        <td className="px-6 py-3">Venta</td>
                        <td className="px-6 py-3">{renderDetalleCelulares(detalles)}</td>
                        <td className="px-6 py-3">{safeTotal(total)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Tabla de Compras */}
              <h2 className="text-2xl font-semibold mb-4 mt-6 text-white">Movimientos de Compra (Ordenes de Compra)</h2>
              <table className="min-w-full table-auto border-collapse table-dark text-white rounded-lg shadow-md">
                <thead className="bg-green-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Fecha</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Tipo Movimiento</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Origen</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Productos Comprados/Vendidos</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {ordenes.map((item, index) => {
                    const detalles = item.detalles || []; // Asegúrate de que "detalles" sea un array
                    const total = item.total || 0; // Asegúrate de que sea un número

                    return (
                      <tr key={index} className="border-b hover:bg-gray-700">
                        <td className="px-6 py-3">{new Date(item.fecha_emision).toLocaleDateString()}</td>
                        <td className="px-6 py-3">Entrada</td>
                        <td className="px-6 py-3">Compra Proveedor</td>
                        <td className="px-6 py-3">{renderDetalleCelulares(detalles)}</td>
                        <td className="px-6 py-3">{safeTotal(total)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
