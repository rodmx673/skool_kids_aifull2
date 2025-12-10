# Skool Kits IA - Backend Setup

Este proyecto contiene la configuración de Docker para ejecutar el backend de la aplicación SKOOL KITS IA.

## Requisitos

- Docker Desktop instalado en tu PC.

## Instrucciones de Ejecución

Para levantar el servidor del backend y conectar el volumen del Data Lake, sigue estos pasos:

1.  **Abre una terminal** (como PowerShell, CMD o la terminal de tu editor de código) en el directorio raíz de este proyecto (donde se encuentran los archivos `Dockerfile` y `docker-compose.yml`).

2.  **Construye y levanta el servicio** ejecutando el siguiente comando:

    ```bash
    docker-compose up --build
    ```
    
    *   `--build`: Fuerza a Docker a reconstruir la imagen si has hecho cambios en el `Dockerfile` o en el código del backend. Puedes omitirlo en ejecuciones posteriores si no has cambiado nada.

3.  **Verificación**: Una vez que el comando termine, el backend estará corriendo y accesible en `http://localhost:5000`. Cualquier archivo que tu backend escriba en la ruta `/app/data` dentro del contenedor, aparecerá físicamente en tu carpeta `C:\conceptos_proy\SKOOL_KITS_DATA_LAKE`.

## Para detener el servicio

-   Para detener el contenedor, presiona `Ctrl + C` en la terminal donde ejecutaste el comando.
-   Para detener y eliminar los contenedores, puedes usar: `docker-compose down`.
