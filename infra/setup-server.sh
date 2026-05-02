#!/bin/bash
set -e

NGINX_SNIPPET="/opt/quize-game-webapp/infra/nginx-snippet.conf"
SITES_AVAILABLE="/etc/nginx/sites-available/jungle-guess.probooking.app"
SITES_ENABLED="/etc/nginx/sites-enabled/jungle-guess.probooking.app"

echo "=== Jungle Guess Server Setup ==="

if [ -f "$SITES_AVAILABLE" ]; then
    echo "Nginx config already exists. Updating..."
    cp "$SITES_AVAILABLE" "${SITES_AVAILABLE}.bak.$(date +%s)"
fi

cp "$NGINX_SNIPPET" "$SITES_AVAILABLE"

if [ ! -L "$SITES_ENABLED" ]; then
    ln -s "$SITES_AVAILABLE" "$SITES_ENABLED"
fi

echo "Testing nginx config..."
nginx -t

echo "Reloading nginx..."
systemctl reload nginx

echo ""
echo "=== Done! ==="
echo "Next steps:"
echo "  1. sudo certbot --nginx -d jungle-guess.probooking.app"
echo "  2. cd /opt/quize-game-webapp/infra"
echo "  3. docker compose -f docker-compose.prod.yml pull"
echo "  4. docker compose -f docker-compose.prod.yml up -d"
