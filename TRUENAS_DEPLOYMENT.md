# Wunero auf TrueNAS Scale deployen

## Option 1: Mit Helm Chart (lokal installieren)

```bash
# Chart validieren
helm lint charts/wunero

# Chart installieren
helm install wunero charts/wunero \
  --set wunero.nextauth.secret="$(openssl rand -base64 32)" \
  --set wunero.nextauth.url="https://wunero.example.com" \
  --set wunero.email.apiKey="your-resend-api-key" \
  --namespace wunero \
  --create-namespace
```

## Option 2: Mit Docker Hub Image (Einfacher für TrueNAS)

```yaml
# Via TrueNAS Scale UI:
# Apps → Install → Custom App
# Verwende diese Werte:

image: xmlmxmlmx/wunero:latest  # oder xmlmxmlmx/wunero:v0.1.1

environment:
  NODE_ENV: production
  NEXTAUTH_SECRET: <generate-secure-secret>
  NEXTAUTH_URL: https://wunero.sebastianhoesl.online
  RESEND_API_KEY: <your-resend-api-key>

storage:
  - mount: /app/data
    type: "PVC"
    size: "2Gi"
```

## Versioning mit Git Tags

### Lokale Releases erstellen:

```bash
# Patch Version (0.1.0 → 0.1.1)
npm version patch
git push origin main --follow-tags

# Minor Version (0.1.0 → 0.2.0)
npm version minor
git push origin main --follow-tags

# Major Version (0.1.0 → 1.0.0)
npm version major
git push origin main --follow-tags
```

### Docker Hub Tags automatisch:
- Tag: `v0.1.1` → Images: `v0.1.1`, `0.1`, `latest`
- Tag: `v1.0.0` → Images: `v1.0.0`, `1.0`, `latest`

## Für TrueNAS Apps Repository einreichen

1. **Fork https://github.com/truenas/apps**
2. **Chart struktur erstellen:**
   ```
   truenas/apps/
   └── community/
       └── wunero/
           ├── App/
           │   ├── app-icon.png (icon.png) 
           │   ├── screenshots/ (optional)
           │   └── metadata.yaml (Beschreibung)
           ├── questions.yaml (UI Formular)
           ├── Chart.yaml
           ├── values.yaml
           └── templates/ (wie oben)
   ```

3. **Wichtige Dateien:**

   **metadata.yaml:**
   ```yaml
   name: Wunero
   description: Shared wishlist application for collaborative gift planning
   title: Wunero
   category: Productivity
   version: 0.1.1
   ```

   **questions.yaml:**
   ```yaml
   groups:
     - name: "Configuration"
       description: "Configure Wunero settings"
       questions:
         - variable: wunero.nextauth.secret
           label: "NextAuth Secret"
           description: "Generate with: openssl rand -base64 32"
           type: password
           required: true
         - variable: wunero.nextauth.url
           label: "Application URL"
           description: "Full URL where app will be accessed (e.g., https://wunero.example.com)"
           type: string
           required: true
         - variable: wunero.email.apiKey
           label: "Resend API Key"
           description: "Optional: Get from https://resend.com"
           type: password
           required: false
   ```

4. **PR öffnen zu https://github.com/truenas/apps**

## Deployment Checkliste

- [ ] Docker Image auf Docker Hub (v0.1.1)
- [ ] Git Tags gesetzt und gepusht
- [ ] Helm Chart validiert: `helm lint charts/wunero`
- [ ] values.yaml dokumentiert
- [ ] TrueNAS Test-Deployment erfolgreich
- [ ] Chart mit Secrets verschlüsselt (falls needed)
- [ ] PR zu truenas/apps eingereicht (optional)

## Troubleshooting

**Pod startet nicht:**
```bash
kubectl logs -n wunero deployment/wunero-wunero
```

**Secrets nicht gesetzt:**
```bash
kubectl get secrets -n wunero
```

**Persistent Volume Problem:**
```bash
kubectl get pvc -n wunero
kubectl describe pvc wunero-wunero-pvc -n wunero
```
