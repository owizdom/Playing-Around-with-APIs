# SSL Watchdog

A comprehensive, frontend-only web application for monitoring SSL certificate health and expiration dates for any domain. Built with vanilla HTML, CSS, and JavaScript.

![SSL Watchdog](https://img.shields.io/badge/SSL-Watchdog-blue) ![Frontend Only](https://img.shields.io/badge/Frontend-Only-green) ![No Backend](https://img.shields.io/badge/No-Backend-success)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Why SSL Watchdog?](#why-ssl-watchdog)
- [API Information](#api-information)
- [Local Development](#local-development)
- [Deployment](#deployment)
  - [Single Server Deployment](#single-server-deployment)
  - [Two-Server Setup with Load Balancer](#two-server-setup-with-load-balancer)
- [Project Structure](#project-structure)
- [Usage Guide](#usage-guide)
- [Screenshots](#screenshots)
- [Browser Support](#browser-support)
- [Troubleshooting](#troubleshooting)

## Overview

SSL Watchdog is a practical web application that allows users to check SSL certificate information for any domain. It provides real-time SSL certificate data including:

- **Domain name** verification
- **Certificate issuer** information
- **Valid From** date
- **Valid Until** date
- **Days remaining** until expiration
- **Certificate status** (Valid, Expiring Soon, or Expired)

The application serves a critical purpose in cybersecurity and web administration by helping users:

1. **Security Awareness**: Verify SSL certificates to ensure secure connections
2. **Monitoring SSL Expiry**: Track certificate expiration dates to prevent service disruptions
3. **Detecting Unsafe Websites**: Identify expired or invalid certificates that pose security risks

## Features

### Core Functionality

- **SSL Certificate Checking**: Enter any domain to instantly retrieve SSL certificate data
- **Real-time Status Display**: Visual status badges (Valid/Expiring/Expired)
- **Search History**: Automatically saves all checked domains in browser localStorage
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### Data Interaction Features

#### Searching
- Search through previous results by domain name or issuer
- Real-time filtering as you type
- Search history persists across browser sessions

#### Sorting
- **Most Recent**: Latest checked domains first (default)
- **Alphabetical (A-Z)**: Sort by domain name
- **Expiring Soon**: Certificates expiring soonest first
- **Longest Valid**: Certificates with most days remaining first

#### Filtering
- **Status Filter**: Filter by Valid, Expiring Soon (<30 days), or Expired certificates
- **Issuer Filter**: Filter by certificate issuer (dynamically populated)
- **Search Filter**: Search through history by domain or issuer name

### Error Handling

The application includes robust error handling for:

- Invalid domain format
- Domains with no SSL certificate
- API errors (500, 401, 403)
- Network errors and connection issues
- CORS problems
- Rate limit errors
- Empty search queries

All errors are displayed in user-friendly alert boxes with clear messages.

### User Interface

- **Modern, Clean Design**: Professional UI with consistent typography
- **Intuitive Navigation**: Easy-to-use search bar and controls
- **Clear Data Presentation**: Well-organized result cards with visual status indicators
- **Status Badges**: Color-coded badges (Green: Valid, Orange: Expiring, Red: Expired)
- **Fully Responsive**: Mobile-first design that works on all screen sizes

## Why SSL Watchdog?

SSL certificates are critical for web security. They encrypt data between users and websites, ensuring privacy and preventing man-in-the-middle attacks. SSL Watchdog helps:

- **Website Administrators**: Monitor their own certificates to prevent unexpected expirations
- **Security Professionals**: Verify SSL certificates during security audits
- **General Users**: Check if websites they visit have valid SSL certificates
- **Developers**: Quickly verify SSL status during development and testing

## API Information

### SSL Certificate API

SSL Watchdog uses the **SSL Certificate Checker API** provided by **RapidAPI**.

**API Provider**: [RapidAPI](https://rapidapi.com)

**API Endpoint**: `https://check-ssl.p.rapidapi.com/sslcheck`

**Authentication**: RapidAPI Key (provided via x-rapidapi-key header)

**Request Example**:
```bash
curl --request GET \
  --url 'https://check-ssl.p.rapidapi.com/sslcheck?domain=amazon.com' \
  --header 'x-rapidapi-host: check-ssl.p.rapidapi.com' \
  --header 'x-rapidapi-key: YOUR_API_KEY'
```

**Response Format**:
The API returns JSON data containing:
- `validFrom` / `validFromDate`: Certificate valid from date
- `validTo` / `validToDate` / `expiryDate`: Certificate expiration date
- `issuer` / `issuerName`: Certificate issuer name
- Additional certificate metadata

### API Attribution

**SSL Certificate API provided by: [RapidAPI](https://rapidapi.com)**

The application includes a default API key for demonstration purposes. Users can optionally provide their own RapidAPI key through the Settings modal.

## Local Development

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (optional, but recommended)

### Quick Start

1. **Clone or download** this repository

2. **Option A: Using a Local Web Server** (Recommended)
   
   Using Python 3:
   ```bash
   python3 -m http.server 8000
   ```
   
   Using Node.js (http-server):
   ```bash
   npx http-server -p 8000
   ```
   
   Using PHP:
   ```bash
   php -S localhost:8000
   ```

3. **Option B: Direct File Access**
   
   Simply open `index.html` in your web browser (note: some features may be limited due to CORS)

4. **Access the application**
   
   Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

### Development Notes

- The application uses **localStorage** to persist search history and settings
- No build process or compilation required
- All code is vanilla JavaScript (no frameworks or dependencies)
- External dependencies: Font Awesome (via CDN) for icons

## Deployment

SSL Watchdog is designed to be deployed as static files on any web server. It requires no backend, database, or server-side processing.

### Single Server Deployment

#### Using Nginx

1. **Upload files** to your server:
   ```bash
   scp -r * user@your-server:/var/www/ssl-watchdog/
   ```

2. **Create Nginx configuration** (`/etc/nginx/sites-available/ssl-watchdog`):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/ssl-watchdog;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Cache static assets
       location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

3. **Enable the site**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/ssl-watchdog /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

#### Using Apache

1. **Upload files** to your server:
   ```bash
   scp -r * user@your-server:/var/www/html/ssl-watchdog/
   ```

2. **Create Apache virtual host** (`/etc/apache2/sites-available/ssl-watchdog.conf`):
   ```apache
   <VirtualHost *:80>
       ServerName your-domain.com
       DocumentRoot /var/www/html/ssl-watchdog

       <Directory /var/www/html/ssl-watchdog>
           Options Indexes FollowSymLinks
           AllowOverride All
           Require all granted
       </Directory>

       ErrorLog ${APACHE_LOG_DIR}/ssl-watchdog_error.log
       CustomLog ${APACHE_LOG_DIR}/ssl-watchdog_access.log combined
   </VirtualHost>
   ```

3. **Enable the site**:
   ```bash
   sudo a2ensite ssl-watchdog.conf
   sudo systemctl reload apache2
   ```

### Two-Server Setup with Load Balancer

This setup provides high availability and load distribution across two web servers.

#### Architecture Overview

```
                    [Load Balancer]
                         |
            +------------+------------+
            |                         |
    [Web Server 1]            [Web Server 2]
    (Nginx/Apache)            (Nginx/Apache)
            |                         |
            +------------+------------+
                         |
                  [Static Files]
```

#### Step 1: Prepare Both Web Servers

**On Web Server 1 (e.g., 192.168.1.10):**

1. **Create directory**:
   ```bash
   sudo mkdir -p /var/www/ssl-watchdog
   sudo chown -R www-data:www-data /var/www/ssl-watchdog
   ```

2. **Upload files**:
   ```bash
   scp -r * user@192.168.1.10:/var/www/ssl-watchdog/
   ```

3. **Configure Nginx** (`/etc/nginx/sites-available/ssl-watchdog`):
   ```nginx
   server {
       listen 80;
       server_name _;
       root /var/www/ssl-watchdog;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Health check endpoint
       location /health {
           access_log off;
           return 200 "healthy\n";
           add_header Content-Type text/plain;
       }
   }
   ```

4. **Enable and test**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/ssl-watchdog /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

**On Web Server 2 (e.g., 192.168.1.11):**

Repeat the same steps as Web Server 1, ensuring identical file structure and configuration.

#### Step 2: Configure Load Balancer

**Using Nginx as Load Balancer:**

1. **Install Nginx** on the load balancer server (if not already installed)

2. **Create load balancer configuration** (`/etc/nginx/sites-available/load-balancer`):
   ```nginx
   upstream ssl_watchdog_backend {
       # Health checks
       least_conn;  # Use least connections algorithm
       
       server 192.168.1.10:80 max_fails=3 fail_timeout=30s;
       server 192.168.1.11:80 max_fails=3 fail_timeout=30s;
   }

   server {
       listen 80;
       server_name your-domain.com;

       # Health check endpoint
       location /health {
           access_log off;
           return 200 "load-balancer-ok\n";
           add_header Content-Type text/plain;
       }

       # Proxy to backend servers
       location / {
           proxy_pass http://ssl_watchdog_backend;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           
           # Health check headers
           proxy_connect_timeout 5s;
           proxy_send_timeout 10s;
           proxy_read_timeout 10s;
       }
   }
   ```

3. **Enable and test**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/load-balancer /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

**Using HAProxy as Load Balancer:**

1. **Install HAProxy**:
   ```bash
   sudo apt-get update
   sudo apt-get install haproxy
   ```

2. **Configure HAProxy** (`/etc/haproxy/haproxy.cfg`):
   ```haproxy
   global
       log /dev/log local0
       maxconn 4096
       daemon

   defaults
       log global
       mode http
       option httplog
       option dontlognull
       timeout connect 5000ms
       timeout client 50000ms
       timeout server 50000ms

   frontend http_front
       bind *:80
       default_backend ssl_watchdog_backend

   backend ssl_watchdog_backend
       balance roundrobin
       option httpchk GET /health
       http-check expect status 200
       server web1 192.168.1.10:80 check
       server web2 192.168.1.11:80 check
   ```

3. **Start HAProxy**:
   ```bash
   sudo systemctl start haproxy
   sudo systemctl enable haproxy
   ```

#### Step 3: Verify Load Balancer Distribution

1. **Test health endpoints**:
   ```bash
   curl http://192.168.1.10/health  # Should return "healthy"
   curl http://192.168.1.11/health  # Should return "healthy"
   curl http://load-balancer-ip/health  # Should return "load-balancer-ok"
   ```

2. **Test load distribution**:
   ```bash
   # Make multiple requests and check which server responds
   for i in {1..10}; do
       curl -s http://your-domain.com/ | grep -o "Server:.*" || echo "Request $i"
   done
   ```

3. **Monitor logs**:
   ```bash
   # On load balancer
   sudo tail -f /var/log/nginx/access.log
   
   # On web servers
   sudo tail -f /var/log/nginx/access.log
   ```

4. **Test failover**:
   - Stop one web server: `sudo systemctl stop nginx`
   - Verify traffic routes to the remaining server
   - Restart the stopped server
   - Verify traffic distributes again

#### Step 4: SSL/TLS Configuration (Optional but Recommended)

For production, configure SSL certificates on the load balancer:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://ssl_watchdog_backend;
        # ... proxy settings ...
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### Deployment Checklist

- [ ] Files uploaded to web server(s)
- [ ] Web server configured and running
- [ ] Load balancer configured (if using two-server setup)
- [ ] Health check endpoints responding
- [ ] DNS pointing to load balancer or web server
- [ ] SSL/TLS configured (for production)
- [ ] Firewall rules configured
- [ ] Load distribution verified
- [ ] Failover tested

## Project Structure

```
ssl-watchdog/
│
├── index.html          # Main HTML file with UI structure
├── style.css           # All styling and responsive design
├── script.js           # Application logic and API integration
└── README.md           # This file
```

## Usage Guide

### Basic Usage

1. **Enter a domain**: Type any domain name (e.g., `google.com`, `github.com`) in the search bar
2. **Click "Check SSL"** or press Enter
3. **View results**: The SSL certificate information will be displayed in a result card

### Using Filters

- **Status Filter**: Select "Valid", "Expiring Soon", or "Expired" to filter history
- **Issuer Filter**: Select a specific certificate issuer from the dropdown
- **Search History**: Type in the search box to filter history by domain or issuer name

### Using Sorting

Click any sort button to reorder your search history:
- **Most Recent**: Latest checks first
- **A-Z**: Alphabetical by domain
- **Expiring Soon**: Certificates expiring soonest first
- **Longest Valid**: Certificates with most days remaining first

### Settings

1. Click the **Settings** button in the header
2. Enter your own RapidAPI key (optional - default key is provided)
3. Click **Save Settings**

### Dark Mode

Click the dark mode toggle in Settings to toggle between light and dark themes.

### History Management

- **View History**: All checked domains appear in the sidebar
- **Load from History**: Click any history item to view its details again
- **Remove Item**: Click the trash icon on any result card
- **Clear All**: Click the trash icon in the history header

## Screenshots

<img width="1917" height="991" alt="Screenshot 2025-11-20 at 14 29 30" src="https://github.com/user-attachments/assets/eaafc9e0-bdd9-40c2-a775-4de206b22ecc" />

<img width="1211" height="382" alt="Screenshot 2025-11-20 at 14 29 56" src="https://github.com/user-attachments/assets/d53560e2-b18d-4d5f-8621-0372f92ae51e" />

<img width="399" height="989" alt="Screenshot 2025-11-20 at 14 30 54" src="https://github.com/user-attachments/assets/ec8c25eb-3017-473e-aadc-66fa6b8f7ee9" />


## Browser Support

SSL Watchdog works on all modern browsers:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Opera (latest)

**Required Features:**
- ES6+ JavaScript support
- localStorage API
- Fetch API
- CSS Grid and Flexbox

## Troubleshooting

### API Errors

**Problem**: "Invalid API key" error
- **Solution**: Check your RapidAPI key in Settings. Ensure it's valid and has access to the SSL Certificate API.

**Problem**: "Rate limit exceeded"
- **Solution**: The API has rate limits. Wait a few moments before making another request, or use your own RapidAPI key with higher limits.

### Network Errors

**Problem**: "Network error" message
- **Solution**: Check your internet connection. Verify that the RapidAPI service is accessible from your network.

### CORS Errors

**Problem**: CORS errors in browser console
- **Solution**: Ensure you're accessing the app through a web server (not file://). Use a local server or deploy to a proper web server.

### History Not Saving

**Problem**: Search history disappears after closing browser
- **Solution**: Check if localStorage is enabled in your browser. Some browsers disable it in private/incognito mode.

### Styling Issues

**Problem**: Styles not loading
- **Solution**: Ensure `style.css` is in the same directory as `index.html` and the path is correct.

## License

This project is provided as-is for educational and demonstration purposes.

## Acknowledgments

- **SSL Certificate API**: Provided by [RapidAPI](https://rapidapi.com)
- **Icons**: [Font Awesome](https://fontawesome.com)

## Support

For issues, questions, or contributions, please refer to the project repository.

---

**SSL Watchdog** - Keeping your SSL certificates in check!

