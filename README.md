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

This setup provides high availability and load distribution across two web servers with a dedicated load balancer. This is the production deployment configuration used for SSL Watchdog.

#### Architecture Overview

```
                    [Load Balancer]
                  jamesjames.tech
                   44.208.25.11
                         |
            +------------+------------+
            |                         |
    [Web Server 1]            [Web Server 2]
  web-01.jamesjames.tech   web-02.jamesjames.tech
     52.207.233.85           44.210.116.102
            |                         |
            +------------+------------+
                         |
                  [Static Files]
              /var/www/ssl-watchdog
```

#### Prerequisites

- Three Ubuntu servers (or similar Linux distribution)
- SSH access with key-based authentication configured
- Nginx installed on all servers
- Domain name configured with DNS pointing to load balancer IP

#### Automated Deployment

The easiest way to deploy is using the provided deployment script:

1. **Ensure SSH key is configured**:
   ```bash
   # Your SSH key should be at ~/.ssh/id_rsa
   # Make sure it's added to all three servers
   ssh -i ~/.ssh/id_rsa ubuntu@52.207.233.85  # Test web-01
   ssh -i ~/.ssh/id_rsa ubuntu@44.210.116.102  # Test web-02
   ssh -i ~/.ssh/id_rsa ubuntu@44.208.25.11    # Test load balancer
   ```

2. **Run the deployment script**:
   ```bash
   ./deploy.sh
   ```

   The script will:
   - Deploy application files to both web servers
   - Configure Nginx on web servers
   - Configure load balancer
   - Set up health checks
   - Verify deployment

#### Manual Deployment Steps

If you prefer to deploy manually or need to troubleshoot:

##### Step 1: Deploy to Web Server 1 (web-01.jamesjames.tech)

1. **Create directory and set permissions**:
   ```bash
   ssh ubuntu@52.207.233.85
   sudo mkdir -p /var/www/ssl-watchdog
   sudo chown -R www-data:www-data /var/www/ssl-watchdog
   ```

2. **Upload application files**:
   ```bash
   # From your local machine
   scp index.html style.css script.js ubuntu@52.207.233.85:/tmp/
   
   # On the server, move files to correct location
   ssh ubuntu@52.207.233.85
   sudo mv /tmp/index.html /tmp/style.css /tmp/script.js /var/www/ssl-watchdog/
   sudo chown -R www-data:www-data /var/www/ssl-watchdog
   ```

3. **Create Nginx configuration** (`/etc/nginx/sites-available/ssl-watchdog`):
   ```nginx
   server {
       listen 80;
       server_name _;
       root /var/www/ssl-watchdog;
       index index.html;

       access_log /var/log/nginx/ssl-watchdog-access.log;
       error_log /var/log/nginx/ssl-watchdog-error.log;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Health check endpoint
       location /health {
           access_log off;
           return 200 "healthy\n";
           add_header Content-Type text/plain;
       }

       # Cache static assets
       location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

4. **Enable site and start Nginx**:
   ```bash
   sudo rm -f /etc/nginx/sites-enabled/default
   sudo ln -s /etc/nginx/sites-available/ssl-watchdog /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl start nginx
   sudo systemctl enable nginx
   ```

5. **Verify deployment**:
   ```bash
   curl http://localhost/health  # Should return "healthy"
   curl http://localhost/        # Should return the application
   ```

##### Step 2: Deploy to Web Server 2 (web-02.jamesjames.tech)

Repeat all steps from Step 1, but use the web-02 server IP (44.210.116.102):

```bash
ssh ubuntu@44.210.116.102
# ... same steps as web-01 ...
```

##### Step 3: Configure Load Balancer (jamesjames.tech)

1. **SSH into load balancer**:
   ```bash
   ssh ubuntu@44.208.25.11
   ```

2. **Stop any conflicting services** (if HAProxy or Apache is running):
   ```bash
   sudo systemctl stop haproxy 2>/dev/null || true
   sudo systemctl disable haproxy 2>/dev/null || true
   sudo systemctl stop apache2 2>/dev/null || true
   sudo systemctl disable apache2 2>/dev/null || true
   ```

3. **Check port 80 availability**:
   ```bash
   sudo ss -tulpn | grep ':80 '
   # If something is using port 80, stop it
   ```

4. **Create load balancer configuration** (`/etc/nginx/sites-available/load-balancer`):
   ```nginx
   upstream ssl_watchdog_backend {
       least_conn;  # Use least connections algorithm
       server 52.207.233.85:80 max_fails=3 fail_timeout=30s;
       server 44.210.116.102:80 max_fails=3 fail_timeout=30s;
   }

   server {
       listen 80;
       listen [::]:80;
       server_name jamesjames.tech;

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
           
           # Timeouts
           proxy_connect_timeout 5s;
           proxy_send_timeout 10s;
           proxy_read_timeout 10s;
           
           # Buffering
           proxy_buffering on;
           proxy_buffer_size 4k;
           proxy_buffers 8 4k;
       }
   }
   ```

5. **Enable site and start Nginx**:
   ```bash
   sudo rm -f /etc/nginx/sites-enabled/default
   sudo ln -s /etc/nginx/sites-available/load-balancer /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl start nginx
   sudo systemctl enable nginx
   ```

6. **Verify load balancer**:
   ```bash
   curl http://localhost/health  # Should return "load-balancer-ok"
   curl http://localhost/        # Should return the application
   ```

##### Step 4: Enable HTTPS (SSL/TLS)

1. **Install Certbot**:
   ```bash
   sudo apt-get update
   sudo apt-get install -y certbot python3-certbot-nginx
   ```

2. **Update DNS**: Ensure `jamesjames.tech` points to `44.208.25.11`

3. **Run the HTTPS setup script**:
   ```bash
   ./enable-https.sh
   ```

   Or manually:
   ```bash
   sudo certbot --nginx -d jamesjames.tech
   ```

   Certbot will:
   - Obtain SSL certificate from Let's Encrypt
   - Automatically configure Nginx for HTTPS
   - Set up automatic renewal

4. **Verify HTTPS**:
   ```bash
   curl -I https://jamesjames.tech/
   curl -I http://jamesjames.tech/  # Should redirect to HTTPS
   ```

#### Verification and Testing

1. **Test health endpoints**:
   ```bash
   curl http://52.207.233.85/health      # Web-01: "healthy"
   curl http://44.210.116.102/health     # Web-02: "healthy"
   curl http://jamesjames.tech/health     # Load balancer: "load-balancer-ok"
   ```

2. **Test load distribution**:
   ```bash
   # Make multiple requests to see load balancing in action
   for i in {1..10}; do
       curl -s http://jamesjames.tech/ | head -1
   done
   ```

3. **Monitor logs**:
   ```bash
   # On load balancer
   sudo tail -f /var/log/nginx/access.log
   
   # On web servers
   sudo tail -f /var/log/nginx/ssl-watchdog-access.log
   ```

4. **Test failover**:
   - Stop one web server: `sudo systemctl stop nginx` on web-01
   - Verify traffic routes to web-02
   - Restart web-01: `sudo systemctl start nginx`
   - Verify traffic distributes again

#### Load Balancing Algorithm

The configuration uses **least_conn** (least connections), which distributes requests to the server with the fewest active connections. This provides better load distribution than round-robin for applications with varying request processing times.

#### Security Features

- **Health checks**: Automatic failover if a backend server becomes unavailable
- **SSL/TLS**: HTTPS encryption with automatic certificate renewal
- **Security headers**: Configured via Nginx (HSTS, X-Frame-Options, etc.)
- **Failover protection**: `max_fails=3 fail_timeout=30s` prevents routing to unhealthy servers

### Deployment Checklist

**Web Servers (web-01 and web-02):**
- [ ] SSH key authentication configured
- [ ] Application files uploaded to `/var/www/ssl-watchdog`
- [ ] Nginx configuration created at `/etc/nginx/sites-available/ssl-watchdog`
- [ ] Default Nginx site disabled
- [ ] Nginx service started and enabled
- [ ] Health check endpoint responding (`/health`)
- [ ] Application accessible on port 80

**Load Balancer:**
- [ ] SSH key authentication configured
- [ ] Conflicting services stopped (HAProxy, Apache)
- [ ] Port 80 available
- [ ] Load balancer configuration created at `/etc/nginx/sites-available/load-balancer`
- [ ] Default Nginx site disabled
- [ ] Nginx service started and enabled
- [ ] Health check endpoint responding (`/health`)
- [ ] Load balancing verified (traffic distributes between web-01 and web-02)

**DNS and SSL:**
- [ ] DNS A record added: `jamesjames.tech` → `44.208.25.11`
- [ ] DNS propagation verified (`dig jamesjames.tech +short`)
- [ ] SSL certificate obtained via Certbot
- [ ] HTTPS enabled and working
- [ ] HTTP to HTTPS redirect working

**Testing:**
- [ ] Health checks passing on all servers
- [ ] Load distribution verified
- [ ] Failover tested (stop one web server, verify traffic continues)
- [ ] Application accessible via domain name
- [ ] SSL certificate valid and auto-renewal configured

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

