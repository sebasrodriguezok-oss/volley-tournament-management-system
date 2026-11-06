# 🏐 Tournament Voley App - Backend (API)

Este proyecto es la API encargada de gestionar la lógica de torneos de vóley.

## 🚀 Arquitectura
La API sigue un patrón de capas para asegurar la escalabilidad y facilidad de mantenimiento:
- **Controladores (Controllers)**: Manejan las peticiones HTTP y validan las entradas.
- **Servicios (Services)**: Contienen la lógica de negocio (ej. generación de fixtures).
- **Repositorios (Repositories)**: Abstraen el acceso a la base de datos (implementación actual en MongoDB).
- **Entidades (Entities)**: Definen la estructura de los datos.

## 📦 Módulos Implementados
1. **Tournaments**: CRUD de torneos y gestión de categorías.
2. **Teams**: Gestión de equipos y entrenadores.
3. **Enrollments**: Proceso de inscripción de equipos a torneos.
4. **Matches**: Gestión de partidos y actualización de marcadores.
5. **Fixture**: Generador automático de calendarios (sistema Round Robin).
6. **Standings**: Cálculo automático de tablas de posiciones basado en resultados.

## 🛠️ Tecnologías
- **Runtime**: Node.js
- **Lenguaje**: TypeScript
- **Base de Datos**: MongoDB
- **Documentación**: Swagger UI (disponible en la ruta de docs de la API).
- **Infraestructura**: Docker Compose para despliegue rápido.

## 🚦 Endpoints Principales
- `/api/tournaments`: Gestión de torneos.
- `/api/teams`: Gestión de equipos.
- `/api/enrollments`: Inscripciones.
- `/api/matches`: Gestión de partidos.
- `/api/standings`: Tablas de posiciones.
