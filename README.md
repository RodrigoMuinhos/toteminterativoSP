# Totem Interativo SP · My Little Pony

Painel vertical com labirinto, sorteio de poses e criação de pônei. Frontend estático, sem backend, banco de dados ou dependências de execução externas.

## Estrutura

```text
frontend/
  index.html          Tela inicial
  src/app.js          Brincadeiras e interações
  src/styles.css      Estilos e animações
  public/             Imagens locais
  scripts/            Servidor local, verificação e build
  dist/               Gerado pelo build; não versionado
Iniciar-Totem.ps1      Inicializador do equipamento Windows
```

## Desenvolvimento

Requer Node.js 22 ou superior e npm.

```sh
cd frontend
npm ci
npm run dev
```

Abra `http://127.0.0.1:4173`. Atualize a página após editar arquivos. Os assets são locais; a execução não exige internet ou login no ChatGPT.

## Build e prévia

```sh
cd frontend
npm run build
npm run preview
```

O build verifica a sintaxe JavaScript e os assets referenciados pelo HTML/CSS, depois gera `frontend/dist`. Publique o conteúdo completo dessa pasta. Use um servidor HTTP; não abra o HTML por `file://`.

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

`npm run check` verifica código e referências a assets. O build também roda essa verificação. Valide manualmente o arraste no labirinto, o retorno automático ao início, as poses, as cinco etapas do avatar, o áudio após o primeiro toque e o retorno por inatividade.

## Conteúdo visual

My Little Pony e seus personagens pertencem aos respectivos titulares. Este repositório não concede licença sobre marcas ou imagens de terceiros.
