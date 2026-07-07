/** Entradas de compêndio — Facções do Jungle Juice RPG (Guia do Player). */

export const FACTIONS = [
  {
    id: "nest",
    name: "NEST",
    img: "icons/svg/castle.svg",
    tagline: "Sua facção — sua casa",
    stance: "Aliado",
    content: `
      <h2>NEST</h2>
      <p><em>Sua facção — sua casa</em></p>
      <p>Uma organização estruturada que protege infectados. Tem regras, hierarquia e segredos. Você confia nela, pelo menos por enquanto.</p>
      <h3>O que a NEST oferece</h3>
      <ul>
        <li><strong>Proteção</strong> — contra grupos que caçam ou usam infectados.</li>
        <li><strong>Recursos</strong> — para controlar e desenvolver o Complex.</li>
        <li><strong>Informação</strong> — sobre o mundo que você entrou sem saber.</li>
        <li><strong>Pertencimento</strong> — um lugar onde você não precisa se esconder completamente.</li>
      </ul>
      <h3>O que a NEST espera</h3>
      <ul>
        <li>Não expor a existência de infectados.</li>
        <li>Não usar o Complex de forma que chame atenção pública.</li>
        <li>Reportar contato com outros grupos.</li>
        <li>Seguir orientações dos supervisores.</li>
      </ul>
      <p class="hint">A proteção da NEST tem um preço. Quem quebra as regras é contido. Quem faz perguntas não autorizadas pode não receber resposta.</p>
    `,
  },
  {
    id: "pet-shop",
    name: "Pet Shop",
    img: "icons/svg/skull.svg",
    tagline: "Ameaça ativa — evitar a todo custo",
    stance: "Inimigo",
    content: `
      <h2>Pet Shop</h2>
      <p><em>Ameaça ativa — evitar a todo custo</em></p>
      <p>O grupo mais perigoso que você precisa conhecer. Caça infectados para experimentação forçada.</p>
      <p><strong>Não negocie. Não aceite propostas.</strong></p>
      <p>Operam nas sombras com recursos desconhecidos. Infectados capturados raramente voltam.</p>
    `,
  },
  {
    id: "stray-dogs",
    name: "Stray Dogs",
    img: "icons/svg/wolf.svg",
    tagline: "Desconhecidos — tratar com cautela",
    stance: "Neutro / Aliado improvável",
    content: `
      <h2>Stray Dogs</h2>
      <p><em>Desconhecidos — tratar com cautela</em></p>
      <p>Infectados independentes que agem contra a Pet Shop. A NEST os mantém à distância.</p>
      <p>Podem ser aliados improváveis ou não — depende de quem você encontra e do que precisam naquele momento.</p>
    `,
  },
  {
    id: "hollow",
    name: "Hollow",
    img: "icons/svg/ghost.svg",
    tagline: "Grupo menor — poucos registros",
    stance: "Neutro",
    content: `
      <h2>Hollow</h2>
      <p><em>Grupo menor — poucos registros</em></p>
      <p>Infectados que escolheram desaparecer. Suprimem o Complex e vivem como humanos.</p>
      <p>A NEST sabe que existem, mas tem pouco contato. Encontrar um Hollow é raro — e eles preferem assim.</p>
    `,
  },
  {
    id: "the-swarm",
    name: "The Swarm",
    img: "icons/svg/hazard.svg",
    tagline: "Ameaça ideológica — grupo anti-infectado",
    stance: "Inimigo",
    content: `
      <h2>The Swarm</h2>
      <p><em>Ameaça ideológica — grupo anti-infectado</em></p>
      <p>Acreditam que infectados são uma aberração. Têm alcance maior do que parece — membros em posições institucionais.</p>
      <p>Não combatem abertamente na rua; trabalham por dentro de sistemas que infectados precisam usar para sobreviver.</p>
    `,
  },
  {
    id: "prometheus",
    name: "Prometheus",
    img: "icons/svg/tech.svg",
    tagline: "Grupo de pesquisa — pouca informação",
    stance: "Desconhecido",
    content: `
      <h2>Prometheus</h2>
      <p><em>Grupo de pesquisa — pouca informação</em></p>
      <p>Estudam o Jungle Juice. Existem há muito tempo. O que exatamente fazem não está claro nos arquivos que você tem acesso.</p>
      <p>Podem oferecer respostas — ou usar infectados como material de estudo.</p>
    `,
  },
  {
    id: "the-web",
    name: "The Web",
    img: "icons/svg/spider.svg",
    tagline: "Corretores de informação — neutros",
    stance: "Neutro",
    content: `
      <h2>The Web</h2>
      <p><em>Corretores de informação — neutros</em></p>
      <p>Coletam e vendem informações sobre todos os grupos. Não têm lealdade permanente.</p>
      <p>Sabem mais do que deveriam sobre todo mundo — e cobram caro por isso.</p>
    `,
  },
  {
    id: "blackmoth",
    name: "Blackmoth",
    img: "icons/svg/military.svg",
    tagline: "Operação militar — ameaça em potencial",
    stance: "Ameaça",
    content: `
      <h2>Blackmoth</h2>
      <p><em>Operação militar — ameaça em potencial</em></p>
      <p>Recrutam infectados para operações classificadas. Apresentam-se como proteção governamental.</p>
      <p><strong>A NEST não encoraja contato.</strong> O que eles fazem com quem aceita — e com quem recusa — é desconhecido.</p>
    `,
  },
];
