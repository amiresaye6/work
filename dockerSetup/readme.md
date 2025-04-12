### General Guide to Add a New Website to Your Server

**1. Plan what the new website will be**  
First, we decide what the new website is all about. We pick a name for it, like `site3`, and figure out what kind of site it’ll be—maybe a simple webpage with HTML, a WordPress blog, a PHP app, or a React project. We also choose the web address, like `site3.amiralsayed.me`, to make it clear how people will visit it. This step is about getting a mental picture of the site so we know what tools we’ll need later.

**Why**: Planning helps us choose the right technology and setup to make the site work properly.

---

**2. Set up a home for the website’s files**  
Next, we create a new folder on the server just for this website, something like a dedicated space for `site3`. Inside that folder, we make another one for the actual content—like the webpages or app files. Then, we add some starter files to test the site, such as a basic webpage saying “Welcome to Site 3!” The files depend on what kind of site we’re building—HTML for a static site, PHP code for a PHP app, or nothing yet for WordPress since it sets itself up later.

**Why**: This gives the website its own organized place on the server and something to show when we test it.

---

**3. Choose the right software to run the website**  
Now we decide what software will power the website, kind of like picking the engine for a car. For a simple webpage, we might use Nginx to serve files. For PHP, we’d pick a PHP environment. WordPress needs its own package plus a database. A React or Node.js app needs a Node environment. Sometimes, we customize this setup by creating a special instruction file to tweak things, like telling the software to include certain tools or copy our files. If it’s straightforward, we just use the standard software without extra tweaks.

**Why**: The right software ensures the website runs smoothly, whether it’s a blog or an interactive app.

---

**4. Create a configuration file to launch the website**  
We write a configuration file (called a YAML file) that acts like a blueprint for the website’s container—a virtual box that runs the site. This file says what software to use, gives the container a name like `site3`, links it to our content folder, and connects it to the same network as our other sites so they can talk to the main proxy. For something like WordPress, we also add a database container and link them. It’s like setting up the wiring to make sure everything powers on correctly.

**Why**: This blueprint tells the server how to start and manage the new website.

---

**5. Update the main proxy to include the new website**  
The proxy is like a traffic director that sends visitors to the right website based on the address they type, such as `site3.amiralsayed.me`. We stop the proxy briefly to update its instructions. We add a new section telling it that when someone visits `site3.amiralsayed.me`, send them to the `site3` container. If we’re using HTTPS for security, we’ll update that part later after setting up certificates. Once updated, we restart the proxy to apply the changes.

**Why**: This ensures visitors typing the new address get to the correct website.

---

**6. Start the new website**  
With everything configured, we launch the new website by starting its container (and database, if needed). This is like flipping the switch to turn the site on. We check that it’s running properly by looking at a list of all active containers to make sure `site3` is there alongside `site1`, `site2`, and the proxy. We also peek at its logs to confirm it started without any hiccups.

**Why**: This brings the website to life so it’s ready to serve pages.

---

**7. Tell the internet how to find the new website**  
Now we update your domain’s address book, called DNS, to point `site3.amiralsayed.me` to your server’s IP address (the one you gave me). We log into your domain provider’s website and add a record saying, “When someone looks for `site3.amiralsayed.me`, send them to my server.” After saving, we wait a bit—sometimes a few minutes, sometimes longer—for the internet to catch up with this change.

**Why**: This connects the web address to your server so anyone can visit the site.

---

**8. Secure the website with HTTPS (optional but a good idea)**  
To make the site safer and show a lock icon in browsers, we can add HTTPS. We use a free service to get a security certificate for `site3.amiralsayed.me`. Then, we update the proxy’s instructions again to use this certificate, handle secure connections, and redirect visitors from HTTP to HTTPS. We restart the proxy to make it official. This step needs the DNS to be ready so the certificate service can verify the address.

**Why**: HTTPS keeps visitors’ data safe and makes the site look trustworthy.

---

**9. Test everything to make sure it works**  
Finally, we check if the site is working. First, we test from the server itself, pretending to visit `site3.amiralsayed.me` to see if we get the test page. Then, we use a tool to confirm the DNS is pointing to the right IP. The big test is opening a browser on our computer and visiting `site3.amiralsayed.me` to see the page load—whether it’s our test message, a WordPress setup screen, or an app. We also try from another device to make sure it’s truly public. If anything’s off, we look at the logs for clues.

**Why**: Testing confirms the site is live and accessible to everyone.

---

**10. Fix any problems that pop up**  
If something doesn’t work—like the page doesn’t load or we get an error—we troubleshoot. We might check if the container is running, look at file permissions, or see if the proxy is sending traffic correctly. For DNS issues, we double-check the records. If the site’s acting weird, we peek at its logs to find the problem and tweak things until it’s fixed.

**Why**: This ensures the site is up and running smoothly before we call it done.

---

### Why This Flow Makes Sense
This order works because we start with planning to get clarity, then build the website piece by piece—files, software, configuration—before connecting it to the proxy and the internet. Each step builds on the last: the content needs a place to live, the software needs a blueprint, the proxy needs to know about the site, and the DNS makes it reachable. Testing at the end catches any mistakes, and troubleshooting ties up loose ends. It’s flexible for any type of site, whether you’re adding a simple page or a complex app like WordPress or React.

---

### Wrapping Up
This description should give you a clear mental map of adding new websites to your server, like adding `site3` or beyond. Since `site1` and `site2` are already live, you’re ready to use this process whenever you want to expand. If you decide to add a new site soon, just let me know what kind (PHP, WordPress, etc.), and I can walk you through it with specific details. For now, enjoy your working sites, and congrats again on getting them online! Anything else you want to dive into?


### How to add a new website (with steps)
**Goal**: Add a new website (e.g., `site3.amiralsayed.me`) to your existing setup, accessible publicly via your domain, supporting any technology (static, PHP, Node.js, WordPress, React, etc.).

**Overview**: You’ll create a new directory for the website, configure a Docker container with the appropriate image (based on the tech stack), update the reverse proxy to route requests, set up DNS records, and test everything. The guide is designed to be universal, with specific notes for different technologies where needed.

**Prerequisites**:
- Your server’s IPv4 address is `82.25.118.51` (confirmed).
- Domain: `amiralsayed.me` with DNS access for adding `A` records.
- Existing setup: `nginx-proxy` on port `80` (and possibly `443` if HTTPS is enabled), `site1`, and `site2` running on `web-network`.
- Docker and Docker Compose are installed.
- Port `80` (and `443` for HTTPS) is open, and no conflicting services (e.g., host Nginx) are running.

I’ll use `site3` as an example website with the subdomain `site3.amiralsayed.me`, but you can replace `site3` with any name (e.g., `blog`, `shop`) and adjust accordingly.

---

### Step-by-Step Guide

#### Step 1: Plan the New Website
Before diving in, decide on the website’s details:
- **Name**: E.g., `site3` (container name and subdomain will be `site3.amiralsayed.me`).
- **Technology**: Choose based on your needs:
  - **Static**: HTML/CSS/JS (use `nginx:latest`).
  - **PHP**: Plain PHP or frameworks like Laravel (use `php:8.2-fpm` with Nginx or `php:8.2-apache`).
  - **WordPress**: CMS (use `wordpress:latest` with MySQL or MariaDB).
  - **Node.js**: Express, Next.js, etc. (use `node:20`).
  - **React**: Client-side or SSR apps (use `node:20` for build/serve).
  - **Others**: Python (Flask/Django), Ruby, etc. (use appropriate images).
- **Subdomain**: E.g., `site3.amiralsayed.me` (or `blog.amiralsayed.me`).
- **Content**: Prepare files (e.g., HTML for static, PHP scripts, WordPress files).

**Example**: Let’s assume `site3` is a **generic website**, and we’ll adapt the image choice later based on tech.

**Why**: Planning ensures you pick the right Docker image and configuration upfront.

**Action**:
- Decide: “I want `site3` to be a WordPress site at `site3.amiralsayed.me`” (or PHP, React, etc.).
- Note the tech stack for Step 3.

---

#### Step 2: Create a Directory and Content
Set up a dedicated folder for the new website’s files and configuration.

1. **Create directory**:
   ```bash
   mkdir ~/site3 && cd ~/site3
   ```
   - **Why**: Organizes files for `site3` separately from `site1` and `site2`.
   - **What it does**: Creates `~/site3` for Docker Compose and website files.

2. **Create content folder**:
   ```bash
   mkdir html
   ```
   - **Why**: Most web servers (Nginx, Apache) serve files from a directory like `html`.
   - **What it does**: Prepares a folder for your website’s files (e.g., `index.html`, `app.js`).

3. **Add initial content** (customize based on tech):
   - **Static**:
     ```bash
     nano html/index.html
     ```
     Paste:
     ```html
     <!DOCTYPE html>
     <html lang="en">
     <head>
         <meta charset="UTF-8">
         <title>Site 3</title>
     </head>
     <body>
         <h1>Welcome to Site 3!</h1>
     </body>
     </html>
     ```
   - **PHP**:
     ```bash
     nano html/index.php
     ```
     Paste:
     ```php
     <?php
     echo "<h1>Welcome to Site 3 (PHP)!</h1>";
     ?>
     ```
   - **WordPress**: Skip for now; the `wordpress:latest` image auto-populates files.
   - **Node.js/React**:
     ```bash
     mkdir html
     cd html
     npm init -y
     npm install express
     nano index.js
     ```
     Paste:
     ```javascript
     const express = require('express');
     const app = express();
     app.get('/', (req, res) => res.send('<h1>Welcome to Site 3 (Node.js)!</h1>'));
     app.listen(3000, () => console.log('Site 3 running'));
     ```
     Then:
     ```bash
     cd ~/site3
     ```
   - **React** (basic):
     ```bash
     cd html
     npx create-react-app .
     cd ~/site3
     ```
     - Builds the app later in the Dockerfile.
   - Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X`).
   - **Why**: Provides a test page to verify the site works before adding real content.
   - **What it does**: Creates a minimal file to serve.

4. **Set permissions**:
   ```bash
   chmod -R 755 ~/site3/html
   chown -R root:root ~/site3/html
   ```
   - **Why**: Ensures the web server can read files, avoiding “403 Forbidden”.
   - **Note**: For WordPress/PHP, you may adjust ownership later (e.g., `www-data`).

**Outcome**: `~/site3/html` contains initial content tailored to your tech stack.

---

#### Step 3: Choose a Docker Image and Create a Dockerfile (If Needed)
Select the appropriate Docker image based on the technology, and optionally create a custom `Dockerfile` for specific setups.

1. **Choose the image**:
   - **Static**: `nginx:latest`
     - Serves HTML/CSS/JS directly.
   - **PHP**:
     - Plain PHP: `php:8.2-fpm` (with Nginx) or `php:8.2-apache`.
     - Laravel: Same, but add Composer in `Dockerfile`.
   - **WordPress**: `wordpress:latest` (includes PHP and Apache) + `mysql:8.0` or `mariadb:latest`.
   - **Node.js/React**: `node:20`.
   - **Others**: E.g., `python:3.11` for Flask/Django, `ruby:3.2` for Rails.
   - **Why**: The image provides the runtime environment (web server, language support).

2. **Create a `Dockerfile`** (if customization is needed):
   ```bash
   nano ~/site3/Dockerfile
   ```
   - **Static** (usually no `Dockerfile` needed, but example for custom Nginx):
     ```dockerfile
     FROM nginx:latest
     COPY html /usr/share/nginx/html
     ```
   - **PHP (with Nginx)**:
     ```dockerfile
     FROM php:8.2-fpm
     RUN docker-php-ext-install mysqli pdo pdo_mysql
     COPY html /var/www/html
     ```
     - Note: Requires a separate Nginx container or config (see Step 4).
   - **PHP (Apache)**:
     ```dockerfile
     FROM php:8.2-apache
     RUN a2enmod rewrite
     COPY html /var/www/html
     ```
   - **WordPress**: No `Dockerfile` needed; use `wordpress:latest`.
   - **Node.js**:
     ```dockerfile
     FROM node:20
     WORKDIR /app
     COPY html .
     RUN npm install
     CMD ["node", "index.js"]
     ```
   - **React**:
     ```dockerfile
     FROM node:20
     WORKDIR /app
     COPY html .
     RUN npm install
     RUN npm run build
     CMD ["npx", "serve", "-s", "build", "-l", "3000"]
     ```
   - Save and exit.
   - **Why**: Customizes the image (e.g., copies files, installs dependencies).
   - **When to skip**: Use the base image directly (e.g., `nginx:latest`, `wordpress:latest`) if no changes are needed.

3. **Example decision**:
   - For a WordPress site, use `wordpress:latest` without a `Dockerfile`.
   - For a React app, use the `Dockerfile` above to build and serve.

**Outcome**: You’ve chosen an image (e.g., `nginx:latest`) and created a `Dockerfile` if needed.

---

#### Step 4: Create `docker-compose.yml`
Define the container(s) for the website, including networking and volumes.

1. **Create the file**:
   ```bash
   nano ~/site3/docker-compose.yml
   ```
2. **Add configuration** (customize by tech):
   - **Static (Nginx)**:
     ```yaml
     version: '3'
     services:
       site3:
         image: nginx:latest
         container_name: site3
         volumes:
           - ./html:/usr/share/nginx/html
         networks:
           - web-network
     networks:
       web-network:
         external: true
     ```
   - **PHP (Nginx + PHP-FPM)**:
     ```yaml
     version: '3'
     services:
       site3:
         image: nginx:latest
         container_name: site3
         volumes:
           - ./html:/var/www/html
           - ./nginx.conf:/etc/nginx/conf.d/default.conf
         networks:
           - web-network
       php:
         image: php:8.2-fpm
         volumes:
           - ./html:/var/www/html
         networks:
           - web-network
     networks:
       web-network:
         external: true
     ```
     - Create `nginx.conf`:
       ```bash
       nano ~/site3/nginx.conf
       ```
       Paste:
       ```nginx
       server {
           listen 80;
           server_name site3.amiralsayed.me;
           root /var/www/html;
           index index.php index.html;
           location / {
               try_files $uri $uri/ /index.php?$args;
           }
           location ~ \.php$ {
               fastcgi_pass php:9000;
               fastcgi_index index.php;
               include fastcgi_params;
               fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
           }
       }
       ```
   - **PHP (Apache)**:
     ```yaml
     version: '3'
     services:
       site3:
         image: php:8.2-apache
         container_name: site3
         volumes:
           - ./html:/var/www/html
         networks:
           - web-network
     networks:
       web-network:
         external: true
     ```
   - **WordPress**:
     ```yaml
     version: '3'
     services:
       site3:
         image: wordpress:latest
         container_name: site3
         environment:
           WORDPRESS_DB_HOST: db
           WORDPRESS_DB_USER: wordpress
           WORDPRESS_DB_PASSWORD: wordpress123
           WORDPRESS_DB_NAME: site3_db
         volumes:
           - ./html:/var/www/html
         networks:
           - web-network
       db:
         image: mariadb:latest
         environment:
           MYSQL_ROOT_PASSWORD: rootpassword
           MYSQL_DATABASE: site3_db
           MYSQL_USER: wordpress
           MYSQL_PASSWORD: wordpress123
         volumes:
           - db_data:/var/lib/mysql
         networks:
           - web-network
     volumes:
       db_data:
     networks:
       web-network:
         external: true
     ```
   - **Node.js/React**:
     ```yaml
     version: '3'
     services:
       site3:
         build: .
         container_name: site3
         volumes:
           - ./html:/app
         networks:
           - web-network
     networks:
       web-network:
         external: true
     ```
     - Note: Requires the `Dockerfile` from Step 3.
   - Save and exit.
   - **Why**:
     - Defines the service (e.g., `site3`) with the chosen image.
     - Sets `container_name: site3` to match the proxy’s upstream.
     - Mounts `html` for content.
     - Connects to `web-network` for proxy communication.
     - Adds a database for WordPress.
   - **What it does**: Configures the container to serve your website.

3. **Set permissions** (if needed):
   ```bash
   chmod -R 755 ~/site3/html
   chown -R www-data:www-data ~/site3/html
   ```
   - **Why**: For PHP/WordPress, `www-data` needs access.

**Outcome**: `docker-compose.yml` is ready to launch `site3`.

---

#### Step 5: Update the Reverse Proxy
Add `site3.amiralsayed.me` to the proxy’s routing.

1. **Stop the proxy**:
   ```bash
   cd ~/docker-reverse-proxy
   docker-compose down
   ```
   - **Expected**:
     ```
     Stopping nginx-proxy ... done
     ```

2. **Edit `nginx.conf`**:
   ```bash
   nano ~/docker-reverse-proxy/nginx.conf
   ```
   - **If HTTP only**:
     Add a new `server` block:
     ```nginx
     events {
         worker_connections 1024;
     }
     http {
         resolver 127.0.0.11;
         server {
             listen 80;
             server_name site1.amiralsayed.me;
             location / {
                 set $upstream site1:80;
                 proxy_pass http://$upstream;
                 proxy_set_header Host $host;
                 proxy_set_header X-Real-IP $remote_addr;
             }
         }
         server {
             listen 80;
             server_name site2.amiralsayed.me;
             location / {
                 set $upstream site2:80;
                 proxy_pass http://$upstream;
                 proxy_set_header Host $host;
                 proxy_set_header X-Real-IP $remote_addr;
             }
         }
         server {
             listen 80;
             server_name site3.amiralsayed.me;
             location / {
                 set $upstream site3:80;
                 proxy_pass http://$upstream;
                 proxy_set_header Host $host;
                 proxy_set_header X-Real-IP $remote_addr;
             }
         }
     }
     ```
   - **If HTTPS** (after Step 8):
     Add to the HTTPS config:
     ```nginx
     events {
         worker_connections 1024;
     }
     http {
         resolver 127.0.0.11;
         server {
             listen 80;
             server_name site1.amiralsayed.me site2.amiralsayed.me site3.amiralsayed.me;
             return 301 https://$host$request_uri;
         }
         server {
             listen 443 ssl;
             server_name site1.amiralsayed.me;
             ssl_certificate /etc/letsencrypt/live/site1.amiralsayed.me/fullchain.pem;
             ssl_certificate_key /etc/letsencrypt/live/site1.amiralsayed.me/privkey.pem;
             location / {
                 set $upstream site1:80;
                 proxy_pass http://$upstream;
                 proxy_set_header Host $host;
                 proxy_set_header X-Real-IP $remote_addr;
             }
         }
         server {
             listen 443 ssl;
             server_name site2.amiralsayed.me;
             ssl_certificate /etc/letsencrypt/live/site2.amiralsayed.me/fullchain.pem;
             ssl_certificate_key /etc/letsencrypt/live/site2.amiralsayed.me/privkey.pem;
             location / {
                 set $upstream site2:80;
                 proxy_pass http://$upstream;
                 proxy_set_header Host $host;
                 proxy_set_header X-Real-IP $remote_addr;
             }
         }
         server {
             listen 443 ssl;
             server_name site3.amiralsayed.me;
             ssl_certificate /etc/letsencrypt/live/site3.amiralsayed.me/fullchain.pem;
             ssl_certificate_key /etc/letsencrypt/live/site3.amiralsayed.me/privkey.pem;
             location / {
                 set $upstream site3:80;
                 proxy_pass http://$upstream;
                 proxy_set_header Host $host;
                 proxy_set_header X-Real-IP $remote_addr;
             }
         }
     }
     ```
   - Save and exit.
   - **Why**: Routes `site3.amiralsayed.me` to the `site3` container.
   - **Note**: For Node.js/React, if the app uses a non-standard port (e.g., `3000`), update to `site3:3000`.

3. **Test config**:
   ```bash
   docker run --rm -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf:ro nginx:latest nginx -t
   ```
   - **Expected**:
     ```
     nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
     ```

4. **Start the proxy**:
   ```bash
   docker-compose up -d
   ```
   - **Expected**:
     ```
     Creating nginx-proxy ... done
     ```

**Outcome**: The proxy routes `site3.amiralsayed.me` to `site3`.

---

#### Step 6: Launch the Website
Start the new container(s).

1. **Start `site3`**:
   ```bash
   cd ~/site3
   docker-compose up -d
   ```
   - **Expected**:
     ```
     Creating site3 ... done
     ```
     For WordPress:
     ```
     Creating site3_db ... done
     Creating site3 ... done
     ```

2. **Verify containers**:
   ```bash
   docker ps
   ```
   - **Expected**:
     ```
     CONTAINER ID   IMAGE          COMMAND                  CREATED          STATUS          PORTS                             NAMES
     <id>           nginx:latest   "/docker-entrypoint.…"   5 seconds ago    Up 4 seconds    80/tcp                            site3
     <id>           nginx:latest   "/docker-entrypoint.…"   X minutes ago    Up X minutes    80/tcp                            site2
     <id>           nginx:latest   "/docker-entrypoint.…"   X minutes ago    Up X minutes    80/tcp                            site1
     <id>           nginx:latest   "/docker-entrypoint.…"   X minutes ago    Up X minutes    0.0.0.0:80->80/tcp                nginx-proxy
     ```
     - For WordPress, also see `site3_db`.

3. **Check logs**:
   ```bash
   docker logs site3
   ```
   - **Look for**: Startup messages (e.g., “ready for start up” for Nginx, “WordPress installed” for WordPress).
   - **If errors**: Share output.

**Outcome**: `site3` is running and connected to `web-network`.

---

#### Step 7: Set Up DNS
Point `site3.amiralsayed.me` to your server.

1. **Access DNS**:
   - Log in to your DNS provider for `amiralsayed.me`.

2. **Add `A` record**:
   - Create:
     ```
     Type: A
     Name: site3
     Value: 82.25.118.51
     TTL: 3600 (or “Automatic”)
     ```
   - **Result**: `site3.amiralsayed.me` → `82.25.118.51`.
   - **Why**: Directs requests to your server.

3. **Save**:
   - Submit changes.
   - **Note**: Propagation takes 5–24 hours (usually <1 hour).

**Outcome**: DNS is configured for `site3.amiralsayed.me`.

---

#### Step 8: Add HTTPS (Optional but Recommended)
Secure the new site with Let’s Encrypt.

1. **Get certificate**:
   ```bash
   cd ~/docker-reverse-proxy
   docker run -it --rm -v ~/docker-reverse-proxy/letsencrypt:/etc/letsencrypt -p 80:80 certbot/certbot certonly --webroot -w /etc/letsencrypt -d site3.amiralsayed.me
   ```
   - **Prompts**: Email, agree to terms.
   - **Expected**:
     ```
     Certificate is saved at: /etc/letsencrypt/live/site3.amiralsayed.me/fullchain.pem
     ```

2. **Update `nginx.conf`**:
   - See Step 5 for the HTTPS version, adding the `site3` block.
   - Check certificate path:
     ```bash
     ls -l ~/docker-reverse-proxy/letsencrypt/live
     ```

3. **Update `docker-compose.yml`** (if not already done):
   ```bash
   nano ~/docker-reverse-proxy/docker-compose.yml
   ```
   Ensure:
   ```yaml
   ports:
     - "80:80"
     - "443:443"
   volumes:
     - ./nginx.conf:/etc/nginx/nginx.conf
     - ./letsencrypt:/etc/letsencrypt
   ```

4. **Restart proxy**:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

**Outcome**: `site3.amiralsayed.me` is accessible via `https://`.

---

#### Step 9: Test the Website
Verify everything works.

1. **Server test**:
   ```bash
   curl -H "Host: site3.amiralsayed.me" http://localhost
   ```
   - **Expected**: Your test page (e.g., “Welcome to Site 3!”).
   - **For WordPress**: May show setup page.

2. **DNS check**:
   ```bash
   dig site3.amiralsayed.me
   ```
   - **Look for**:
     ```
     site3.amiralsayed.me. 3600 IN A 82.25.118.51
     ```

3. **Public test**:
   - Browser:
     - `http://site3.amiralsayed.me` (or `https://` if Step 8).
     - **Expected**: Your site loads.
   - `curl`:
     ```bash
     curl http://site3.amiralsayed.me
     ```
   - **For WordPress**: Follow setup at `http://site3.amiralsayed.me/wp-admin`.

4. **Logs**:
   ```bash
   docker logs site3
   docker logs nginx-proxy
   ```

**Outcome**: `site3.amiralsayed.me` is live.

---

#### Step 10: Troubleshoot Issues
If problems arise:
- **502 Bad Gateway**:
  ```bash
  docker ps
  docker logs site3
  docker network inspect web-network
  ```
- **403 Forbidden**:
  ```bash
  chmod -R 755 ~/site3/html
  chown -R www-data:www-data ~/site3/html
  ```
- **DNS**:
  ```bash
  dig site3.amiralsayed.me
  ```
- **Port conflicts**:
  ```bash
  sudo netstat -tuln | grep :80
  sudo systemctl stop nginx
  ```

**Outcome**: You can debug and fix issues.

---

### Example for Different Tech Stacks
- **WordPress**:
  - Use `docker-compose.yml` from Step 4.
  - Access `http://site3.amiralsayed.me/wp-admin` to set up.
- **React**:
  - Use `Dockerfile` and `docker-compose.yml` from Steps 3–4.
  - Replace `html` with your app code.
- **PHP (Laravel)**:
  - Adjust `Dockerfile`:
    ```dockerfile
    FROM php:8.2-fpm
    RUN apt-get update && apt-get install -y git
    RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
    COPY html /var/www/html
    WORKDIR /var/www/html
    RUN composer install
    ```
  - Update `html` with Laravel files.
- **Node.js (Express)**:
  - Use `Dockerfile` from Step 3.
  - Ensure `index.js` listens on the correct port.

---

### Next Steps
Your `site1` and `site2` are live, and this guide equips you to add more sites anytime. Next:
- **Add a site**: Follow the guide for `site3` when ready (share the tech stack for tailored help).
- **Content**: Plan real content for `site1`/`site2`:
  - Static, PHP, WordPress, React? Share your vision.
- **Security**: If you skipped HTTPS, consider it for new sites.
- **Maintenance**:
  ```bash
  docker ps
  docker logs nginx-proxy
  ```
