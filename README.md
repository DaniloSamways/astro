<div align="center">

<br/>

**ASTRO CONTROL DECK**

**Rastreie o céu ao vivo — satélites, estrelas e planetas na sua região, em tempo real.**

<br/>

[![License: MIT](https://img.shields.io/badge/license-MIT-white?style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-20.9.0+-white?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Python](https://img.shields.io/badge/python-3.10+-white?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![Next.js](https://img.shields.io/badge/next.js-frontend-white?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![Open Source](https://img.shields.io/badge/open%20source-yes-white?style=flat-square)](https://github.com/DaniloSamways/astro)

<br/>

![Screenshot](https://github.com/user-attachments/assets/41e85805-576e-48ab-b6e8-6af96f5aa2a9)

<br/>

</div>

---

## O que é isso?

O **Astro Control Deck** é um painel astronômico local que você roda no seu próprio computador. Ele mostra em tempo real quais objetos celestes e satélites estão visíveis na sua região — sem cadastro, sem assinatura, sem nada em nuvem.

Basta informar sua cidade e ver o que está no céu agora.

---

## Funcionalidades

| | |
|---|---|
| 🎯 **Target Lock** | Altitude, azimute e magnitude de qualquer objeto celeste |
| 🛰️ **Satellite Stream** | Passagens com horário de surgimento, pico e poente |
| 🌅 **Radar do Horizonte** | Tudo que está acima do horizonte agora |
| ⚡ **Atalhos rápidos** | Sol, Lua, Júpiter e mais, com um clique |
| 🕐 **Previsão de 12h** | Planeje sua sessão com antecedência |
| 🌡️ **Clima integrado** | Alerta quando o céu está nublado |

---

## Começando

> **Pré-requisitos:** [Node.js 20.9.0+](https://nodejs.org) · [Python 3.10+](https://python.org) · [Git](https://git-scm.com)

<br/>

### 1 — Configure o Python

**Linux (Ubuntu/Debian)**
```bash
sudo apt install python3-venv python3-full -y
python3 -m venv venv
source venv/bin/activate
pip install astropy astroquery requests skyfield
```

**Windows (PowerShell)**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install astropy astroquery requests skyfield
```

<br/>

### 2 — Clone o repositório

```bash
git clone https://github.com/DaniloSamways/astro.git
cd astro
```

<br/>

### 3 — Instale as dependências

```bash
npm run install:all
```

<br/>

### 4 — Inicie

```bash
npm run dev
```

```
  ▸  API       →  http://localhost:3001
  ▸  Frontend  →  http://localhost:3000
```

---

## Estrutura do projeto

```
astro/
├── backend/     # CLI e services em Python (cálculos astronômicos)
├── api/         # API Node.js que chama o backend Python
└── web/         # Interface em Next.js
```

---

## Stack

<div align="center">

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js |
| API | Node.js |
| Astronômico | Python · Astropy · Skyfield |

</div>

---

<div align="center">

**100% gratuito. Para sempre.**

Use, modifique, distribua — sem restrições.

<br/>

[⭐ Dar uma estrela](https://github.com/DaniloSamways/astro) · [🐛 Reportar bug](https://github.com/DaniloSamways/astro/issues) · [💡 Sugerir feature](https://github.com/DaniloSamways/astro/issues)

<br/>

Feito com ♥ para quem olha para cima

</div>
