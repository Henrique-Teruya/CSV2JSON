# Metodologia – Projeto CSV2JSON

## 1. Responsividade e Medidas
- Este projeto foca em ter uma interface **extremamente responsiva**.
- Para atingir isso, todas as medidas do projeto (como `width`, `height`, `margin`, `padding` etc) devem ser baseadas **apenas em `%` (porcentagens)** ou medidas relativas aplicáveis diretamente ao viewport ou seus containeres. Medidas fixas, como px, devem ser integralmente evitadas no layout para que a ferramenta se adapte livremente a todas as resoluções e tamanhos de tela.

## 2. Conversão (Browser-side)
- Toda a lógica de leitura do CSV foi injetada diretamente no ambiente DOM (browser). 
- O elemento `<input type="file">` captura o CSV, os scripts preechem as quebras de conteúdo do CSV adequadamente, padronizando os seus dados mantendo a regra de formato originais.
- O JSON formatado é por fim injetado assincronamente logo abaixo através do campo destinado result (`<textarea id="result">`), possibilitando fácil checagem e cópia do usuário.
