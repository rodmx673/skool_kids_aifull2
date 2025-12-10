
import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS

# 1. Inicialización de la aplicación Flask
app = Flask(__name__)

# 2. Habilitar CORS para permitir peticiones desde cualquier origen
CORS(app)

# 3. Ruta base para el Data Lake dentro del contenedor Docker
DATA_LAKE_PATH = '/app/data'

# 4. Función de persistencia interna
def _save_to_json(file_name, new_data):
    """
    Lee un archivo JSON, añade nuevos datos a una lista y lo guarda de nuevo.
    Si el archivo no existe, lo crea.
    """
    # Asegurarse de que el directorio del Data Lake exista
    os.makedirs(DATA_LAKE_PATH, exist_ok=True)
    
    # Construir la ruta completa del archivo
    file_path = os.path.join(DATA_LAKE_PATH, f"{file_name}.json")
    
    records = []
    try:
        # Intentar leer el contenido existente
        if os.path.exists(file_path) and os.path.getsize(file_path) > 0:
            with open(file_path, 'r', encoding='utf-8') as f:
                records = json.load(f)
        
        # Asegurarse de que 'records' sea una lista
        if not isinstance(records, list):
            records = []
            
    except (json.JSONDecodeError, IOError):
        # Si el archivo está corrupto o vacío, empezamos con una lista vacía
        records = []

    # Añadir los nuevos datos
    records.append(new_data)
    
    # Escribir la lista actualizada de nuevo en el archivo
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(records, f, indent=4, ensure_ascii=False)
        return True
    except IOError as e:
        print(f"Error al escribir en el archivo: {e}")
        return False

# 5. Endpoint para recibir y guardar datos
@app.route('/api/data_store', methods=['POST'])
def data_store():
    """
    Endpoint para recibir datos y guardarlos en el archivo JSON correspondiente.
    """
    # Obtener el JSON de la petición
    payload = request.get_json()

    if not payload or 'file_name' not in payload or 'data' not in payload:
        return jsonify({"status": "error", "message": "Petición inválida. Se requiere 'file_name' y 'data'."}), 400

    file_name = payload['file_name']
    data = payload['data']

    if not isinstance(file_name, str) or not file_name.strip():
        return jsonify({"status": "error", "message": "'file_name' debe ser un string no vacío."}), 400

    # Guardar los datos usando la función de persistencia
    if _save_to_json(file_name, data):
        return jsonify({"status": "success", "message": f"Datos guardados correctamente en '{file_name}.json'"}), 200
    else:
        return jsonify({"status": "error", "message": "No se pudieron guardar los datos."}), 500

# Punto de entrada para ejecutar la aplicación
if __name__ == '__main__':
    # Escucha en todas las interfaces de red, necesario para Docker
    app.run(host='0.0.0.0', port=5000, debug=True)

