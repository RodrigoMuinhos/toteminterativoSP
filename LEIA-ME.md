# Totens My Little Pony e Transformers

Execute `Iniciar-Totem.ps1` com PowerShell para abrir a escolha de tema em modo quiosque. Cada escolha abre apenas o totem correspondente.

Para iniciar diretamente um tema, use `./Iniciar-Totem.ps1 -Tema my-little-pony` ou `./Iniciar-Totem.ps1 -Tema transformers`. Requer Node.js e Edge ou Chrome. Para fechar, use Alt+F4. O servidor iniciado pelo script encerra junto com o navegador.

O código e as imagens ficam em `frontend`. O inicializador gera `frontend/dist` antes de abrir o navegador. A execução local não depende de internet nem de login no ChatGPT. Não apague a pasta `frontend`.

Configure a tela do Windows em orientação Retrato (9:16, idealmente 1080 × 1920), calibre o toque e desative suspensão e desligamento da tela durante o evento. Ajuste o volume antes de abrir. O áudio é liberado pelo primeiro toque.

Teste no equipamento: toque para começar, arraste no labirinto, aguarde o retorno automático ao início, sorteie uma pose e conclua as cinco etapas de criação. Todas as brincadeiras retornam ao pôster após 15 segundos sem interação, inclusive a criação de pônei. O botão Home no topo permite voltar imediatamente. A criação também tem limite total de 60 segundos. No Pony, a comemoração volta após 7 segundos. No Transformers, teste o scan (segure a mão), a transformação dos personagens e o arraste das peças do símbolo. Cada experiência retorna ao pôster do próprio tema; nunca abre o outro totem. Para escolher outro tema, reabra a tela inicial de seleção.

O modo quiosque ocupa a tela; não bloqueia atalhos do Windows. Para uma instalação pública com bloqueio do sistema, configure Acesso Atribuído no Windows com o responsável pelo equipamento.

Para preparar um deploy em outra hospedagem, consulte as configurações no `README.md`. Para o evento, use o inicializador local.
