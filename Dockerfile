# Usa una imagen oficial de Python como imagen base
FROM python:3.9-slim

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Copia el archivo de dependencias al directorio de trabajo
COPY requirements.txt .

# Instala las dependencias necesarias
RUN pip install --no-cache-dir -r requirements.txt

# Copia el resto del código de la aplicación al directorio de trabajo
COPY . .

# Expone el puerto en el que la aplicación se ejecutará (ej. 5000)
EXPOSE 5000

# Comando para ejecutar la aplicación cuando el contenedor se inicie
# Asume que tu archivo principal se llama 'app.py' y la variable de la app es 'app'
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
