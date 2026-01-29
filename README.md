# Tienda Celular - DYE

Aplicacion web para explorar celulares, ver detalles y gestionar compras desde una interfaz publica y un panel privado con autenticacion.

## Funciones principales

- Catalogo publico y detalle de productos
- Registro e inicio de sesion
- Carrito y flujo de compra
- Panel privado para gestion de celulares, compras y perfil
- Administracion de usuarios (segun permisos/rol del backend)

## Stack

- React 19 + Vite
- TypeScript
- Tailwind CSS
- React Router
- Axios

## Requisitos

- Node.js (LTS recomendado) y npm
- Backend API disponible (ver VITE_API_URL)

## Instalacion

1. Instala dependencias:

```bash
npm install
```

2. Configura variables de entorno (ver seccion correspondiente).

## Comandos

- `npm run dev`: servidor de desarrollo
- `npm run build`: build de produccion
- `npm run preview`: previsualizar build
- `npm run lint`: lint

## Variables de entorno

Crea un archivo `.env` en la raiz (o ajusta el existente) con:

```
VITE_API_URL=http://localhost:3000
```

## Credenciales de prueba

No se incluyen credenciales de prueba en el repositorio. Usa el registro en la app o las credenciales que entregue el backend.

## Como conectarse a la API

- El cliente usa Axios con `baseURL` desde `VITE_API_URL`. Si no se define, usa `http://localhost:3000`.
- Autenticacion:
  - Login: `POST /auth/login` con `{ correo, contrasena }`
  - Registro: `POST /auth/register` con `{ id_rol, usuario, contrasena, nombres, apellidos, correo, estado? }`
- El token se guarda en `localStorage` con la clave `auth_token` y se envia en `Authorization: Bearer <token>` para rutas protegidas.
