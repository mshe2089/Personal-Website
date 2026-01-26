#!/bin/sh

# Check if certificates exist in the mounted volume
if [ -f "/etc/nginx/ssl/cert.pem" ] && [ -f "/etc/nginx/ssl/key.pem" ]; then
    echo "SSL certificates detected. Running in HTTPS mode."
    cp /etc/nginx/templates/nginx_https.conf /etc/nginx/conf.d/default.conf
else
    echo "SSL certificates NOT detected. Falling back to HTTP mode."
    cp /etc/nginx/templates/nginx_http.conf /etc/nginx/conf.d/default.conf
fi

# Execute NGINX
nginx -g 'daemon off;'
