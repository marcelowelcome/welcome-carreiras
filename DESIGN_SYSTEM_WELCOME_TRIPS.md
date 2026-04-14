# Welcome Trips — Design System Tokens

> Documento de referência visual para agentes de IA (Claude Code, v0, Cursor, Windsurf).
> Usar como contexto em toda sessão de desenvolvimento frontend da marca Welcome Trips.

---

## 1. Identidade da Marca

**Posicionamento:** Agência de viagens com 20 anos de mercado. Tom aventureiro, inspirador e vibrante. Especializada em destinos exóticos e roteiros personalizados. Público diverso — de famílias a casais, de expedições a resorts.

**Personalidade:** Acolhedora, confiável, experiente, vibrante. Não é low-cost nem ultra-luxo — é curadoria com calor humano.

**Uso:** Pacotes de viagem, landing pages de campanhas, redes sociais de turismo, materiais promocionais, dashboards internos.

---

## 2. Paleta de Cores

### Cores Primárias
```css
--wt-primary: #0091B3;         /* Teal vibrante — cor dominante da marca */
--wt-primary-dark: #007A99;    /* Hover/active states */
--wt-primary-light: #E6F5F9;   /* Backgrounds sutis, cards */
```

### Cores Secundárias
```css
--wt-teal-deep: #0D5257;       /* Texto sobre fundo claro, headers premium */
--wt-teal-mid: #00968F;        /* Acentos, ícones, badges */
--wt-yellow: #F6BE00;          /* Destaques, promoções (Hot Sales), alertas */
--wt-orange: #EA7600;          /* CTAs quentes, urgência, botões de ação */
--wt-red: #D14124;             /* Alertas, promoções agressivas, erros */
```

### Neutros
```css
--wt-white: #FFFFFF;
--wt-off-white: #F8F7F4;       /* Background principal do site */
--wt-gray-100: #F2F0ED;        /* Cards, seções alternadas */
--wt-gray-300: #D1CCC5;        /* Bordas, divisores */
--wt-gray-500: #8A8580;        /* Texto secundário, captions */
--wt-gray-700: #4A4540;        /* Texto corpo */
--wt-black: #1A1A1A;           /* Headlines, texto forte */
```

### Regras de Aplicação
- **Background padrão:** `--wt-off-white` (tom creme/bege levemente quente, NÃO branco puro)
- **CTA principal:** `--wt-orange` com texto branco (padrão do site — botão "EXPLORE →")
- **Links e acentos:** `--wt-primary`
- **Texto headlines:** `--wt-black` ou `--wt-teal-deep`
- **Texto corpo:** `--wt-gray-700`
- **Campanhas promocionais (Hot Sales):** `--wt-yellow` como background dominante + `--wt-primary` nos textos

---

## 3. Tipografia

### Fontes
```css
--wt-font-heading: 'Avenir LT Std', 'Avenir Next', 'Avenir', system-ui, sans-serif;
--wt-font-body: 'Avenir LT Std', 'Avenir Next', 'Avenir', system-ui, sans-serif;
--wt-font-fallback: Arial, sans-serif;
```

**Nota para web:** Avenir LT Std é uma fonte licenciada. Para projetos web, usar:
- **Google Fonts alternativa:** `Nunito Sans` (closest free match) ou `Montserrat` (mais geométrica)
- Se houver licença disponível: Adobe Fonts → Avenir Next

### Escala Tipográfica
```css
--wt-text-xs: 0.75rem;     /* 12px — captions, labels pequenos */
--wt-text-sm: 0.875rem;    /* 14px — corpo secundário, metadata */
--wt-text-base: 1rem;      /* 16px — corpo principal */
--wt-text-lg: 1.125rem;    /* 18px — corpo destaque */
--wt-text-xl: 1.25rem;     /* 20px — subtítulos */
--wt-text-2xl: 1.5rem;     /* 24px — títulos de seção */
--wt-text-3xl: 1.875rem;   /* 30px — títulos de página */
--wt-text-4xl: 2.25rem;    /* 36px — headlines hero */
--wt-text-5xl: 3rem;       /* 48px — display hero */
```

### Pesos
```css
--wt-font-light: 300;
--wt-font-regular: 400;
--wt-font-medium: 500;
--wt-font-semibold: 600;
--wt-font-bold: 700;
--wt-font-black: 900;
```

### Regras Tipográficas
- **Headlines de seção:** Peso bold ou black, `--wt-text-3xl` a `--wt-text-5xl`
- **Corpo:** Regular, `--wt-text-base`, line-height 1.6
- **CTAs e botões:** Semibold, uppercase com letter-spacing 0.05em–0.1em
- **Nomes de destinos no site:** Usam fonte decorativa/script (estilo cursivo leve) — reservar para nomes de países/continentes quando apropriado

---

## 4. Espaçamento

```css
--wt-space-1: 0.25rem;    /* 4px */
--wt-space-2: 0.5rem;     /* 8px */
--wt-space-3: 0.75rem;    /* 12px */
--wt-space-4: 1rem;       /* 16px */
--wt-space-6: 1.5rem;     /* 24px */
--wt-space-8: 2rem;       /* 32px */
--wt-space-12: 3rem;      /* 48px */
--wt-space-16: 4rem;      /* 64px */
--wt-space-20: 5rem;      /* 80px */
--wt-space-24: 6rem;      /* 96px */
```

### Regras de Espaçamento
- **Seções do site:** Padding vertical generoso — mínimo `--wt-space-16` (64px), ideal `--wt-space-20` a `--wt-space-24`
- **Cards:** Padding interno `--wt-space-6` a `--wt-space-8`
- **Gap entre cards:** `--wt-space-6` (24px)
- **Largura máxima de conteúdo:** 1280px, com padding lateral `--wt-space-6`
- **O site respira:** bastante espaço em branco entre seções. Não comprimir.

---

## 5. Componentes

### Botões

**CTA Principal (estilo "EXPLORE →")**
```css
.wt-btn-primary {
  background: transparent;
  border: 1.5px solid var(--wt-gray-700);
  color: var(--wt-gray-700);
  padding: 12px 24px;
  font-weight: 600;
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
}
.wt-btn-primary:hover {
  background: var(--wt-primary);
  border-color: var(--wt-primary);
  color: white;
}
/* O "→" aparece dentro de um circle ou box separado no site */
```

**CTA Quente (campanhas, urgência)**
```css
.wt-btn-hot {
  background: var(--wt-orange);
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: 6px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

### Cards de Destino
```css
.wt-card-destination {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.wt-card-destination:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}
/* Imagem no topo, nome do destino + mapa outline + botão explore abaixo */
```

### Cards de Continente (estilo imersivo)
```css
.wt-card-continent {
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  aspect-ratio: 3/4;
  /* Imagem full-bleed como background */
  /* Label + botão no rodapé com fundo branco/glass */
}
```

### Seção "Reconhecimento na Mídia"
- Logos em escala de cinza, alinhados horizontalmente
- Background branco ou off-white
- Tipografia centralizada acima

---

## 6. Layout & Composição

### Padrões Observados no Site
- **Hero:** Full-width com imagem de fundo, overlay leve, texto centralizado ou à esquerda
- **Seção de destinos:** Grid de 5 cards em desktop, scroll horizontal em mobile
- **Seção de continentes:** Grid de 3 cards grandes com imagens imersivas
- **Quem somos:** Layout 50/50 — texto à esquerda, composição circular de fotos à direita
- **Logo bar:** Linha horizontal de logos monocromáticos

### Grid
```css
--wt-grid-cols-desktop: 12;
--wt-grid-cols-tablet: 8;
--wt-grid-cols-mobile: 4;
--wt-container-max: 1280px;
--wt-container-padding: 1.5rem;
```

### Breakpoints
```css
--wt-bp-sm: 640px;
--wt-bp-md: 768px;
--wt-bp-lg: 1024px;
--wt-bp-xl: 1280px;
```

---

## 7. Efeitos & Texturas

```css
/* Sombras */
--wt-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06);
--wt-shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
--wt-shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.1);

/* Border radius */
--wt-radius-sm: 6px;
--wt-radius-md: 12px;
--wt-radius-lg: 16px;
--wt-radius-xl: 24px;
--wt-radius-full: 9999px;

/* Transições */
--wt-transition-fast: 200ms ease;
--wt-transition-base: 300ms ease;
--wt-transition-slow: 500ms ease;
```

### Texturas e Background
- O site usa um **padrão de mapa-múndi em marca d'água** (opacidade ~3-5%) no fundo de algumas seções
- Background predominante: off-white quente (`#F8F7F4`), NÃO branco frio
- Fotos arredondadas em composição circular (seção "Quem Somos")

---

## 8. Fotografia & Imagens

### Diretrizes
- **Tom:** Luz natural, paisagens grandiosas, pessoas sorrindo, momentos autênticos
- **Tratamento:** Sem filtros pesados, cores vibrantes mas naturais
- **Composição:** Imagens full-bleed em heros, recortes circulares para equipe/pessoas
- **Ícones:** Linha fina, monocromáticos, estilo outline

### Aspect Ratios Comuns
- Hero: 16:9 ou full-viewport
- Cards de destino: 4:3 (landscape)
- Cards de continente: 3:4 (portrait)
- Fotos de equipe: 1:1 (circular)

---

## 9. Tom de Voz em UI

- **CTAs:** Verbos de ação + seta → ("EXPLORE →", "DESCUBRA", "CONHEÇA")
- **Headlines:** Frases inspiracionais, tom de convite ("Descubra os segredos dos Continentes")
- **Subtítulos:** Descritivos, tom de consultoria confiável
- **Caixa alta:** Usada em CTAs e labels de categorias
- **Idioma:** Português brasileiro, sem anglicismos desnecessários

---

## 10. Instagram — Linguagem Visual Complementar

### Padrões do Feed (@welcometrips)
- **Paleta dominante:** Teal (#0091B3) + amarelo (#F6BE00) para promos
- **Campanhas promocionais:** Background amarelo vibrante, tipografia bold, preço em destaque
- **Conteúdo editorial:** Fotos de destino com overlay de texto branco em peso leve
- **Reels:** Tom casual, bastidores, dicas práticas
- **Tipografia nos posts:** Mix de sans-serif bold (headlines) + script/cursiva (nomes de destinos)

---

## 11. Tailwind CSS — Configuração Sugerida

```javascript
// tailwind.config.js (parcial)
module.exports = {
  theme: {
    extend: {
      colors: {
        wt: {
          primary: '#0091B3',
          'primary-dark': '#007A99',
          'primary-light': '#E6F5F9',
          'teal-deep': '#0D5257',
          'teal-mid': '#00968F',
          yellow: '#F6BE00',
          orange: '#EA7600',
          red: '#D14124',
          'off-white': '#F8F7F4',
          'gray-100': '#F2F0ED',
          'gray-300': '#D1CCC5',
          'gray-500': '#8A8580',
          'gray-700': '#4A4540',
          black: '#1A1A1A',
        },
      },
      fontFamily: {
        heading: ['Nunito Sans', 'Avenir Next', 'system-ui', 'sans-serif'],
        body: ['Nunito Sans', 'Avenir Next', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'wt-sm': '6px',
        'wt-md': '12px',
        'wt-lg': '16px',
        'wt-xl': '24px',
      },
      boxShadow: {
        'wt-sm': '0 1px 3px rgba(0, 0, 0, 0.06)',
        'wt-md': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'wt-lg': '0 8px 24px rgba(0, 0, 0, 0.1)',
      },
      maxWidth: {
        'wt-container': '1280px',
      },
    },
  },
};
```

---

## 12. Checklist de Consistência

Antes de finalizar qualquer componente ou página Welcome Trips, verificar:

- [ ] Background é off-white quente, não branco puro
- [ ] Cor primária teal (#0091B3) presente mas não dominante — usada como acento
- [ ] CTAs seguem o padrão "EXPLORE →" (outline com seta) ou botão laranja para urgência
- [ ] Espaçamento generoso entre seções (mín. 64px vertical)
- [ ] Tipografia sem-serif limpa, pesos variados para hierarquia
- [ ] Headlines em bold/black, corpo em regular
- [ ] Imagens com bordas arredondadas (12–16px)
- [ ] Hover states suaves (translateY + shadow transition)
- [ ] Tom de voz: inspiracional, convidativo, profissional sem ser frio
- [ ] Responsivo: cards empilham em mobile, hero adapta
