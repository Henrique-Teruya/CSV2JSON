# Metodologia – Projeto CSV2JSON

## 1. Responsividade e Medidas
- Este projeto foca em ter uma interface **extremamente responsiva**.
- Para atingir isso, todas as medidas do projeto (como `width`, `height`, `margin`, `padding` etc) devem ser baseadas **apenas em `%` (porcentagens)** ou medidas relativas aplicáveis diretamente ao viewport ou seus containeres. Medidas fixas, como `px`, devem ser integralmente evitadas no layout para que a ferramenta se adapte livremente a todas as resoluções e tamanhos de tela.

## 2. Abordagem de Desenvolvimento: "No Rewrite"
- O conceito central do desenvolvimento atual foi a **não intervenção na base funcional**. A regra é: não aplicar nenhum conceito, arquivo ou biblioteca que já não esteja em uso.
- A lógica Node.js preexistente (que utiliza os módulos nativos como `fs` e `csv-parse`) não foi reescrita nem substituída por abordagens *browser-native* como `FileReader`.

## 3. Integração com o DOM (Interface)
- A lógica de conversão foi acoplada de forma passiva à interface. 
- A execução do script é ativada unicamente através da vinculação com o botão "Convert" e o evento de `submit` do formulário.
- O input de arquivo (`<input type="file" id="file">`) apenas fornece a propriedade `path` local do SO para ser repassada de forma transparente para o `fs.createReadStream`. Ao término da stream e conversão para string JSON, o resultado final é injetado diretamente no componente de interface `<textarea id="result">`.
