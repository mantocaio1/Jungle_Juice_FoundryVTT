/** Templates de Journal para cenas (compêndio jungle-juice.cenas). */

export const SCENE_TEMPLATES = [
  {
    id: "investigacao",
    name: "Cena — Investigação",
    img: "icons/svg/search.svg",
    tagline: "Pistas, CDs e relógio opcional",
    content: `
      <h2>Investigação</h2>
      <p><strong>Objetivo da cena:</strong> <em>(o que os jogadores precisam descobrir)</em></p>
      <p><strong>Relógio (opcional):</strong> ☐☐☐☐☐ — avança em falhas ou demora</p>
      <hr/>
      <h3>Pistas disponíveis</h3>
      <ul>
        <li><strong>Pista óbvia (PER CD 8):</strong> …</li>
        <li><strong>Pista média (INT CD 12):</strong> …</li>
        <li><strong>Pista escondida (PER CD 16):</strong> …</li>
      </ul>
      <h3>Complicações</h3>
      <ul>
        <li>+5 Insanidade se falharem em MEN CD 12 ao encarar o horror</li>
        <li>Encontro se o relógio encher</li>
      </ul>
      <h3>Notas do Mestre</h3>
      <p>…</p>
    `,
  },
  {
    id: "enigma",
    name: "Cena — Enigma / Puzzle",
    img: "icons/svg/puzzle.svg",
    tagline: "Desafio mental com múltiplas soluções",
    content: `
      <h2>Enigma</h2>
      <p><strong>Apresentação aos jogadores:</strong> <em>(descrição do que veem)</em></p>
      <p><strong>Solução ideal:</strong> …</p>
      <p><strong>Soluções alternativas:</strong> …</p>
      <hr/>
      <h3>Testes sugeridos</h3>
      <ul>
        <li>INT CD 12 — deduzir padrão</li>
        <li>PER CD 14 — notar detalhe crucial</li>
        <li>MEN CD 10 — resistir à pressão psicológica (+5 Ins se falhar)</li>
      </ul>
      <h3>Consequências</h3>
      <ul>
        <li><strong>Sucesso:</strong> …</li>
        <li><strong>Falha:</strong> …</li>
      </ul>
    `,
  },
  {
    id: "horror",
    name: "Cena — Evento de Horror",
    img: "icons/svg/skull.svg",
    tagline: "Impacto emocional e insanidade",
    content: `
      <h2>Evento de Horror</h2>
      <p><strong>Gatilho:</strong> <em>(quando dispara)</em></p>
      <p><strong>Descrição sensorial:</strong> …</p>
      <hr/>
      <h3>Mecânicas</h3>
      <ul>
        <li>MEN CD 12 — manter compostura (falha: +5 Insanidade)</li>
        <li>MEN CD 16 — não entrar em pânico (falha: +10 Insanidade, condição Alucinado)</li>
        <li>RES CD 12 — evitar paralisia (falha: Atordoado até fim do turno)</li>
      </ul>
      <h3>Macro rápida</h3>
      <p>Use <em>Horror — +5/+10 Insanidade</em> do compêndio de macros do Mestre.</p>
    `,
  },
  {
    id: "interrogatorio",
    name: "Cena — Interrogatório / Social",
    img: "icons/svg/conversation.svg",
    tagline: "Confronto social com informação em jogo",
    content: `
      <h2>Interrogatório / Social</h2>
      <p><strong>NPC:</strong> …</p>
      <p><strong>O que sabe:</strong> …</p>
      <p><strong>O que esconde:</strong> …</p>
      <hr/>
      <h3>Abordagens</h3>
      <ul>
        <li><strong>Intimidação (FOR CD 12):</strong> revela pista menor; falha pode fechar diálogo</li>
        <li><strong>Persuasão (PRE CD 12):</strong> cooperação temporária</li>
        <li><strong>Enganação (INT CD 14):</strong> informação falsa ou verdade parcial</li>
        <li><strong>Empatia (MEN CD 12):</strong> motivação real do NPC</li>
      </ul>
      <h3>Relógio de tensão</h3>
      <p>☐☐☐ — cada falha ou insulto avança; ao encher, NPC foge ou chama reforços.</p>
    `,
  },
  {
    id: "perseguicao",
    name: "Cena — Perseguição",
    img: "icons/svg/running.svg",
    tagline: "AGI, obstáculos e turnos",
    content: `
      <h2>Perseguição</h2>
      <p><strong>Quem foge / quem persegue:</strong> …</p>
      <p><strong>Terreno:</strong> …</p>
      <hr/>
      <h3>Estrutura por rodada</h3>
      <ol>
        <li>Perseguidor rola AGI CD 12 (ou vs AGI do alvo)</li>
        <li>Em empate, status quo; sucesso reduz distância; falha aumenta</li>
        <li>Obstáculo opcional: RES CD 10 ou AGI CD 12 para não tropeçar</li>
      </ol>
      <h3>Desfechos</h3>
      <ul>
        <li>Alcançado → combate ou captura</li>
        <li>Escapou → nova pista ou emboscada</li>
      </ul>
    `,
  },
];
