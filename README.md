# 🍳 Chef Claude – Generador de Recetas Inteligente

[![React](https://img.shields.io/badge/React-17.0-blue?logo=react)](https://reactjs.org/) 
[![Vite](https://img.shields.io/badge/Vite-4.0-brightgreen?logo=vite)](https://vitejs.dev/) 
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-blue?logo=tailwind-css)](https://tailwindcss.com/) 
[![Node.js](https://img.shields.io/badge/Node.js-18.0-green?logo=node.js)](https://nodejs.org/) 
[![Redis](https://img.shields.io/badge/Redis-7.0-red?logo=redis)](https://redis.io/) 
[![Upstash](https://img.shields.io/badge/Upstash-Serverless-orange)](https://upstash.com/) 
[![Anthropic Claude](https://img.shields.io/badge/Anthropic_Claude-AI-purple)](https://www.anthropic.com/)

---

Chef Claude es una **aplicación web** que genera recetas personalizadas a partir de los ingredientes que tengas en tu cocina, utilizando inteligencia artificial para crear recetas coherentes y divertidas en español latinoamericano.

---

## 🛠 Tecnologías utilizadas

- **Frontend**
  - React + Vite
  - Tailwind CSS
  - UUID para identificar usuarios
  - `react-confetti` para efectos visuales

- **Backend / Serverless**
  - Node.js (Vercel Functions)
  - Redis (Upstash) para:
    - Rate limiting
    - Cache de recetas
    - Logs de uso
  - Integración con **Anthropic Claude API**
  - Validación con **Google ReCAPTCHA v3**

---

## ⚙ Funcionalidades

1. **Generación de recetas**
   - Usuario debe ingresar **4 ingredientes o más**.
   - Al presionar **Crear Receta**, se genera la receta con pasos e ingredientes relevantes.
   - Scroll automático baja hasta la receta generada.
   - Confeti aparece sobre la receta.

2. **Control de uso**
   - Rate limit: máximo **3 recetas por usuario cada 24h**.
   - Cache de 5 minutos para la misma lista de ingredientes.

3. **Seguridad**
   - ReCAPTCHA v3 previene múltiples llamadas automáticas.
   - Secret keys protegidas en backend; no se exponen en frontend.

4. **Logs y métricas**
   - Cada receta se registra en Redis.
   - Información histórica por usuario o global.

---

## ✅ Revisión de ReCAPTCHA

- Cada solicitud de receta envía un **token de ReCAPTCHA** al backend.
- Si el token es inválido o sospechoso, la solicitud es rechazada (`403 Captcha inválido`).

---

## 💡 Buenas prácticas

- Nunca exponer claves sensibles en frontend.
- Limitar el acceso a endpoints sensibles mediante secret keys.
- Guardar logs y métricas en Redis para control y debugging.

---

## 📌 Resumen de flujo de uso para el usuario

1. Escribir **4 o más ingredientes**.
2. Presionar **Crear Receta**.
3. La receta se genera, el scroll baja automáticamente y se muestra la receta.
4. Aparece confeti sobre la receta generada.
5. El sistema controla límite de uso y evita abusos mediante ReCAPTCHA.

---

**¡Listo! Chef Claude está preparado para generar recetas deliciosas y seguras.**
