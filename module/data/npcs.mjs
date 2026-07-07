/** Entradas de compêndio — NPCs pré-prontos para o Mestre. */

import { buildNpcSystem } from "./npc-builder.mjs";

export const NPCS = [
  {
    name: "Supervisor NEST",
    img: "icons/svg/castle.svg",
    system: buildNpcSystem(
      { for: 2, agi: 3, res: 3, men: 4, per: 3, pre: 2, int: 4 },
      {
        insect: "Libélula",
        faction: "NEST",
        origin: "<p>Membro veterano da NEST. Supervisiona novos recrutas e avalia lealdade.</p>",
        motivation: "<p>Manter a organização intacta — e decidir quem merece saber mais.</p>",
        abilities: [
          {
            name: "Visão Composta",
            type: "passiva",
            desc: "Percepção ampliada em 360°. Vantagem narrativa em vigilância.",
            weakness: "Luz estroboscópica causa desorientação.",
            damage: "",
          },
          {
            name: "Pulso de Alerta",
            type: "ativa_l",
            desc: "Emite sinal químico que alerta aliados NEST próximos.",
            weakness: "Revela posição a quem detecta feromônios.",
            damage: "",
          },
        ],
        items: [
          { name: "Comunicador criptografado", tier: "2", desc: "Canal seguro com a base NEST." },
          { name: "", tier: "1", desc: "" },
        ],
      }
    ),
  },
  {
    name: "Operador de Campo NEST",
    img: "icons/svg/sword.svg",
    system: buildNpcSystem(
      { for: 4, agi: 4, res: 3, men: 2, per: 3, pre: 3, int: 1 },
      {
        insect: "Besouro",
        faction: "NEST",
        origin: "<p>Agente de campo treinado para contenção e resgate de infectados.</p>",
        motivation: "<p>Proteger os novatos — mesmo que isso signifique sujar as mãos.</p>",
        abilities: [
          {
            name: "Carapaça Reflexa",
            type: "passiva",
            desc: "Exoesqueleto parcial endurece ao receber impacto.",
            weakness: "Articular exposto nas juntas.",
            damage: "",
          },
          {
            name: "Investida Blindada",
            type: "ativa_f",
            desc: "Corpo inteiro vira projétil. Dano contundente pesado.",
            weakness: "Imobilizado por 1 turno após uso.",
            damage: "1d8",
          },
        ],
        items: [
          { name: "Colete reforçado", tier: "2", desc: "+1d6 em contenção física." },
          { name: "Kit de primeiros socorros", tier: "1", desc: "Estabiliza feridos." },
        ],
      }
    ),
  },
  {
    name: "Caçador Pet Shop",
    img: "icons/svg/skull.svg",
    system: buildNpcSystem(
      { for: 3, agi: 5, res: 2, men: 2, per: 4, pre: 4, int: 1 },
      {
        insect: "Aranha",
        faction: "Pet Shop",
        insanity: 35,
        origin: "<p>Capturador de elite da Pet Shop. Especialista em rastrear e imobilizar infectados.</p>",
        motivation: "<p>Entregar espécimes vivos ao laboratório — quanto mais intactos, melhor.</p>",
        abilities: [
          {
            name: "Teia de Contenção",
            type: "ativa_l",
            desc: "Imobiliza alvo em alcance curto.",
            weakness: "Fogo destrói a teia instantaneamente.",
            damage: "",
          },
          {
            name: "Mordida Paralisante",
            type: "ativa_f",
            desc: "Veneno neuromuscular temporário.",
            weakness: "Precisa estar colado ao alvo — vulnerável a contra-ataque.",
            damage: "1d6",
          },
        ],
        items: [
          { name: "Seringa de sedação", tier: "2", desc: "CD 14 RES ou inconsciente por 1 cena." },
          { name: "Grilhões reforçados", tier: "1", desc: "Contenção de infectados." },
        ],
      }
    ),
  },
  {
    name: "Vagabundo Stray Dogs",
    img: "icons/svg/wolf.svg",
    system: buildNpcSystem(
      { for: 3, agi: 4, res: 3, men: 3, per: 3, pre: 3, int: 2 },
      {
        insect: "Rato",
        faction: "Stray Dogs",
        insanity: 45,
        origin: "<p>Infectado independente. Sobrevive nas margens, ataca a Pet Shop quando pode.</p>",
        motivation: "<p>Não confia em ninguém — mas odeia a Pet Shop mais do que qualquer facção.</p>",
        abilities: [
          {
            name: "Instinto de Esgoto",
            type: "passiva",
            desc: "Conhece rotas secretas da cidade. Fuga fácil em ambientes urbanos.",
            weakness: "Espacos abertos o deixam exposto.",
            damage: "",
          },
          {
            name: "Enxame Improvisado",
            type: "especial",
            desc: "Chama outros Stray Dogs próximos para emboscada.",
            weakness: "Só funciona em território conhecido.",
            damage: "1d6",
          },
        ],
        items: [
          { name: "Faca enferrujada", tier: "1", desc: "Arma improvisada." },
          { name: "Rádio quebrado", tier: "1", desc: "Às vezes capta frequências da Pet Shop." },
        ],
      }
    ),
  },
  {
    name: "Fantasma Hollow",
    img: "icons/svg/ghost.svg",
    system: buildNpcSystem(
      { for: 1, agi: 3, res: 2, men: 5, per: 4, pre: 2, int: 4 },
      {
        insect: "Camaleão",
        faction: "Hollow",
        insanity: 15,
        origin: "<p>Suprimiu quase todo o Complex. Vive como humano comum — ou tenta.</p>",
        motivation: "<p>Esquecer o que foi. Nunca mais ser encontrado.</p>",
        abilities: [
          {
            name: "Camuflagem Perfeita",
            type: "passiva",
            desc: "Quase invisível quando imóvel. CD 16 PER para detectar.",
            weakness: "Movimento rápido quebra o efeito.",
            damage: "",
          },
        ],
        items: [
          { name: "Identidade falsa", tier: "2", desc: "Documentos de outra pessoa." },
          { name: "", tier: "1", desc: "" },
        ],
      }
    ),
  },
  {
    name: "Instigador The Swarm",
    img: "icons/svg/hazard.svg",
    system: buildNpcSystem(
      { for: 2, agi: 2, res: 2, men: 3, per: 3, pre: 2, int: 5 },
      {
        insect: "Vespa",
        faction: "The Swarm",
        insanity: 20,
        origin: "<p>Membro ideológico anti-infectado. Atua dentro de instituições públicas.</p>",
        motivation: "<p>Expor e eliminar infectados antes que 'contaminem' a sociedade.</p>",
        abilities: [
          {
            name: "Discurso Venenoso",
            type: "ativa_l",
            desc: "Manipula opinião pública contra um alvo infectado.",
            weakness: "Ineficaz contra quem já conhece a verdade.",
            damage: "",
          },
        ],
        items: [
          { name: "Crachá institucional", tier: "2", desc: "Acesso a locais restritos." },
          { name: "Gravador oculto", tier: "1", desc: "Coleta provas comprometedoras." },
        ],
      }
    ),
  },
  {
    name: "Pesquisador Prometheus",
    img: "icons/svg/tech.svg",
    system: buildNpcSystem(
      { for: 1, agi: 2, res: 2, men: 5, per: 4, pre: 2, int: 6 },
      {
        insect: "Formiga",
        faction: "Prometheus",
        insanity: 55,
        origin: "<p>Cientista que estuda o Jungle Juice há décadas. Sabe mais do que admite.</p>",
        motivation: "<p>Entender a substância — independente do custo humano.</p>",
        abilities: [
          {
            name: "Análise Química",
            type: "passiva",
            desc: "Identifica traços de Jungle Juice e derivados.",
            weakness: "Precisa de amostra física.",
            damage: "",
          },
          {
            name: "Estímulo de Manifestação",
            type: "especial",
            desc: "Força reação do Complex em um infectado (teste MEN vs CD 16).",
            weakness: "Pode causar Runaway involuntário.",
            damage: "",
          },
        ],
        items: [
          { name: "Kit de laboratório portátil", tier: "3", desc: "Análise de amostras biológicas." },
          { name: "Amostra de Jungle Juice", tier: "3", desc: "Frasco selado — perigoso." },
        ],
      }
    ),
  },
  {
    name: "Informante The Web",
    img: "icons/svg/spider.svg",
    system: buildNpcSystem(
      { for: 1, agi: 3, res: 2, men: 4, per: 5, pre: 2, int: 5 },
      {
        insect: "Aranha",
        faction: "The Web",
        insanity: 30,
        origin: "<p>Corretor de informações. Vende segredos para quem paga — ou para quem ameaça.</p>",
        motivation: "<p>Saber tudo. Vender o que importa. Sobreviver no meio.</p>",
        abilities: [
          {
            name: "Rede de Contatos",
            type: "passiva",
            desc: "Sabe onde encontrar informação sobre qualquer facção (por um preço).",
            weakness: "Informação pode estar desatualizada ou ser isca.",
            damage: "",
          },
        ],
        items: [
          { name: "Drive criptografado", tier: "3", desc: "Banco de dados de segredos." },
          { name: "Cartões de visita falsos", tier: "1", desc: "Identidades descartáveis." },
        ],
      }
    ),
  },
  {
    name: "Recrutador Blackmoth",
    img: "icons/svg/military.svg",
    system: buildNpcSystem(
      { for: 4, agi: 3, res: 4, men: 3, per: 3, pre: 3, int: 2 },
      {
        insect: "Louva-a-deus",
        faction: "Blackmoth",
        insanity: 40,
        origin: "<p>Agente militar que recruta infectados para operações classificadas do governo.</p>",
        motivation: "<p>Usar o Complex como arma — patriotismo ou fanatismo, depende de quem pergunta.</p>",
        abilities: [
          {
            name: "Golpe Preciso",
            type: "ativa_f",
            desc: "Ataque cirúrgico com garras modificadas.",
            weakness: "Exige imobilidade total antes do golpe.",
            damage: "1d8",
          },
          {
            name: "Disciplina de Combate",
            type: "passiva",
            desc: "Imune a efeitos de medo em combate.",
            weakness: "Não funciona fora de contexto de combate.",
            damage: "",
          },
        ],
        items: [
          { name: "Uniforme Blackmoth", tier: "2", desc: "Credencial governamental falsa ou real." },
          { name: "Pistola silenciada", tier: "2", desc: "+1d6 à distância." },
        ],
      }
    ),
  },
  {
    name: "Infectado em Colapso",
    img: "icons/svg/explosion.svg",
    system: buildNpcSystem(
      { for: 5, agi: 3, res: 4, men: 1, per: 2, pre: 3, int: 0 },
      {
        insect: "Escorpião",
        faction: "NEST",
        insanity: 100,
        origin: "<p>Infectado que perdeu o controle. Complex Runaway iminente ou ativo.</p>",
        motivation: "<p>Não há motivação consciente — o inseto fala mais alto.</p>",
        extraWeaknesses: 1,
        abilities: [
          {
            name: "Ferrão Descontrolado",
            type: "especial",
            desc: "Ataque venenoso indiscriminado. +15 ins por uso.",
            weakness: "Corpo humano não aguenta a toxicidade — perde HP também.",
            damage: "2d6",
          },
          {
            name: "Instinto de Caça",
            type: "passiva",
            desc: "Ataca o alvo mais próximo sem distinção.",
            weakness: "Luz forte causa hesitação momentânea.",
            damage: "",
          },
        ],
        runaway: { unlocked: true, active: true },
      }
    ),
  },
];
