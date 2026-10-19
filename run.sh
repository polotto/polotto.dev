#!/usr/bin/env bash
# Roda o projeto sem decorar comando. Uso: ./run.sh [dev|test|build|install|preview|help]
# Sem argumento: dev. Stack: node.
set -euo pipefail
cd "$(dirname "$0")"

usage() {
  cat <<'EOF'
uso: ./run.sh [comando] (padrão: dev)
  dev      roda o projeto
  test     roda os testes
  build    gera o build
  install  instala as dependências
  preview  build e preview local
EOF
}

case "${1:-dev}" in install|help|-h|--help) ;; *) [ -d node_modules ] || npm install ;; esac

case "${1:-dev}" in
  dev) shift || true; npm run dev "$@" ;;
  test) shift || true; npm run test && npm run check ;;
  build) shift || true; npm run build "$@" ;;
  install) shift || true; npm install "$@" ;;
  preview) shift || true; npm run build && npm run preview ;;
  help|-h|--help) usage ;;
  *) usage >&2; exit 1 ;;
esac
