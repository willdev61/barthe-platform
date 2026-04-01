FROM python:3.13-slim

WORKDIR /app

# Dépendances système
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Installer uv (gestionnaire Python rapide)
RUN pip install uv

# Copier et installer les dépendances Python
COPY requirements.txt .
RUN uv pip install --system -r requirements.txt

# Copier le code source
COPY . .

# Créer le dossier uploads
RUN mkdir -p uploads

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
