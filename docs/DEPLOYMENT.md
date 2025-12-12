# DigitalOcean + CloudPanel Deployment Guide

Bu rehber, MergenFlow'u DigitalOcean droplet üzerinde CloudPanel ile `mf.yourdomain.com` subdomain'inde nasıl çalıştıracağınızı ve GitHub'dan otomatik deploy kurulumunu anlatır.

## 📋 Gereksinimler

- DigitalOcean droplet (Ubuntu 22.04 önerilir)
- CloudPanel kurulu
- Domain DNS erişimi
- GitHub hesabı

---

## 🌐 1. DNS Ayarları

Domain yönetim panelinizden subdomain ekleyin:

```
Tip: A
Host: mf
Değer: <DROPLET_IP_ADRESI>
TTL: 300
```

---

## 🖥️ 2. CloudPanel'de Site Oluşturma

1. CloudPanel'e giriş yapın: `https://your-droplet-ip:8443`
2. **Sites** → **Add Site** → **Create a Node.js Site**
3. Ayarları doldurun:
   - **Domain Name:** `mf.yourdomain.com`
   - **Node.js Version:** `20` (veya üstü)
   - **User:** Yeni bir kullanıcı oluşturun (örn: `mergenflow`)
4. **Create** butonuna tıklayın

---

## 🔐 3. SSL Sertifikası

1. CloudPanel'de sitenizi seçin
2. **SSL/TLS** → **Actions** → **New Let's Encrypt Certificate**
3. Sertifikanın oluşturulmasını bekleyin

---

## 📁 4. Proje Dosyalarını Yükleme

### SSH ile bağlanın:
```bash
ssh mergenflow@your-droplet-ip
```

### Proje dizinine gidin:
```bash
cd ~/htdocs/mf.yourdomain.com
```

### Mevcut dosyaları temizleyin:
```bash
rm -rf *
```

### GitHub'dan klonlayın:
```bash
git clone https://github.com/iamcanturk/mergenflow.git .
```

### Bağımlılıkları yükleyin:
```bash
npm install
```

### Environment dosyası oluşturun:
```bash
nano .env.local
```

İçeriği:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Push Notifications (opsiyonel)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:your@email.com
```

### Build alın:
```bash
npm run build
```

---

## ⚙️ 5. CloudPanel Node.js Ayarları

1. CloudPanel'de sitenizi seçin
2. **Node.js Settings** sekmesine gidin
3. Ayarları yapın:
   - **Node.js Version:** 20
   - **Port:** 3000 (veya boş bir port)
   - **App Type:** Production
   - **Start Command:** `npm start`
4. **Save** butonuna tıklayın

---

## 🔄 6. PM2 ile Process Yönetimi (Önerilen)

CloudPanel Node.js uygulamaları PM2 ile çalışır. Manuel kontrol için:

```bash
# Durumu kontrol et
pm2 status

# Logları izle
pm2 logs

# Uygulamayı yeniden başlat
pm2 restart all

# Uygulamayı durdur
pm2 stop all
```

---

## 🚀 7. GitHub Auto-Deploy Kurulumu

### Yöntem 1: GitHub Webhooks + Deploy Script

#### 7.1 Deploy Script Oluşturma

SSH ile bağlanın ve script oluşturun:

```bash
nano ~/deploy-mergenflow.sh
```

İçeriği:
```bash
#!/bin/bash

# MergenFlow Auto-Deploy Script
# ================================

set -e

PROJECT_DIR=~/htdocs/mf.yourdomain.com
LOG_FILE=~/deploy.log

echo "$(date): Deploy started" >> $LOG_FILE

cd $PROJECT_DIR

# Git pull
echo "$(date): Pulling from GitHub..." >> $LOG_FILE
git pull origin main

# Install dependencies (if package.json changed)
echo "$(date): Installing dependencies..." >> $LOG_FILE
npm install --production=false

# Build
echo "$(date): Building..." >> $LOG_FILE
npm run build

# Restart PM2
echo "$(date): Restarting application..." >> $LOG_FILE
pm2 restart all

echo "$(date): Deploy completed successfully" >> $LOG_FILE
```

Çalıştırılabilir yapın:
```bash
chmod +x ~/deploy-mergenflow.sh
```

#### 7.2 Webhook Endpoint Oluşturma

Basit bir webhook listener oluşturun. Farklı bir port üzerinde çalışacak:

```bash
mkdir -p ~/webhook-server
cd ~/webhook-server
npm init -y
npm install express
```

`server.js` dosyası oluşturun:
```bash
nano server.js
```

İçeriği:
```javascript
const express = require('express');
const { exec } = require('child_process');
const crypto = require('crypto');

const app = express();
const PORT = 9000;
const SECRET = 'your-webhook-secret-here'; // GitHub'da da aynı secret'ı kullanın

app.use(express.json());

// GitHub Webhook endpoint
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  const payload = JSON.stringify(req.body);
  
  // Verify signature
  const hmac = crypto.createHmac('sha256', SECRET);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  
  if (signature !== digest) {
    console.log('Invalid signature');
    return res.status(401).send('Unauthorized');
  }
  
  // Check if push to main branch
  if (req.body.ref === 'refs/heads/main') {
    console.log('Push to main detected, deploying...');
    
    exec('/home/mergenflow/deploy-mergenflow.sh', (error, stdout, stderr) => {
      if (error) {
        console.error('Deploy error:', error);
        return res.status(500).send('Deploy failed');
      }
      console.log('Deploy output:', stdout);
      res.send('Deploy successful');
    });
  } else {
    res.send('Not main branch, skipping');
  }
});

app.get('/health', (req, res) => {
  res.send('OK');
});

app.listen(PORT, () => {
  console.log(`Webhook server running on port ${PORT}`);
});
```

PM2 ile başlatın:
```bash
pm2 start server.js --name webhook-server
pm2 save
```

#### 7.3 Webhook için Reverse Proxy

CloudPanel'de webhook için bir subdomain ekleyin veya Nginx config'i düzenleyin:

```bash
sudo nano /etc/nginx/sites-enabled/mf.yourdomain.com.conf
```

`server` bloğunun içine ekleyin:
```nginx
location /deploy-webhook {
    proxy_pass http://127.0.0.1:9000/webhook;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

Nginx'i yeniden yükleyin:
```bash
sudo nginx -t && sudo systemctl reload nginx
```

#### 7.4 GitHub Webhook Ayarları

1. GitHub repo'nuza gidin
2. **Settings** → **Webhooks** → **Add webhook**
3. Ayarları doldurun:
   - **Payload URL:** `https://mf.yourdomain.com/deploy-webhook`
   - **Content type:** `application/json`
   - **Secret:** `your-webhook-secret-here` (script'teki ile aynı)
   - **Which events?:** `Just the push event`
4. **Add webhook** butonuna tıklayın

---

### Yöntem 2: GitHub Actions ile Auto-Deploy (Daha Güvenli)

#### 7.1 GitHub Secrets Ayarlama

GitHub repo'nuzda **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Secret Name | Değer |
|-------------|-------|
| `SSH_HOST` | Droplet IP adresi |
| `SSH_USER` | mergenflow |
| `SSH_PRIVATE_KEY` | SSH private key içeriği |
| `SSH_PORT` | 22 |

#### 7.2 SSH Key Oluşturma

Droplet'ta:
```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github-actions
cat ~/.ssh/github-actions.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/github-actions  # Bu çıktıyı SSH_PRIVATE_KEY secret'ına kopyalayın
```

#### 7.3 GitHub Actions Workflow

Repo'da `.github/workflows/deploy.yml` oluşturun:

```yaml
name: Deploy to DigitalOcean

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          port: ${{ secrets.SSH_PORT }}
          script: |
            cd ~/htdocs/mf.yourdomain.com
            git pull origin main
            npm install --production=false
            npm run build
            pm2 restart all
            echo "Deploy completed at $(date)"
```

---

## 🔍 8. Kontrol ve Test

### Deployment'ı Test Edin:
```bash
# Manuel deploy
~/deploy-mergenflow.sh

# Webhook sağlık kontrolü
curl https://mf.yourdomain.com/deploy-webhook
```

### Logları İzleyin:
```bash
# PM2 logları
pm2 logs

# Deploy logları
tail -f ~/deploy.log

# Nginx logları
sudo tail -f /var/log/nginx/mf.yourdomain.com-access.log
```

### Siteyi Test Edin:
```
https://mf.yourdomain.com
```

---

## 🛠️ 9. Sorun Giderme

### Port Kullanımda
```bash
# Portu kullanan process'i bul
sudo lsof -i :3000
# veya
sudo netstat -tlnp | grep 3000
```

### Build Hatası
```bash
# Node.js hafızasını artır
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

### PM2 Sıfırlama
```bash
pm2 delete all
pm2 start npm --name "mergenflow" -- start
pm2 save
```

### Nginx Hata Kontrolü
```bash
sudo nginx -t
sudo systemctl status nginx
```

---

## 📊 10. İzleme ve Bakım

### PM2 Monitoring:
```bash
pm2 monit
```

### Disk Kullanımı:
```bash
df -h
du -sh ~/htdocs/mf.yourdomain.com
```

### Günlük Yedekleme (Opsiyonel):
```bash
# Cron job ekle
crontab -e

# Her gün gece 2'de .env.local yedekle
0 2 * * * cp ~/htdocs/mf.yourdomain.com/.env.local ~/backups/.env.local.$(date +\%Y\%m\%d)
```

---

## ✅ Özet

1. ✅ DNS: `mf.yourdomain.com` → Droplet IP
2. ✅ CloudPanel: Node.js site oluştur
3. ✅ SSL: Let's Encrypt sertifikası
4. ✅ Clone: GitHub'dan projeyi çek
5. ✅ Build: `npm install && npm run build`
6. ✅ Auto-Deploy: GitHub Actions veya Webhook

Her commit'inizde otomatik olarak:
1. GitHub Action tetiklenir
2. SSH ile sunucuya bağlanır
3. `git pull` → `npm install` → `npm build` → `pm2 restart`
4. Yeni versiyon yayında! 🎉
