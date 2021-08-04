import { IMobsFile } from '@utils/Types';

const mobs: IMobsFile = {
  inicial: [
    {
      loots: [
        {
          name: 'Olho de Aranha',
          value: 3,
        },
      ],
      ataques: [
        {
          name: 'Lançar Teia',
          damage: 20,
        },
        {
          name: 'Mordida Venenosa',
          damage: 25,
        },
      ],
      type: 'inicial',
      name: 'Aranha Venenosa',
      life: 30,
      damage: '20 - 25',
      armor: 12,
      xp: 10,
      dgLevel: 1,
    },
    {
      loots: [
        {
          name: 'Pele de Goblin',
          value: 3,
        },
      ],
      ataques: [
        {
          name: 'Facada',
          damage: 13,
        },
        {
          name: 'Investida Globlineana',
          damage: 17,
        },
      ],
      type: 'inicial',
      name: 'Goblin',
      life: 35,
      damage: '13 - 17',
      armor: 7,
      xp: 15,
      dgLevel: 1,
    },
    {
      loots: [
        {
          name: 'Perna de Formiga',
          value: 3,
        },
      ],
      ataques: [
        {
          name: 'Mordida',
          damage: 10,
        },
        {
          name: 'Corrida',
          damage: 18,
        },
      ],
      type: 'inicial',
      name: 'Formiga Gigante',
      life: 50,
      damage: '10 - 18',
      armor: 5,
      xp: 20,
      dgLevel: 1,
    },
    {
      loots: [
        {
          name: 'Pele de Lobo',
          value: 3,
        },
      ],
      ataques: [
        {
          name: 'Mordida do Lobo',
          damage: 10,
        },
        {
          name: 'Investida Frenética',
          damage: 20,
        },
      ],
      type: 'inicial',
      name: 'Lobo infernal',
      life: 60,
      damage: '10 - 20',
      armor: 2,
      xp: 20,
      dgLevel: 1,
    },
    {
      loots: [
        {
          name: 'Gosma',
          value: 4,
        },
      ],
      ataques: [
        {
          name: 'Mordida Melequenta',
          damage: 5,
        },
        {
          name: 'Chuva de Gosma',
          damage: 7,
        },
      ],
      type: 'inicial',
      name: 'Slime',
      life: 50,
      damage: '5 - 7',
      armor: 10,
      xp: 15,
      dgLevel: 1,
    },
    {
      loots: [
        {
          name: 'Carne de zumbi',
          value: 3,
        },
      ],
      ataques: [
        {
          name: 'Mordida Do Zumbi',
          damage: 7,
        },
        {
          name: 'Tapa do Morto-Vivo',
          damage: 10,
        },
      ],
      type: 'inicial',
      name: 'Zumbi',
      life: 60,
      damage: '7 - 10',
      armor: 0,
      xp: 14,
      dgLevel: 1,
    },
    {
      loots: [
        {
          name: 'Escamas Frágeis',
          value: 7,
        },
        {
          name: 'Dentes de MiniDragão',
          value: 7,
        },
        {
          name: 'Asa Pequena',
          value: 8,
        },
      ],
      ataques: [
        {
          name: 'Cuspida Fumegante',
          damage: 20,
        },
        {
          name: 'FogoFoco',
          damage: 18,
        },
      ],
      type: 'inicial',
      name: 'Mini Dragão',
      life: 30,
      damage: '18 - 20',
      armor: 10,
      xp: 30,
      dgLevel: 1,
    },
    {
      type: 'inicial',
      name: 'Escorpião',
      life: 30,
      damage: '12 - 15',
      armor: 12,
      xp: 39,
      dgLevel: 1,
      loots: [
        {
          name: 'Ferrão',
          value: 3,
        },
        {
          name: 'Garras de Escorpião',
          value: 2,
        },
      ],
      ataques: [
        {
          name: 'Ferroada Venenosa',
          damage: 12,
        },
        {
          name: 'Ferroada Fervente',
          damage: 15,
        },
      ],
    },
  ],
  medio: [
    {
      loots: [
        {
          name: 'Pele grudenta',
          value: 18,
        },
        {
          name: 'Meleca lamazenta',
          value: 17,
        },
        {
          name: 'Olhos humanos',
          value: 16,
        },
      ],
      ataques: [
        {
          name: 'Mordida Amedrontadora',
          damage: 31,
        },
        {
          name: 'Maldição',
          damage: 35,
        },
        {
          name: 'Morte Certa',
          damage: 37,
        },
      ],
      type: 'medio',
      name: 'Aberração',
      life: 100,
      damage: '31 - 37',
      armor: 12,
      xp: 130,
      dgLevel: 2,
    },
    {
      loots: [
        {
          name: 'Verruga fedida',
          value: 11,
        },
        {
          name: 'Cajado velho',
          value: 18,
        },
        {
          name: 'Chapéu da bruxa',
          value: 15,
        },
        {
          name: 'Frasco de Poção vazio',
          value: 5,
        },
      ],
      ataques: [
        {
          name: 'Poção Venenosa',
          damage: 37,
        },
        {
          name: 'Invocação Malígna',
          damage: 40,
        },
        {
          name: 'Bola de Fogo',
          damage: 35,
        },
      ],
      type: 'medio',
      name: 'Bruxa Enverrugada',
      life: 100,
      damage: '35 - 40',
      armor: 12,
      xp: 112,
      dgLevel: 2,
    },
    {
      loots: [
        {
          name: 'Crânio desconhecido',
          value: 15,
        },
      ],
      ataques: [
        {
          name: 'Batida de Cabeça',
          damage: 34,
        },
        {
          name: "Mordida 'U'craniana",
          damage: 37,
        },
      ],
      type: 'medio',
      name: 'Crânio assombrado',
      life: 100,
      damage: '34 - 37',
      armor: 12,
      xp: 70,
      dgLevel: 2,
    },
    {
      loots: [
        {
          name: 'Dente de Vampiro',
          value: 23,
        },
        {
          name: 'Capa de Vampiro',
          value: 18,
        },
      ],
      ataques: [
        {
          name: 'Mordida Jugularística',
          damage: 37,
        },
        {
          name: 'Goa!',
          damage: 40,
        },
      ],
      type: 'medio',
      name: 'Drácula',
      life: 120,
      damage: '37 - 40',
      armor: 15,
      xp: 130,
      dgLevel: 2,
    },
    {
      loots: [
        {
          name: 'Cabeça do Goblin Xamã',
          value: 29,
        },
        {
          name: 'Cajado Ancestral',
          value: 18,
        },
        {
          name: 'Verrugas Nojentas',
          value: 10,
        },
      ],
      ataques: [
        {
          name: 'Invocar Goblins',
          damage: 55,
        },
        {
          name: 'Técnica do Xamã',
          damage: 57,
        },
        {
          name: 'Chuva de Lava',
          damage: 50,
        },
      ],
      type: 'medio',
      name: 'Goblin Xamã',
      life: 150,
      damage: '50 - 57',
      armor: 0,
      xp: 258,
      dgLevel: 2,
    },
    {
      loots: [
        {
          name: 'Varinha desconhecida',
          value: 25,
        },
        {
          name: 'Restos de pele',
          value: 18,
        },
        {
          name: 'Pó estranho',
          value: 20,
        },
      ],
      ataques: [
        {
          name: 'Buraco Negro Elementar',
          damage: 57,
        },
        {
          name: 'Maldição Eterna',
          damage: 60,
        },
        {
          name: 'Cristais de Gelo',
          damage: 62,
        },
      ],
      type: 'medio',
      name: 'Feiticeiro',
      life: 200,
      damage: '57 - 62',
      armor: 2,
      xp: 300,
      dgLevel: 2,
    },
    {
      loots: [
        {
          name: 'Metal Enferrujado',
          value: 15,
        },
        {
          name: 'Cabeça de Golem',
          value: 20,
        },
      ],
      ataques: [
        {
          name: 'Soco',
          damage: 34,
        },
        {
          name: 'Salto Indomável',
          damage: 37,
        },
      ],
      type: 'medio',
      name: 'Golem enferrujado',
      life: 350,
      damage: '34 - 37',
      armor: 1,
      xp: 280,
      dgLevel: 2,
    },
  ],
  hard: [
    {
      loots: [
        {
          name: 'Escama',
          value: 57,
        },
        {
          name: 'Bolsa de Veneno',
          value: 50,
        },
        {
          name: 'Presas',
          value: 65,
        },
      ],
      ataques: [
        {
          name: 'Mordida Venenosa',
          damage: 53,
        },
        {
          name: 'Enforcamento',
          damage: 57,
        },
      ],
      type: 'hard',
      name: 'Piton Gigante',
      life: 340,
      damage: '53 - 57',
      armor: 31,
      xp: 3500,
      dgLevel: 3,
    },
    {
      loots: [
        {
          name: 'Pele de Lobisomem',
          value: 68,
        },
        {
          name: 'Presas de Lobisomem',
          value: 60,
        },
      ],
      ataques: [
        {
          name: 'Ferocidade',
          damage: 50,
        },
        {
          name: 'Garradas!',
          damage: 53,
        },
        {
          name: 'Uivo Mortal',
          damage: 59,
        },
      ],
      type: 'hard',
      name: 'Lobisomem',
      life: 400,
      damage: '50 - 59',
      armor: 51,
      xp: 3400,
      dgLevel: 3,
    },
    {
      loots: [
        {
          name: 'Cabeça de Minotauro',
          value: 70,
        },
        {
          name: 'Chifre de Minotauro',
          value: 57,
        },
      ],
      ataques: [
        {
          name: 'Investida',
          damage: 60,
        },
        {
          name: 'UUUAAARRR',
          damage: 65,
        },
        {
          name: 'Soco Sagaz',
          damage: 56,
        },
      ],
      type: 'hard',
      name: 'Minotauro',
      life: 600,
      damage: '56 - 65',
      armor: 45,
      xp: 8400,
      dgLevel: 3,
    },
    {
      loots: [
        {
          name: 'Cabeça da Medusa',
          value: 64,
        },
        {
          name: 'Pele de cobra',
          value: 69,
        },
        {
          name: 'Vestes da Medusa',
          value: 60,
        },
        {
          name: 'Presas de cobra',
          value: 57,
        },
      ],
      ataques: [
        {
          name: 'Petrificar',
          damage: 68,
        },
        {
          name: 'Miasma',
          damage: 70,
        },
        {
          name: 'Garras Mortais',
          damage: 65,
        },
      ],
      type: 'hard',
      name: 'Medusa',
      life: 100,
      damage: '65 - 70',
      armor: 64,
      xp: 5809,
      dgLevel: 3,
    },
    {
      loots: [
        {
          name: 'Cabeça do Goblin Campeão',
          value: 50,
        },
        {
          name: 'Armadura do Goblin Campeão',
          value: 70,
        },
        {
          name: 'Perna do Goblin Campeão',
          value: 90,
        },
      ],
      ataques: [
        {
          name: 'Show Time',
          damage: 69,
        },
        {
          name: "'Toque Suave'",
          damage: 72,
        },
      ],
      type: 'hard',
      name: 'Goblin Campeão',
      life: 470,
      damage: '69 - 72',
      armor: 61,
      xp: 6070,
      dgLevel: 3,
    },
  ],
  impossible: [
    {
      loots: [
        {
          name: 'Cabeça de Minotauro',
          value: 100,
        },
        {
          name: 'Chifre de Minotauro',
          value: 86,
        },
      ],
      ataques: [
        {
          name: 'Minotauro, avante!',
          damage: 85,
        },
        {
          name: 'Punhos de Aço',
          damage: 87,
        },
        {
          name: 'Morte Certa',
          damage: 92,
        },
      ],
      type: 'impossible',
      name: 'Deus dos Minotauros',
      life: 750,
      damage: '85 - 92',
      armor: 45,
      xp: 24500,
      dgLevel: 4,
    },
    {
      loots: [
        {
          name: 'Pele de Lobisomem',
          value: 98,
        },
        {
          name: 'Presas de Lobisomem',
          value: 78,
        },
      ],
      ataques: [
        {
          name: 'Uivo Feroz',
          damage: 94,
        },
        {
          name: 'Avanço da Matilha',
          damage: 92,
        },
        {
          name: 'Mordida Infernal',
          damage: 100,
        },
      ],
      type: 'impossible',
      name: 'Lobisomem do Inferno',
      life: 600,
      damage: '92 - 100',
      armor: 47,
      xp: 20111,
      dgLevel: 4,
    },
    {
      loots: [
        {
          name: 'Portal para o Inferno',
          value: 350,
        },
      ],
      ataques: [
        {
          name: 'Ceifação',
          damage: 120,
        },
        {
          name: 'Foice Defeituosa Tortona Pra Esquerda',
          damage: 125,
        },
        {
          name: 'Execução Final',
          damage: 131,
        },
      ],
      type: 'impossible',
      name: 'Malthael',
      life: 800,
      damage: '120 - 131',
      armor: 70,
      xp: 38666,
      dgLevel: 4,
    },
    {
      loots: [
        {
          name: 'Escama de Kraken',
          value: 150,
        },
      ],
      ataques: [
        {
          name: 'Nascer, KRAKEN',
          damage: 99,
        },
        {
          name: 'Ancestral de Poseidon',
          damage: 112,
        },
      ],
      type: 'impossible',
      name: 'Kraken',
      life: 640,
      damage: '99 - 112',
      armor: 31,
      xp: 27500,
      dgLevel: 4,
    },
    {
      loots: [
        {
          name: 'Asas de Vouivre',
          value: 98,
        },
        {
          name: 'Garras de Vouivre',
          value: 120,
        },
      ],
      ataques: [
        {
          name: 'Garras',
          damage: 100,
        },
        {
          name: 'Investida Razante',
          damage: 121,
        },
        {
          name: 'Pulsos Magnéticos',
          damage: 130,
        },
      ],
      type: 'impossible',
      name: 'Vouivre',
      life: 680,
      damage: '100 - 130',
      armor: 50,
      xp: 26420,
      dgLevel: 4,
    },
  ],
  boss: [
    {
      loots: [
        {
          name: 'Harpa de Apolo',
          value: 760,
        },
        {
          name: 'Carruagem de Apolo',
          value: 880,
        },
      ],
      ataques: [
        {
          name: 'Notas Mortais',
          damage: 160,
        },
        {
          name: 'Avanço da Carruagem',
          damage: 200,
        },
        {
          name: 'Tiros Certeiros',
          damage: 180,
        },
      ],
      type: 'Boss',
      name: 'Apolo',
      life: 1000,
      damage: '160 - 200',
      armor: 150,
      xp: 50000,
    },
    {
      loots: [
        {
          name: 'Lâmina de Loki',
          value: 1000,
        },
        {
          name: 'Capa de Loki',
          value: 680,
        },
      ],
      ataques: [
        {
          name: 'Ataque Traiçoeiro',
          damage: 186,
        },
        {
          name: 'Facada Crírtica',
          damage: 230,
        },
        {
          name: 'Clone',
          damage: 190,
        },
        {
          name: 'Escuridão',
          damage: 170,
        },
      ],
      type: 'Boss',
      name: 'Loki',
      life: 700,
      damage: '170 - 230',
      armor: 260,
      xp: 35000,
    },
    {
      loots: [
        {
          name: 'Vinho de Soma',
          value: 1000,
        },
        {
          name: 'Taco de Soma',
          value: 1400,
        },
      ],
      ataques: [
        {
          name: 'Embriaguez Total',
          damage: 200,
        },
        {
          name: 'Porrete',
          damage: 220,
        },
      ],
      type: 'Boss',
      name: 'Soma',
      life: 1000,
      damage: '200 - 220',
      armor: 324,
      xp: 35000,
    },
    {
      loots: [
        {
          name: 'Espada de Freya',
          value: 1350,
        },
        {
          name: 'Anel de Freya',
          value: 1100,
        },
      ],
      ataques: [
        {
          name: 'Pulsos de Plasma',
          damage: 178,
        },
        {
          name: 'Encantamento',
          damage: 215,
        },
        {
          name: 'Anel Amaldiçoado',
          damage: 199,
        },
      ],
      type: 'Boss',
      name: 'Freya',
      life: 840,
      damage: '178 - 215',
      armor: 340,
      xp: 45000,
    },
    {
      loots: [
        {
          name: 'Correntes de Ares',
          value: 988,
        },
        {
          name: 'Escudo de Ares',
          value: 1450,
        },
      ],
      ataques: [
        {
          name: 'Correntes de Guerra',
          damage: 150,
        },
        {
          name: 'Escudo de Fogo',
          damage: 200,
        },
        {
          name: 'Eu te tenho agora!',
          damage: 171,
        },
      ],
      type: 'Boss',
      name: 'Ares',
      life: 1800,
      damage: '150 - 200',
      armor: 210,
      xp: 60000,
    },
  ],
  gods: [
    {
      loots: [
        {
          name: 'Bastão desnecessariamente Grande',
          value: 1250,
        },
        {
          name: 'Capuz da Morte de Rabadon',
          value: 2800,
        },
      ],
      ataques: [
        {
          name: 'Horizonte de Eventos',
          damage: 360,
        },
        {
          name: 'Matéria Escura',
          damage: 400,
        },
        {
          name: 'Explosão primordial',
          damage: 490,
        },
      ],
      type: 'God',
      name: 'Veigar of Boleham',
      life: 1600,
      damage: '360 - 490',
      armor: 210,
      xp: 100666,
    },
    {
      loots: [
        {
          name: 'Gravitum',
          value: 1680,
        },
        {
          name: 'Infernum',
          value: 2400,
        },
      ],
      ataques: [
        {
          name: 'Vigía do Plenilúnio',
          damage: 430,
        },
        {
          name: 'Projeção de Alune',
          damage: 460,
        },
      ],
      type: 'God',
      name: 'Aphelios dos Lunari',
      life: 1300,
      damage: '430 - 460',
      armor: 230,
      xp: 120000,
    },
  ],
  evolved: [
    {
      loots: [
        {
          name: 'Carne Podre',
          value: 1000,
        },
        {
          name: 'Pepita de Ouro',
          value: 3000,
        },
      ],
      ataques: [
        {
          name: 'Mordida Fatal',
          damage: 560,
        },
      ],
      type: 'Evolved',
      name: 'Piglin Zumbi',
      life: 2000,
      damage: '560',
      armor: 300,
      xp: 170000,
      dgLevel: 5,
    },
    {
      loots: [
        {
          name: 'Berga',
          value: 2180,
        },
        {
          name: 'Aipim',
          value: 3000,
        },
      ],
      ataques: [
        {
          name: 'Não é biscoito, é bolacha!',
          damage: 560,
        },
        {
          name: 'Te tirei os butiá dos bolso',
          damage: 670,
        },
      ],
      type: 'Evolved',
      name: 'PãoTeonTchê',
      life: 2000,
      damage: '560 - 670',
      armor: 320,
      xp: 150000,
      dgLevel: 5,
    },
  ],
  universal: [
    {
      loots: [
        {
          name: 'Bastão de Luz',
          value: 3200,
        },
      ],
      ataques: [
        {
          name: 'Centelha Final',
          damage: 560,
        },
        {
          name: 'Brilho Extremo',
          damage: 575,
        },
      ],
      type: 'Universal',
      name: 'Luxanna Crownguard',
      life: 1700,
      damage: '560 - 575',
      armor: 240,
      xp: 120000,
    },
    {
      loots: [
        {
          name: 'Cacetinho',
          value: 2702,
        },
        {
          name: 'Chimarrão',
          value: 3500,
        },
      ],
      ataques: [
        {
          name: 'Tiro bem Bagual',
          damage: 670,
        },
        {
          name: 'm!kill @você',
          damage: 700,
        },
      ],
      type: 'Universal',
      name: 'Menhera Bot',
      life: 2000,
      damage: '670 - 700',
      armor: 200,
      xp: 150000,
    },
  ],
};

export default mobs;
