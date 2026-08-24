# Voces con Derechos

## 📚 Descripción

**Voces con Derechos** es una plataforma educativa orientada al aprendizaje sobre los derechos y la dignidad de la mujer.

El proyecto utiliza herramientas digitales e interactivas para apoyar el aprendizaje de estudiantes y docentes, promoviendo conocimientos relacionados con:

* Derechos de la mujer
* Igualdad
* Respeto
* Dignidad
* Prevención de la violencia
* Educación y participación

La plataforma se encuentra actualmente en desarrollo y cuenta con una primera versión funcional que integra **frontend, backend y base de datos PostgreSQL**.

---

## 🚀 Características

Actualmente el proyecto incluye:

* 👩‍🏫 Módulo para docentes
* 👨‍🎓 Módulo para estudiantes
* 📚 Gestión de clases
* 🎯 Sistema de misiones
* 📊 Seguimiento del progreso
* 🎮 Actividades interactivas
* 🔐 Sistema de inicio de sesión
* 📝 Registro de usuarios
* 🗄️ Persistencia de información mediante PostgreSQL
* 🔌 API REST desarrollada con ASP.NET Core

---

## 🛠️ Tecnologías utilizadas

### Frontend

* HTML5
* CSS3
* JavaScript
* Fetch API

### Backend

* .NET 8
* ASP.NET Core Web API
* Entity Framework Core
* C#
* Npgsql.EntityFrameworkCore.PostgreSQL

### Base de datos

* PostgreSQL 15
* Docker
* Docker Compose

### Control de versiones

* Git
* GitHub

---

## 📋 Requisitos previos

Antes de ejecutar el proyecto debes tener instalado:

* [.NET SDK 8](https://dotnet.microsoft.com/download/dotnet/8.0)
* [Docker](https://docs.docker.com/get-docker/)
* Docker Compose
* Git

Puedes comprobar las versiones instaladas con:

```bash
dotnet --version
docker --version
docker compose version
git --version
```

---

# 📥 Instalación

## 1. Clonar el repositorio

Clona el repositorio:

```bash
git clone https://github.com/JeanUseda/Voces-Con-Derecho.git
```

Entra al directorio del proyecto:

```bash
cd Voces-Con-Derecho
```

---

## 2. Revisar la estructura del proyecto

La estructura principal del proyecto es similar a:

```text
Voces-Con-Derecho/
│
├── Backend/
│   ├── Controllers/
│   ├── Models/
│   ├── Data/
│   ├── Migrations/
│   ├── Program.cs
│   └── ...
│
├── Frontend/
│   ├── assets/
│   ├── css/
│   ├── js/
│   ├── index.html
│   ├── login.html
│   ├── registro.html
│   ├── dashboard.html
│   └── ...
│
├── docker-compose.yml
└── README.md
```

> La estructura puede cambiar a medida que el proyecto continúe en desarrollo.

---

# 🗄️ Configuración de la base de datos

El proyecto utiliza **PostgreSQL** como sistema de gestión de base de datos.

Para facilitar la configuración, PostgreSQL puede ejecutarse mediante Docker Compose.

Desde la raíz del proyecto ejecuta:

```bash
docker compose up -d
```

Para comprobar que los contenedores están ejecutándose:

```bash
docker compose ps
```

Si todo está correcto, el contenedor de PostgreSQL debería aparecer con estado:

```text
Up
```

### Detener la base de datos

Cuando quieras detener los servicios:

```bash
docker compose down
```

### Ver los logs

Si necesitas revisar algún problema:

```bash
docker compose logs
```

Para consultar específicamente PostgreSQL:

```bash
docker compose logs postgres
```

---

# ⚙️ Configuración del Backend

Entra en la carpeta del backend:

```bash
cd Backend
```

Restaura las dependencias:

```bash
dotnet restore
```

Compila el proyecto:

```bash
dotnet build
```

---

## 🔐 Configuración de conexión a PostgreSQL

La conexión entre ASP.NET Core y PostgreSQL debe estar configurada mediante la cadena de conexión correspondiente.

Por ejemplo:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=voces_con_derecho;Username=postgres;Password=tu_password"
  }
}
```

> No subas contraseñas reales al repositorio. Para entornos de desarrollo o producción se recomienda utilizar variables de entorno o mecanismos seguros de configuración.

---

# 🧱 Migraciones de Entity Framework Core

Si el proyecto utiliza migraciones de Entity Framework Core, puedes aplicar las migraciones existentes con:

```bash
dotnet ef database update
```

Si el comando `dotnet ef` no está instalado:

```bash
dotnet tool install --global dotnet-ef
```

Después vuelve a ejecutar:

```bash
dotnet ef database update
```

Esto permitirá crear o actualizar las tablas de la base de datos de acuerdo con las migraciones del proyecto.

---

# ▶️ Ejecutar el Backend

Desde la carpeta `Backend`:

```bash
dotnet run
```

ASP.NET Core mostrará en la terminal las direcciones donde está ejecutándose la aplicación.

Por ejemplo:

```text
Now listening on: http://localhost:5000
```

La dirección exacta puede variar dependiendo de la configuración del proyecto.

---

# 📖 Swagger / API

Si Swagger está habilitado, puedes acceder a la documentación interactiva de la API desde el navegador.

Por ejemplo:

```text
http://localhost:5000/swagger
```

o:

```text
https://localhost:7000/swagger
```

La URL exacta dependerá de los puertos configurados en el proyecto.

Swagger permite consultar y probar los diferentes endpoints de la API.

---

# 🌐 Ejecutar el Frontend

El frontend se encuentra dentro de:

```text
Frontend/
```

Puedes abrir el proyecto utilizando un servidor local.

Una opción sencilla es utilizar **Live Server** desde Visual Studio Code.

### Con Visual Studio Code

1. Abre el proyecto en Visual Studio Code.
2. Entra a la carpeta `Frontend`.
3. Abre `index.html`.
4. Ejecuta **Open with Live Server**.
5. El navegador abrirá automáticamente la aplicación.

También puedes utilizar cualquier servidor HTTP local compatible.

> Se recomienda utilizar un servidor local en lugar de abrir directamente los archivos HTML con `file://`, especialmente porque el frontend realiza peticiones a la API mediante JavaScript.

---

# 🔌 Conexión Frontend → Backend

El frontend consume los servicios proporcionados por la API de ASP.NET Core.

La configuración de la URL de la API se encuentra principalmente en los archivos JavaScript relacionados con la comunicación con el backend.

Antes de utilizar el sistema, verifica que:

1. PostgreSQL esté ejecutándose.
2. El backend esté ejecutándose.
3. La URL de la API utilizada por el frontend sea correcta.
4. No existan errores de CORS.

---

# 🧪 Flujo recomendado para ejecutar el proyecto

Cada vez que quieras levantar el proyecto desde cero:

### 1. Iniciar PostgreSQL

```bash
docker compose up -d
```

### 2. Entrar al Backend

```bash
cd Backend
```

### 3. Restaurar dependencias

```bash
dotnet restore
```

### 4. Aplicar migraciones

```bash
dotnet ef database update
```

### 5. Ejecutar la API

```bash
dotnet run
```

### 6. Ejecutar el Frontend

En otra terminal abre el proyecto con Visual Studio Code y utiliza **Live Server** sobre:

```text
Frontend/index.html
```

### 7. Probar la aplicación

Desde el navegador accede a la dirección proporcionada por Live Server.

También puedes comprobar la API mediante Swagger si está habilitado.

---

# 🧰 Comandos útiles

### Ver contenedores

```bash
docker compose ps
```

### Iniciar servicios

```bash
docker compose up -d
```

### Detener servicios

```bash
docker compose down
```

### Ver logs

```bash
docker compose logs
```

### Restaurar dependencias .NET

```bash
dotnet restore
```

### Compilar

```bash
dotnet build
```

### Ejecutar backend

```bash
dotnet run
```

### Actualizar base de datos

```bash
dotnet ef database update
```

---

# 🔀 Control de versiones

Para descargar los últimos cambios:

```bash
git pull origin main
```

Para comprobar el estado del repositorio:

```bash
git status
```

Para crear un commit:

```bash
git add .
git commit -m "Descripción del cambio"
```

Para subir los cambios:

```bash
git push origin main
```

---

# 📌 Estado del proyecto

🚧 **En desarrollo**

El proyecto continúa en proceso de desarrollo y pueden incorporarse nuevas funcionalidades, mejoras de diseño, nuevos módulos y modificaciones en la estructura de la base de datos.

---

# 👥 Equipo

**Voces con Derechos**

Proyecto académico orientado al desarrollo de una plataforma educativa interactiva sobre derechos, igualdad, respeto y dignidad de la mujer.

---

## 📄 Licencia

Este proyecto ha sido desarrollado con fines académicos.
