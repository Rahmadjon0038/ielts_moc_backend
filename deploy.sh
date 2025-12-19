#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="docker-compose.yml"
UPLOADS_DIR="$(pwd)/public/uploads"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker topilmasdan turib ishga tushirib bo'lmaydi. Iltimos, Docker o'rnating."
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "docker compose (yangi CLI) topilmadi. Iltimos Docker Desktop yangi versiyasini yoki docker compose plaginini o'rnating."
  exit 1
fi

mkdir -p "$UPLOADS_DIR"

if [ ! -f "$COMPOSE_FILE" ]; then
  echo "Compose fayli ($COMPOSE_FILE) topilmadi."
  exit 1
fi

if [ ! -f .env ]; then
  echo "Ogohlantirish: .env topilmadi, default qiymatlar bilan ishga tushiriladi."
fi

echo "Eski compose konteynerlarini to'xtatib tozalayapman..."
docker compose -f "$COMPOSE_FILE" down

echo "Yangi konteynerni build qilib ishga tushiryapman..."
docker compose -f "$COMPOSE_FILE" up -d --build

echo "Tayyor: http://localhost:4011 manzilda xizmat ishlayapti."
