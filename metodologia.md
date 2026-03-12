# Metodologia — CSV2JSON Converter

## 1. Princípios de Design Responsivo

### 1.1 Sistema de Medidas — Apenas `%`

Toda a layout do site utiliza **exclusivamente medidas baseadas em porcentagem (`%`)** para garantir responsividade total em qualquer dispositivo.

| Propriedade | Unidade Permitida | Exemplo |
|---|---|---|
| `width` | `%` | `width: 90%` |
| `max-width` | `%` | `max-width: 100%` |
| `margin` (horizontal) | `%` | `margin: 0 5%` |
| `padding` (horizontal) | `%` | `padding: 0 5%` |
| `margin` (vertical) | `%` | `margin-top: 3%` |
| `padding` (vertical) | `%` | `padding: 4% 5%` |
| `gap` | `%` | `gap: 2%` |
| `border-radius` | `%` | `border-radius: 2%` |

> [!IMPORTANT]
> **Exceções permitidas**: `font-size` usa `rem`/`em` para acessibilidade. `min-height` de áreas de texto pode usar `vh` para garantir visibilidade mínima na viewport.

### 1.2 Nenhum Valor Fixo em `px` para Layout

- ❌ `width: 400px`
- ❌ `margin-left: 20px`
- ❌ `padding: 16px 24px`
- ✅ `width: 90%`
- ✅ `margin-left: 5%`
- ✅ `padding: 3% 5%`

---
