# Totem Interativo SP · My Little Pony e Transformers

Dois totens verticais independentes, precedidos por uma tela de escolha de tema. Frontend estático, sem backend, banco de dados ou dependências externas de execução.

- **My Little Pony:** labirinto, sorteio de poses e criação de pônei.
- **Transformers:** scan do Optimus Prime, transformação de cinco personagens e montagem do símbolo Autobot.

A escolha usa navegação normal na mesma aba. Nenhum iframe, script compartilhado entre os jogos ou execução simultânea dos dois temas. Cada tema tem suas próprias imagens, estilos, lógica e estado. O Home e a inatividade retornam ao pôster do tema atual, sem trocar de universo.

## Estrutura

```text
frontend/
  index.html                    Escolha do tema
  src/styles.css                Estilos exclusivos da escolha
  public/previews/              Imagens dos cartões de escolha
  themes/
    my-little-pony/              Projeto Pony preservado
      index.html
      src/app.js
      src/styles.css
      public/
    transformers/               Projeto Transformers independente
      index.html
      src/app.js
      src/styles.css
      public/                   Inclui 45 frames de transformação
  scripts/                      Build, servidor e testes
  dist/                         Saída gerada, não versionada
Iniciar-Totem.ps1                Inicializador Windows com escolha de tema
```

## Desenvolvimento

Requer Node.js 22 ou superior e npm.

```sh
cd frontend
npm ci
npm run dev
```

Abra `http://127.0.0.1:4173/`. Depois de editar os arquivos, reinicie `npm run dev` para gerar a nova versão. Os assets são locais; a execução não exige internet ou login no ChatGPT.

## Build e prévia

```sh
cd frontend
npm run build
npm run preview
```

O build verifica a sintaxe JavaScript, os assets dos dois temas, os 45 frames do Transformers e os testes de retorno automático, depois gera `frontend/dist`. A saída antiga é limpa para evitar arquivos de um tema na raiz do seletor. Publique o conteúdo completo dessa pasta. Use um servidor HTTP; não abra o HTML por `file://`.

## Endereços separados

| Caminho | Experiência |
| --- | --- |
| `/` | Escolha do tema |
| `/my-little-pony/` | Apenas o totem My Little Pony |
| `/transformers/` | Apenas o totem Transformers |

Os endereços diretos permitem configurar um equipamento para um único tema. Para escolher outro, reabra `/` ou volte pelo navegador. Os jogos não oferecem navegação cruzada entre temas.

## Deploy do frontend

Ao importar este repositório em uma hospedagem estática, configure:

| Configuração | Valor |
| --- | --- |
| Framework | Outro / site estático |
| Diretório raiz do projeto | `frontend` |
| Instalação | `npm ci` |
| Comando de build | `npm run build` |
| Diretório de saída | `dist` |
| Node.js | 22 ou superior |
| Variáveis de ambiente | Nenhuma |

Se a hospedagem executar os comandos a partir da raiz do repositório, use `npm --prefix frontend ci`, `npm --prefix frontend run build` e saída `frontend/dist`.

Na Vercel, selecione `frontend` em **Root Directory**. O arquivo `frontend/vercel.json` define instalação, build e saída `dist` automaticamente. A pasta `public` contém apenas imagens e não deve ser usada como saída do deploy.

Não são necessários redirects de SPA ou um processo Node em produção. O servidor em `scripts/serve.mjs` é destinado ao uso local. O workflow do GitHub valida o build e disponibiliza o artefato `frontend-dist`; ele não publica o site automaticamente.

## Equipamento físico

Consulte [LEIA-ME.md](LEIA-ME.md). O inicializador do Windows prepara o build e abre Edge ou Chrome em modo quiosque. Configure a tela em Retrato, idealmente 1080 × 1920, e valide toque e áudio no equipamento.

## Verificação

`npm run check` verifica código e referências a assets. `npm test` verifica inatividade, isolamento e cancelamento de carregamentos após sair. O build executa ambos. Valide manualmente o arraste no labirinto, o retorno automático ao início, as poses, as cinco etapas do avatar, o áudio após o primeiro toque e o retorno por inatividade.

## Conteúdo visual

My Little Pony, Transformers e seus personagens pertencem aos respectivos titulares. Este repositório não concede licença sobre marcas ou imagens de terceiros.

## Origem dos temas

O Pony foi preservado a partir do projeto deste repositório. O Transformers foi importado do Site `https://transformers-scan-totem.rodrigomuinhostattoo.chatgpt.site/`, commit de origem `5a9666d4ed952a08c44754fa053d1115ea3b7c7d`. Os Sites originais não são necessários para executar os totens nem foram alterados nesta importação.

Atualização importada do Transformers: versão 16 do Site, com pôster vertical animado e novo visual/indicadores da montagem do símbolo. Foram mantidos os ajustes locais de Home, inatividade de 15 segundos e sequência final do Optimus.
