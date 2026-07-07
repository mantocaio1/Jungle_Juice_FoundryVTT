import { buildNpcSystem } from "./npc-builder.mjs";

/** Entradas de compêndio — Bestiário (ameaças de combate genéricas). */

export const BESTIARY = [
  {
    name: "Infectado Selvagem (Fraco)",
    img: "icons/svg/rat.svg",
    threat: "fraco",
    system: buildNpcSystem(
      { for: 2, agi: 3, res: 2, men: 1, per: 2, pre: 2, int: 0 },
      {
        insect: "Rato",
        faction: "Stray Dogs",
        insanity: 25,
        origin: "<p>Infectado recente, sem facção. Ataca por instinto ou desespero.</p>",
        motivation: "<p>Sobreviver — ou eliminar o que parece ameaça.</p>",
        abilities: [
          {
            name: "Mordida Desesperada",
            type: "ativa_l",
            desc: "Ataque rápido com dentes reforçados.",
            weakness: "Recuo se receber dano antes de atacar.",
            damage: "1d4",
          },
        ],
        items: [{ name: "", tier: "1", desc: "" }, { name: "", tier: "1", desc: "" }],
      }
    ),
  },
  {
    name: "Infectado Descontrolado (Médio)",
    img: "icons/svg/acid.svg",
    threat: "medio",
    system: buildNpcSystem(
      { for: 3, agi: 4, res: 3, men: 1, per: 2, pre: 3, int: 0 },
      {
        insect: "Louva-a-deus",
        faction: "NEST",
        insanity: 55,
        origin: "<p>Complex instável. Alterna entre pânico humano e fúria do inseto.</p>",
        motivation: "<p>Nenhuma — reage ao ambiente.</p>",
        abilities: [
          {
            name: "Garras em Fúria",
            type: "ativa_f",
            desc: "Sequência de golpes descontrolados.",
            weakness: "Deixa flancos abertos após a sequência.",
            damage: "1d8",
          },
          {
            name: "Reflexos de Predador",
            type: "passiva",
            desc: "Ataca primeiro quem se aproxima de repente.",
            weakness: "Ignora aliados e táticas.",
            damage: "",
          },
        ],
      }
    ),
  },
  {
    name: "Libélula Feral (Médio)",
    img: "icons/svg/wing.svg",
    threat: "medio",
    system: buildNpcSystem(
      { for: 2, agi: 5, res: 2, men: 1, per: 4, pre: 3, int: 0 },
      {
        insect: "Libélula",
        faction: "NEST",
        insanity: 30,
        origin: "<p>Skirmisher aéreo. Golpeia e recua antes de fechar combate.</p>",
        motivation: "<p>Caçar movimento rápido — fixa em alvos em fuga.</p>",
        abilities: [
          {
            name: "Picada Aérea",
            type: "ativa_l",
            desc: "Mergulho e ataque antes de subir novamente.",
            weakness: "Vulnerável quando pousa.",
            damage: "1d6",
          },
        ],
        items: [{ name: "", tier: "1", desc: "" }, { name: "", tier: "1", desc: "" }],
      }
    ),
  },
  {
    name: "Escorpião Mutante (Forte)",
    img: "icons/svg/toxin.svg",
    threat: "forte",
    system: buildNpcSystem(
      { for: 4, agi: 2, res: 5, men: 1, per: 2, pre: 3, int: 0 },
      {
        insect: "Escorpião",
        faction: "Pet Shop",
        insanity: 45,
        origin: "<p>Espécime alterado — possível origem em laboratório da Pet Shop.</p>",
        motivation: "<p>Eliminar ameaças e proteger território.</p>",
        abilities: [
          {
            name: "Ferrão Venenoso",
            type: "ativa_f",
            desc: "Veneno paralisante. Alvo Envenenado em acerto.",
            weakness: "Ferrão quebrado se errar dois ataques seguidos.",
            damage: "1d8",
          },
          {
            name: "Carapaça Espessa",
            type: "passiva",
            desc: "Reduz dano contundente narrativamente.",
            weakness: "Fogo ignora a carapaça.",
            damage: "",
          },
        ],
      }
    ),
  },
  {
    name: "Caçador Pet Shop (Elite)",
    img: "icons/svg/skull.svg",
    threat: "elite",
    system: buildNpcSystem(
      { for: 3, agi: 5, res: 3, men: 2, per: 4, pre: 4, int: 1 },
      {
        insect: "Aranha",
        faction: "Pet Shop",
        insanity: 35,
        origin: "<p>Equipe de captura. Prioriza imobilizar e extrair vivos.</p>",
        motivation: "<p>Entregar espécimes intactos ao laboratório.</p>",
        abilities: [
          {
            name: "Teia de Contenção",
            type: "ativa_l",
            desc: "Imobiliza alvo em alcance curto.",
            weakness: "Fogo destrói a teia.",
            damage: "",
          },
          {
            name: "Mordida Paralisante",
            type: "ativa_f",
            desc: "Veneno neuromuscular temporário.",
            weakness: "Precisa estar colado ao alvo.",
            damage: "1d6",
          },
        ],
        items: [
          { name: "Seringa de sedação", tier: "2", desc: "CD 14 RES ou inconsciente." },
          { name: "Grilhões reforçados", tier: "1", desc: "Contenção de infectados." },
        ],
      }
    ),
  },
  {
    name: "Enxame de Insetos (Horde)",
    img: "icons/svg/bees.svg",
    threat: "medio",
    system: buildNpcSystem(
      { for: 1, agi: 4, res: 2, men: 0, per: 3, pre: 2, int: 0 },
      {
        insect: "Formiga / Vespa",
        faction: "The Swarm",
        insanity: 10,
        hp: 8,
        origin: "<p>Representa um enxame coordenado. HP baixo, mas múltiplos ataques por turno (narrativo).</p>",
        motivation: "<p>Proteger o ninho / eliminar intrusos.</p>",
        abilities: [
          {
            name: "Mordidas em Massa",
            type: "ativa_l",
            desc: "Vários insetos atacam o mesmo alvo.",
            weakness: "Fogo ou fumaça dispersa o enxame.",
            damage: "1d6",
          },
        ],
      }
    ),
  },
  {
    name: "Agente The Swarm",
    img: "icons/svg/hazard.svg",
    threat: "medio",
    system: buildNpcSystem(
      { for: 2, agi: 2, res: 2, men: 3, per: 3, pre: 2, int: 4 },
      {
        insect: "Vespa",
        faction: "The Swarm",
        insanity: 20,
        origin: "<p>Humano/infectado ideológico. Combate indireto e coordenação.</p>",
        motivation: "<p>Expor e eliminar infectados.</p>",
        abilities: [
          {
            name: "Discurso Venenoso",
            type: "ativa_l",
            desc: "Manipula testemunhas contra o alvo.",
            weakness: "Ineficaz contra quem conhece a verdade.",
            damage: "",
          },
        ],
        items: [
          { name: "Crachá institucional", tier: "2", desc: "Acesso a locais restritos." },
          { name: "Pistola", tier: "2", desc: "+1d6 à distância." },
        ],
      }
    ),
  },
  {
    name: "Operativo Blackmoth (Elite)",
    img: "icons/svg/military.svg",
    threat: "elite",
    system: buildNpcSystem(
      { for: 4, agi: 3, res: 4, men: 3, per: 3, pre: 4, int: 2 },
      {
        insect: "Louva-a-deus",
        faction: "Blackmoth",
        insanity: 40,
        origin: "<p>Soldado infectado em missão classificada. Disciplinado e letal.</p>",
        motivation: "<p>Cumprir ordens — sem questionar.</p>",
        abilities: [
          {
            name: "Golpe Preciso",
            type: "ativa_f",
            desc: "Ataque cirúrgico com garras modificadas.",
            weakness: "Imobilidade antes do golpe.",
            damage: "1d8",
          },
          {
            name: "Disciplina de Combate",
            type: "passiva",
            desc: "Imune a medo em combate.",
            weakness: "Fora de combate, hesita.",
            damage: "",
          },
        ],
        items: [
          { name: "Colete tático", tier: "2", desc: "+1d6 defesa narrativa." },
          { name: "Pistola silenciada", tier: "2", desc: "+1d6 à distância." },
        ],
      }
    ),
  },
  {
    name: "Abominação Prometheus (Boss)",
    img: "icons/svg/tech.svg",
    threat: "boss",
    system: buildNpcSystem(
      { for: 5, agi: 2, res: 6, men: 2, per: 3, pre: 2, int: 3 },
      {
        insect: "Centopeia",
        faction: "Prometheus",
        insanity: 70,
        hp: 28,
        extraWeaknesses: 1,
        origin: "<p>Experimento falho. Múltiplos segmentos, instinto predatório persistente.</p>",
        motivation: "<p>Dor constante — ataca tudo que se move.</p>",
        abilities: [
          {
            name: "Enrolamento",
            type: "ativa_f",
            desc: "Imobiliza e esmaga o alvo.",
            weakness: "Corte nos segmentos expostos interrompe.",
            damage: "2d6",
          },
          {
            name: "Regeneração Instável",
            type: "passiva",
            desc: "Recupera 1d4 HP por turno fora de combate intenso.",
            weakness: "Fogo impede regeneração.",
            damage: "",
          },
          {
            name: "Espasmos do Complex",
            type: "especial",
            desc: "Explosão de tentáculos em área curta.",
            weakness: "Exausto por 1 turno após uso.",
            damage: "1d8",
          },
        ],
      }
    ),
  },
  {
    name: "Infectado em Runaway (Perigo)",
    img: "icons/svg/explosion.svg",
    threat: "forte",
    system: buildNpcSystem(
      { for: 5, agi: 4, res: 4, men: 0, per: 2, pre: 3, int: 0 },
      {
        insect: "Escorpião",
        faction: "NEST",
        insanity: 85,
        origin: "<p>Complex Runaway ativo. O inseto comanda — humano quase ausente.</p>",
        motivation: "<p>Destruir ameaças percebidas.</p>",
        abilities: [
          {
            name: "Ferrão Descontrolado",
            type: "especial",
            desc: "Veneno e dano massivo. +15 ins por uso.",
            weakness: "Toxicidade rebote — perde HP também.",
            damage: "2d6",
          },
        ],
        runaway: { unlocked: true, active: true },
      }
    ),
  },
];
