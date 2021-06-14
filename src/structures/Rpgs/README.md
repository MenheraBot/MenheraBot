# World Of Boleham:Reborn

Ok, refazer um rpg vai ser difícil, ainda mais um pelo Discord, e pior, do ZERO.
Vou precisar de muito estudo e pensar certinho na estrutura do código pra não ser quebrado como a primeira versão

Este arquivo servirá pra me auxilidar no desenvolvimento do rpg, e para anotar ideias e piriri pororó

## Ideias

Até o momento pensei nas seguintes coisas:
• Comando Novo:

- m!bosschannel - Setta um canal do servidor para spawnar boss aleatoriamente. Quanto maior o servidor, mais forte será o boss, e mais loots ele dropará. Os bosses serão feitos em parties, então todos que, por exemplo, reagirem à mensagem do boss, participarão da batalha!

• Proficiência de Habilidade:

- Cada habilidade terá um nível, e dependendo do nível, um dano e uma chance de acerto.
- Cada classe tem uma facilidade para certos aspectos, por exemplo, mago tem mais facilidade com magias, enquanto assassino tem mais facilidade com ataque físico, e bárbaros com defesa!
- Quanto mais se usa certa habilidade, mais a sua proficiência com ela aumentará! E quanto maior o nível da habilidade, mais dano e mais chances de acerto terá!
- Monstros encontrados na Dungeon terão nível baseado no lvl do usuário. Cada monstro tem as suas habilidades e ataques, que dependerão do nível dele.
- Os monstros possuem chance de acerto também, e as armaduras dos usuários terão chance de bloqueio, que ignorará uma % ataques, e dependendo da proficiência de defesa do usuário, poderá ignorar totalmente certos ataques

• Raridade de Itens:

- Os itens terão suas raridades. Cada mob terá um certo drop, que dependendo da proficiência de sorte do usuário (em outras palavras, quanto mais cagado ele for, melhor) pode dropar mais de um item, e com raridades diferentes
- Na loja, os itens terão custo dependendo da raridade

• Party

- A dungeon agora terá parties, que podem ser de até 3 jogadores
- Bosses serão spawnados aleatoriamentes, sem limite de jogadores por party

• Mecânica

- O principal fator das batalhas é a velocidade de movimento, que definirá sua chace de desviar de um ataque. O cálculo de baseia na proficiência de ataque básico do inimigo tambem

- O mundo de Boleham será dinâmico, e eu tentarei fazer sempre uma atualização mudando o mundo. Ter um comando `m!lore` que mostra a lore atual do rpg, e a cada atualização de evento, adicionar mais uma página de lore, mudando algo no mundo, e mudando algo tipo mobs ou ent poderes especiais durante o evento da atualização.

## Classes

O RPG será dividido em classes que o usuário poderá escolher ao se registrar

#### Assassino

**Descrição -** Uma classe aniquiladora e furtiva. Com seus conhecimentos em emboscadas, o assassino busca matar sua vítima com ilusões, antes mesmo dela perceber que seu fim chegou!

**Armas Disponíveis -** Adagas, facas, sabres, bestas

**Armaduras Disponíveis -** Leve, apenas

**Estilo de Habilidades -** Criação de clones para desviar o ataque inimigo, veneno e avanços

**Atributos:**

- Maior facilidade em acertar ataques básicos
- Dificuldade com evolução de habilidades
- Baixo dano de habilidade
- Pouca Vida, porém desvia de ataques com facilidade com alta velocidade de movimento

#### Caçador

**Descrição -** Os caçadores utilizam de armas de longa distância para derrubar seus inimigos. Lobos são seus melhores amigos, e seus melhores suportes de batalha.

**Armas Disponíveis -** Arcos, Bestas e armas leves de uma mão

**Armaduras Disponíveis -** Leve até mediana

**Estilo de Habilidades -** Controle de animais, armadilhas que retardam a velocidade do inimigo

**Atributos:**

- Maior facilidade em acertar ataques básicos mistos de habilidades
- Velocidade média ao caminhar normalmente, alta velocidade montado em um lobo
- Vida mediana, porem aguenta tranquilo com uma armadura
