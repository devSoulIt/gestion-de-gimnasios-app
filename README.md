# Build & Release con Expo + EAS (Android APK/AAB e iOS)

Guía paso a paso para compilar, probar y publicar apps Expo (React Native) usando **EAS Build** y **EAS Submit**.

## Requisitos

- **Node.js** LTS (≥ 18).
- Proyecto Expo inicializado (`app.json` o `app.config.ts`).
- **EAS CLI** instalado y sesión iniciada:
  ```bash
  npm i -D eas-cli
  npx eas --version
  npx eas login
  ```
- Cuentas de desarrollador (según plataforma):
  - **Google Play Console** (Android).
  - **Apple Developer Program** y acceso a **App Store Connect** (iOS, macOS recomendado).

---

## 1) Configuración base en `app.json`

Asegurate de definir *identificadores* y *versionado* por plataforma:

```json
{
  "expo": {
    "name": "Mi App",
    "slug": "mi-app",
    "version": "1.0.0",
    "android": {
      "package": "com.tuempresa.miapp",
      "versionCode": 1
    },
    "ios": {
      "bundleIdentifier": "com.tuempresa.miapp",
      "buildNumber": "1"
    },
    "plugins": ["expo-updates"]
  }
}
```

**Notas de versionado**  
- **Android**: incrementá `android.versionCode` (entero) en cada release.  
- **iOS**: incrementá `ios.buildNumber` (string) en cada release.  
- (Opcional) `expo.version` para versionado semántico visible al usuario.

---

## 2) Inicializar EAS y perfiles de build

Generá/actualizá el `eas.json`:
```bash
npx eas build:configure
```

Podés partir de esta configuración mínima:
```json
{
  "cli": { "version": ">= 6.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview-apk": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "distribution": "store"
    }
  },
  "submit": {
    "production": {
      "android": { "track": "internal" },
      "ios": {}
    }
  }
}
```

**Perfiles clave**  
- `development`: testing con **Expo Dev Client**.  
- `preview-apk`: genera **APK** instalable para QA interno.  
- `production`: genera artefactos de **tienda** (Android **AAB**, iOS **IPA**).

---

## 3) Android — Modo normal (AAB para Play Store)

1. Verificá:
   - `android.package` definido (e.g., `com.tuempresa.miapp`).
   - `android.versionCode` incrementado si es nueva versión.

2. Build de producción (**AAB**):
   ```bash
   npx eas build -p android --profile production
   ```

3. Descarga del artefacto: seguí la URL que imprime la CLI o listá builds:
   ```bash
   npx eas build:list
   ```

4. **Subir a Google Play** (automático con EAS Submit):
   ```bash
   npx eas submit -p android --latest --profile production
   ```
   > La primera vez configurá credenciales (Service Account JSON). También podés subir el `.aab` manualmente en Play Console.

---

## 4) Android — Modo APK (testing interno)

> **Google Play** exige **AAB** para publicar. El **APK** se usa para pruebas/QA.

1. Build **APK** con perfil `preview-apk`:
   ```bash
   npx eas build -p android --profile preview-apk
   ```

2. Instalar el último build en emulador/dispositivo:
   ```bash
   npx eas build:run -p android --latest
   ```
   O descargá el `.apk` desde la URL y usá:
   ```bash
   adb install ruta/al.apk
   ```

---

## 5) iOS — Build de producción (para App Store)

**Requisitos**  
- `ios.bundleIdentifier` asociado en tu equipo de Apple Developer.  
- Acceso a App Store Connect.  

1. Incrementá `ios.buildNumber` si corresponde.

2. Build de producción (**IPA**):
   ```bash
   npx eas build -p ios --profile production
   ```
   > EAS puede **gestionar certificados y perfiles** automáticamente (recomendado).

3. **Subir a App Store Connect**:
   ```bash
   npx eas submit -p ios --latest --profile production
   ```
   > Recomendado usar **App Store Connect API Key**. Alternativa: **Transporter** (macOS) con el `.ipa`.

---

## 6) OTA Updates (sin pasar por tiendas) — opcional

Con `expo-updates` podés publicar cambios JS/assets sin rebuild nativo:

```bash
# Configurá updates (si aún no lo hiciste)
npx eas update:configure

# Publicar a un branch/canal
npx eas update --branch production --message "Fix de UI"
```

> Si cambiaste módulos/configuración **nativa**, necesitás un nuevo **build**.

---

## 7) Variables de entorno y secretos

- **Públicas** (inject en build): prefijo `EXPO_PUBLIC_` en `.env`, p. ej.:
  ```env
  EXPO_PUBLIC_API_URL=https://api.tuapp.com
  ```

- **Secretos** (tokens/keys) con **EAS Secrets**:
  ```bash
  npx eas secret:create --name API_KEY --value "xxx"
  ```

---

## 8) Checklist de publicación

- [ ] `android.package` / `ios.bundleIdentifier` correctos.  
- [ ] `android.versionCode` incrementado.  
- [ ] `ios.buildNumber` incrementado.  
- [ ] Iconos y Splash actualizados en `app.json`.  
- [ ] Permisos (cámara, ubicación, etc.) declarados para iOS/Android.  
- [ ] **Android AAB**: `npx eas build -p android --profile production`.  
- [ ] **iOS IPA**: `npx eas build -p ios --profile production`.  
- [ ] **Submit Android**: `npx eas submit -p android --latest`.  
- [ ] **Submit iOS**: `npx eas submit -p ios --latest`.  
- [ ] (Opcional) OTA: `npx eas update` al branch/canal correspondiente.

---

## 9) Troubleshooting rápido

- **Error por identificadores**: faltan `android.package` o `ios.bundleIdentifier`.  
- **Rechazo por versión**: incrementá `versionCode` (Android) / `buildNumber` (iOS).  
- **Firmas iOS**: dejá que EAS gestione certificados y perfiles, o subí los tuyos con `npx eas credentials`.  
- **APK no sube a Play**: Play requiere **AAB**; usá APK solo para testing interno.

---

## 10) Comandos útiles

```bash
# Login / Proyecto
npx eas login
npx eas whoami
npx eas build:configure

# Builds
npx eas build -p android --profile production     # Android AAB (Play)
npx eas build -p android --profile preview-apk    # Android APK (testing)
npx eas build -p ios --profile production         # iOS IPA (App Store)

# Listar / ver
npx eas build:list
npx eas build:view --build-id <id>

# Instalar último build en Android
npx eas build:run -p android --latest

# Subir a tiendas
npx eas submit -p android --latest --profile production
npx eas submit -p ios --latest --profile production

# OTA updates
npx eas update --branch production --message "Notas de versión"
```

---

## 11) `eas.json` de referencia

```json
{
  "cli": { "version": ">= 6.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview-apk": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "distribution": "store"
    }
  },
  "submit": {
    "production": {
      "android": { "track": "internal" },
      "ios": {}
    }
  }
}
```
