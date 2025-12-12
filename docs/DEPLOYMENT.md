# DigitalOcean + CloudPanel + GitHub Auto-Deploy

MergenFlow'u DigitalOcean droplet üzerinde CloudPanel ile çalıştırma ve GitHub'dan otomatik deploy kurulumu.

---

## 📋 Gereksinimler

- DigitalOcean droplet (Ubuntu 22.04)
- CloudPanel kurulu
- Domain DNS erişimi

---

## 🌐 1. DNS Ayarı

Domain yönetim panelinizden:

```
Tip: A
Host: mf
Değer: <DROPLET_IP_ADRESI>
TTL: 300
```

---

## 🖥️ 2. CloudPanel'de Site Oluşturma

1. CloudPanel: `https://your-droplet-ip:8443`
2. **Sites** → **Add Site** → **Create a Node.js Site**
3. Ayarlar:
   - **Domain Name:** `mf.yourdomain.com`
   - **Node.js Version:** `20`
   - **User:** `mergenflow`
4. **Create**

---

## 🔐 3. SSL Sertifikası

1. Sitenizi seçin
2. **SSL/TLS** → **Actions** → **New Let's Encrypt Certificate**

---

## 📁 4. İlk Kurulum (Tek Seferlik)

### SSH ile bağlanın:
```bash
ssh mergenflow@your-droplet-ip
cd ~/htdocs/mf.yourdomain.com
rm -rf *
```

### GitHub'dan klonlayın:
```bash
git clone https://github.com/iamcanturk/mergenflow.git .
npm install
```

### Environment dosyası:
```bash
nano .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Push Notifications (opsiyonel)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
```

### Build ve başlat:
```bash
npm run build
pm2 start npm --name "mergenflow" -- start
pm2 save
```

---

## ⚙️ 5. CloudPanel Node.js Ayarları

1. **Node.js Settings** sekmesi
2. Ayarlar:
   - **Node.js Version:** 20
   - **Port:** 3000
   - **Start Command:** `npm start`
3. **Save**

---

## 🚀 6. GitHub Auto-Deploy Kurulumu

### 6.1 SSH Key Oluşturma (Sunucuda)

```bash
ssh mergenflow@your-droplet-ip
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github-actions -N ""
cat ~/.ssh/github-actions.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

Private key'i kopyalayın (GitHub'a eklenecek):
```bash
cat ~/.ssh/github-actions
```

### 6.2 GitHub Secrets Ekleme

GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret Name | Değer |
|-------------|-------|
| `SSH_HOST` | Droplet IP adresi |
| `SSH_USER` | `mergenflow` |
| `SSH_PRIVATE_KEY` | `cat ~/.ssh/github-actions` çıktısı |
| `SSH_PORT` | `22` |
| `SITE_DOMAIN` | `mf.yourdomain.com` |

### 6.3 Workflow Dosyası

`.github/workflows/deploy.yml` zaten mevcut. Her `main` branch'ine push'ta:

1. ✅ GitHub Action tetiklenir
2. ✅ SSH ile sunucuya bağlanır
3. ✅ `git pull` → `npm install` → `npm build` → `pm2 restart`
4. ✅ Yeni versiyon yayında!

---

## 🔍 7. Test ve Kontrol

### Manuel Deploy Test:
```bash
ssh mergenflow@your-droplet-ip
cd ~/htdocs/mf.yourdomain.com
git pull origin main
npm install
npm run build
pm2 restart all
```

### Logları İzle:
```bash
pm2 logs
pm2 monit
```

### Site Kontrolü:
```
https://mf.yourdomain.com
```

---

## 🛠️ Sorun Giderme

### Build Hatası (Hafıza)
```bash
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

### PM2 Sıfırlama
```bash
pm2 delete all
pm2 start npm --name "mergenflow" -- start
pm2 save
```

### Port Kontrolü
```bash
sudo lsof -i :3000
```

---

## ✅ Özet

| Adım | Açıklama |
|------|----------|
| 1 | DNS: `mf.yourdomain.com` → Droplet IP |
| 2 | CloudPanel: Node.js site oluştur |
| 3 | SSL: Let's Encrypt |
| 4 | Clone + Build + PM2 |
| 5 | GitHub Secrets ekle |
| 6 | Push yap → Otomatik deploy! 🎉 |
