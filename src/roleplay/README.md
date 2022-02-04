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

• Títulos
- Usuarios recebem títulos de acordo de como agem no mundo. Por exemplo, um minerador que só minera pedras preciosas receberia o Titulo "My Precious" onde ele teria 10% a mais de chance de encontrar minerios raros, e desbloquearia uma mina especial, com cooldown maior e premios melhores.
- Outro titulo seria por exemplo, "Monster Killer" que pessoas que vão praticamente e unicamente para a dungeon recebem esse titulo onde dão mais dano contra monstros e liberam locais unicos da dungeon (como se ele conhecesse mais da área)
-  Titulos de Eventos: Para animar a gurizadinha, eventos poderiam dar titulos, como o "Ruina Mortal" (MessiasTrick Esteve Aqui), onde o vencedor do evento, com historia e tudo mais receberia esse titulo, que meio que "mudaria" como o personagem dele funcona, dando mais dano, sendo mais forte POREM só poderia usar um tipo de item como arma "Soco Ingles" que seria extremamente fodido de conseguir, mas forte quando upado

• Party

- A dungeon agora terá parties, que podem ser de até 3 jogadores
- Bosses serão spawnados aleatoriamentes, sem limite de jogadores por party

• **Localização**

- Boleham terá um Mapa, e as pessoas podem viajar pelo mundo, indo para outras cidades. Quanto mais longe da cidade principal, melhor os loots e mais forte os monstros

- Tempo de viajem: Ao viajar para um lugar, o usuário ficara X tempo sem poder usar comandos (Depende da distância da cidade que o usuário escolheu)

- Mercantes: Ao viajar para cidades, o usuário terá a chance de encontrar Mercantes, que possuem uma loja com preços e itens diferenciados.

- Regiões: Cada jogador nascerá em uma região. Até o momento pensei em 3 regioes. Cada região seria mais abundante em certos materias, por exemplo, uma regiao de solo fertil possui alimentos mais baratos, e mais diversidade de itens em plantação, enquanto numa região de mineração, itens como espadas seriam mais baratas.

• Mecânica

- O principal fator das batalhas é a velocidade de movimento, que definirá sua chace de desviar de um ataque. O cálculo de baseia na proficiência de ataque básico do inimigo tambem

- O mundo de Boleham será dinâmico, e eu tentarei fazer sempre uma atualização mudando o mundo. Ter um comando `m!lore` que mostra a lore atual do rpg, e a cada atualização de evento, adicionar mais uma página de lore, mudando algo no mundo, e mudando algo tipo mobs ou ent poderes especiais durante o evento da atualização.

- Quest: O RPG terá quests que o jogador pode pegar na guilda. Ele só poderá trocar de quest ao terminar uma, e só continuará avançando na historia ao finalizar a quest atual. Quests especiais aparecerão em eventos.

- Alimentos: O usuário poderá recarregar sua energia (mana e vida) com alimentos. Atualmente ele precisa ficar sem jogar no hotel. Com os alimentos, ele pode comer algo pra revitalizar tanto a mana quanto a vida

- Cansaço: O usuário possui um status de cansaço. Ir em uma dungeon cansa bastante, enquanto viagens também. Quanto mais cansado o usuário está, pior é o resultado dele em batalhas. Por exemplo, um usuário cansado possui a velocidade de movimento e as chances de acertos menores. Para revitalizar o cansaço, o usuário deve descansar em um hotel ou em uma de suas casas

• **Casas**

- Será possível comprar/alugar casas em localizações. Inicialmente as casas servem somente para descansar e guardar grandes quantidades de itens. O jogador pode comprar, por exemplo, uma casa na sua terra natal, e uma casa na região mais longe dele, assim quando ele ir pra aquela regiao, ele pode descansar da longa viagem, e também guardar itens de seus drops sem precisar gastar com hotel

- Casas de Clã: Um clã pode comprar uma casa para habitar seus membros. A casa de clã possui um limite de membros, e para aumentar esse limite, o dono do clã deve pagar mais para aumentar a casa

• Clã

- Usuários poderão criar clãs gastando pedras mágicas. Para poder criar um clã precisa estar certo nível, e depois que o clã é criado, o dono pode convidar pessoas para entrar no clã.

- Top Clãs, onde haverão todos os clãs existentes divididos por membros e força

- Guerra de Clãs: Clãs poderão abrir guerras entre si, essas guerras valerá dinheiro do clã, e todos os usuários batalharão contra todos.

- Grandes Clãs: Além de clãs entre os membros dos servidores, haverão os Grandes Clãs, que serão clãs que uma pessoa cria e MUITAS pessoas entram, por exemplo, eu crio um clã, e vou invitando pessoas até o clã ficar gigante e disputar entre os maiores clãs.

- O dono do clã só pode convidar usuários que ele tenha um nível de amizade

• Amizade

- Ao participar de eventos e parties, os usuários criarão amizades entre si. Quanto maior o nível de amizade, mais coisas poderão fazer juntos, como troca de itens.

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

#### Ceifador

**Descrição -** Ceifador será uma classe dividida em 3 subclasses. Um assassino sombrio que necessita de almas para continuar vagando pelas terras sem ter que voltar de onde sairam, o inferno.

**Armas Disponíveis -** Foiçe, maça, corrente, mangual e grimório.

**Armaduras Disponíveis -** Somente leves

**Estilo de Habilidades -** Dano foco, cegueiras e vampirismo

**Atributos:**

- Os ceifadores são mestres de matar, possuem baixa defesa, mas muita vida, que fora roubada de suas vítimas.
- Tem velocidade mediana, já que andam sobrevoando carregando suas armas longas e pesadas.

**Especial -** Os ceifadores possuem um atributo especial, eles podem se subdividir em 3 tipos.
Ao entrar no mundo, o ceifador é apenas um ceifador, mas ele pode se tornar um: `Ceifador Das Trevas`, que busca matar aqueles que não aceitam morrer (disponível ao matar um player em PvP), `Ceifador Errantes`, buscam somente matar aqueles que devem morrer para a sua própria sobrevivência (disponível ao completar uma quest do tipo `longa` na guilda) e por fim, o `Ceifador Deplorável`, que se arrepende de ter assinado o contrato como ceifador, e se nega a seguir as ordes do mal (disponível ao fugir da dungeon).
