import { useState } from "react";

const ATTRS = [
  { key: "for", label: "Força",        abbr: "FOR", emoji: "👊", desc: "Combate corpo a corpo, força física" },
  { key: "agi", label: "Agilidade",    abbr: "AGI", emoji: "🌪️", desc: "Velocidade, esquiva, define o AC" },
  { key: "res", label: "Resistência",  abbr: "RES", emoji: "💪", desc: "HP, sobrevivência, exaustão" },
  { key: "men", label: "Mente",        abbr: "MEN", emoji: "🧠", desc: "Foco, controle do Complex" },
  { key: "per", label: "Percepção",    abbr: "PER", emoji: "👁️", desc: "Sentidos, notar detalhes" },
  { key: "pre", label: "Precisão",     abbr: "PRE", emoji: "🎯", desc: "Ataques à distância, ações delicadas" },
  { key: "int", label: "Inteligência", abbr: "INT", emoji: "💡", desc: "Raciocínio, social, enigmas" },
];

const ABILITY_TYPES = [
  { value: "passiva",  label: "Passiva simples",  cost: 1, insanity: 0,  badge: "P",  color: "#4CAF70" },
  { value: "ativa_l",  label: "Ativa leve",       cost: 2, insanity: 5,  badge: "AL", color: "#FFC107" },
  { value: "ativa_f",  label: "Ativa forte",      cost: 3, insanity: 10, badge: "AF", color: "#FF9800" },
  { value: "especial", label: "Especial / única",  cost: 4, insanity: 15, badge: "E",  color: "#F44336" },
];

const ITEM_TIERS = [
  { value: "1", label: "Tier 1 — Improvisado (+1d4)" },
  { value: "2", label: "Tier 2 — Refinado (+1d6)" },
  { value: "3", label: "Tier 3 — Especializado (+1d8)" },
];

const TIER_BONUS = { "1": "+1d4", "2": "+1d6", "3": "+1d8" };
const TIER_NAME  = { "1": "Improvisado", "2": "Refinado", "3": "Especializado" };

const FACTIONS = ["NEST", "Pet Shop", "Stray Dogs", "Hollow", "The Swarm", "Prometheus", "The Web", "Blackmoth"];

const TOTAL_POINTS = 21;
const MAX_ATTR = 7;
const BASE_COMPLEX_PTS = 5;

const steps = ["Identidade", "Atributos", "Complex", "Itens", "Exportar"];

export default function App() {
  const [step, setStep] = useState(0);
  const [copiedDiscord, setCopiedDiscord] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [char, setChar] = useState({
    name: "", insect: "", faction: "NEST", origin: "", motivation: "",
    attrs: { for: 0, agi: 0, res: 0, men: 0, per: 0, pre: 0, int: 0 },
    abilities: [],
    extraWeaknesses: 0,
    items: [{ name: "", tier: "1", desc: "" }, { name: "", tier: "1", desc: "" }],
    insanity: 0,
  });

  const usedPoints = Object.values(char.attrs).reduce((s, v) => s + v, 0);
  const remaining = TOTAL_POINTS - usedPoints;
  const complexPts = BASE_COMPLEX_PTS + Math.min(char.extraWeaknesses, 2);
  const usedComplex = char.abilities.reduce((s, a) => s + (ABILITY_TYPES.find(t => t.value === a.type)?.cost || 0), 0);
  const remainingComplex = complexPts - usedComplex;
  const hp = 10 + char.attrs.res * 2;
  const ac = 8 + char.attrs.agi;

  const setAttr = (key, val) => {
    if (val < 0 || val > MAX_ATTR) return;
    const delta = val - char.attrs[key];
    if (delta > 0 && remaining <= 0) return;
    setChar(c => ({ ...c, attrs: { ...c.attrs, [key]: val } }));
  };

  const addAbility = () => {
    if (char.abilities.length >= 6) return;
    setChar(c => ({ ...c, abilities: [...c.abilities, { name: "", type: "passiva", desc: "", weakness: "", damage: "" }] }));
  };

  const updAbility = (i, f, v) => setChar(c => {
    const a = [...c.abilities]; a[i] = { ...a[i], [f]: v }; return { ...c, abilities: a };
  });

  const rmAbility = (i) => setChar(c => ({ ...c, abilities: c.abilities.filter((_, x) => x !== i) }));

  const updItem = (i, f, v) => setChar(c => {
    const items = [...c.items]; items[i] = { ...items[i], [f]: v }; return { ...c, items };
  });

  const insanityColor = char.insanity < 25 ? "#4CAF70" : char.insanity < 50 ? "#FFC107" : char.insanity < 75 ? "#FF9800" : char.insanity < 100 ? "#F44336" : "#B71C1C";
  const insanityLabel = char.insanity < 25 ? "Estável" : char.insanity < 50 ? "Tenso" : char.insanity < 75 ? "Abalado" : char.insanity < 100 ? "Perturbado" : "COLAPSO";

  const generateDiscord = () => {
    const attrBlock = ATTRS.map(a => `${a.emoji} **${a.abbr}** \`${char.attrs[a.key]}\``).join("  ");

    const abilitiesBlock = char.abilities.length === 0
      ? "> *Nenhuma habilidade registrada.*"
      : char.abilities.map((ab, i) => {
          const t = ABILITY_TYPES.find(t => t.value === ab.type);
          const insLine = t?.insanity > 0 ? `🌑 \`+${t.insanity} Insanidade\`` : `✨ \`Sem custo\``;
          const dmgLine = ab.damage ? `  ·  dano \`${ab.damage}\`` : "";
          return [
            `> 🔹 **${ab.name || "Sem nome"}**  •  *${t?.label}*  •  ${insLine}${dmgLine}`,
            `> ${ab.desc || "*Sem descrição.*"}`,
            `> ⚠️ *Fraqueza:* ${ab.weakness || "*Não definida.*"}`,
          ].join("\n");
        }).join("\n> ─────────────────\n");

    const activeItems = char.items.filter(it => it.name.trim());
    const itemsBlock = activeItems.length === 0
      ? "> *Nenhum item equipado.*"
      : activeItems.map((it, i) => [
          `> 🔸 **${it.name}**  •  Tier ${it.tier} — *${TIER_NAME[it.tier]}*  •  \`${TIER_BONUS[it.tier]}\``,
          `> ${it.desc || "*Sem descrição.*"}`,
        ].join("\n")).join("\n> ─────────────────\n");

    const insBar = "█".repeat(Math.floor(char.insanity / 10)) + "░".repeat(10 - Math.floor(char.insanity / 10));

    return `╔══════════════════════════════╗
║   🦟  JUNGLE JUICE RPG       ║
║   FICHA DE PERSONAGEM        ║
╚══════════════════════════════╝

🪪 **${char.name || "Sem Nome"}**
🐛 *Inseto:* ${char.insect || "*não definido*"}   ·   🏠 *Facção:* **${char.faction}**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊  **A T R I B U T O S**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${attrBlock}

❤️ **HP** \`${hp}/${hp}\`   🛡️ **AC** \`${ac}\`

🧠 **Insanidade** \`${char.insanity}/100\`  •  *${insanityLabel}*
\`${insBar}\`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🐛  **I N S E C T A   C O M P L E X**
*${char.insect || "?"}*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${abilitiesBlock}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎒  **I T E N S**   *(máx. 2)*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${itemsBlock}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖  **O R I G E M**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
> ${char.origin || "*Não definida.*"}
> 🎯 *Motivação:* ${char.motivation || "*Não definida.*"}`;
  };

  const generateJson = () => JSON.stringify({
    version: 1,
    name: char.name,
    insect: char.insect,
    faction: char.faction,
    origin: char.origin,
    motivation: char.motivation,
    attrs: char.attrs,
    abilities: char.abilities.map(a => ({
      name: a.name,
      type: a.type,
      desc: a.desc,
      weakness: a.weakness,
      damage: a.damage || "",
    })),
    extraWeak: char.extraWeaknesses,
    items: char.items,
    insanity: char.insanity,
  }, null, 2);

  const copyText = (text, setter) => {
    navigator.clipboard.writeText(text).then(() => {
      setter(true);
      setTimeout(() => setter(false), 2000);
    }).catch(() => setter(true));
  };

  const downloadJson = () => {
    const blob = new Blob([generateJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (char.name || "ficha").replace(/\s+/g, "_") + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080e0a", color: "#c0d0b8", fontFamily: "'Courier New', monospace" }}>
      <style>{`
        * { box-sizing: border-box; }
        input, textarea, select { font-family: 'Courier New', monospace !important; }
        input::placeholder, textarea::placeholder { color: #2a4a30; }
        input:focus, textarea:focus, select:focus { border-color: #4CAF70 !important; outline: none; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #080e0a; } ::-webkit-scrollbar-thumb { background: #1e3a26; border-radius: 3px; }
        @media (max-width: 600px) {
          .attr-grid { grid-template-columns: 1fr !important; }
          .step-label { display: none; }
          .header-steps { gap: 4px !important; }
          .stat-row { flex-direction: column !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #1a2e1e", padding: "14px 16px", position: "sticky", top: 0, background: "#080e0a", zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 22 }}>🦟</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: "bold", color: "#4CAF70", letterSpacing: 2 }}>JUNGLE JUICE RPG</div>
            <div style={{ fontSize: 10, color: "#2a4a30", letterSpacing: 1 }}>CRIADOR DE FICHA</div>
          </div>
          {char.name && <span style={{ marginLeft: "auto", color: "#4a6a50", fontSize: 12 }}>— {char.name}</span>}
        </div>
        <div className="header-steps" style={{ display: "flex", gap: 6 }}>
          {steps.map((s, i) => (
            <button key={i} onClick={() => setStep(i)} style={{
              flex: 1, background: step === i ? "#1a2e1e" : "transparent",
              border: `1px solid ${step === i ? "#4CAF70" : "#1a2e1e"}`,
              color: step === i ? "#4CAF70" : "#2a4a30",
              padding: "7px 4px", borderRadius: 4, cursor: "pointer",
              fontSize: 11, fontFamily: "inherit", transition: "all 0.15s"
            }}>
              <span>{i + 1}</span>
              <span className="step-label">. {s}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "20px 14px 40px" }}>

        {/* ── STEP 0: Identidade ── */}
        {step === 0 && <>
          <Title icon="📋" text="Identidade do Personagem" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <Field label="Nome" value={char.name} onChange={v => setChar(c => ({...c, name: v}))} placeholder="Como te chamam..." />
            <Field label="🐛 Inseto do Complex" value={char.insect} onChange={v => setChar(c => ({...c, insect: v}))} placeholder="Libélula, Escorpião, Formiga..." />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", color: "#2a4a30", fontSize: 10, letterSpacing: 1, marginBottom: 5, textTransform: "uppercase" }}>Facção</label>
            <select value={char.faction} onChange={e => setChar(c => ({...c, faction: e.target.value}))} style={{ ...inp, width: "100%" }}>
              {FACTIONS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <Field label="Origem / Background" value={char.origin} onChange={v => setChar(c => ({...c, origin: v}))} placeholder="Quem era você antes da infecção? Como aconteceu?" multi />
          <div style={{ marginTop: 12 }}>
            <Field label="🎯 Motivação" value={char.motivation} onChange={v => setChar(c => ({...c, motivation: v}))} placeholder="O que te move? O que ainda tenta preservar?" multi />
          </div>
          <Nav right onRight={() => setStep(1)} />
        </>}

        {/* ── STEP 1: Atributos ── */}
        {step === 1 && <>
          <Title icon="📊" text="Atributos" />
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
            <div style={{ padding: "8px 16px", border: `1px solid ${remaining === 0 ? "#4CAF70" : "#F5A623"}`, borderRadius: 6, fontSize: 13 }}>
              <span style={{ color: "#4a6a50" }}>Pontos: </span>
              <span style={{ color: "#4CAF70", fontWeight: "bold", fontSize: 20 }}>{usedPoints}</span>
              <span style={{ color: "#4a6a50" }}> / {TOTAL_POINTS} · restantes: </span>
              <span style={{ color: remaining === 0 ? "#4CAF70" : "#F5A623", fontWeight: "bold", fontSize: 20 }}>{remaining}</span>
            </div>
            <span style={{ fontSize: 11, color: "#2a4a30" }}>Base 0 · Máx 7 na criação</span>
          </div>

          <div className="attr-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {ATTRS.map(a => (
              <div key={a.key} style={{ background: "#0c1610", border: "1px solid #1a2e1e", borderRadius: 8, padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{a.emoji}</span>
                    <span style={{ color: "#4CAF70", fontWeight: "bold", fontSize: 13 }}>{a.abbr}</span>
                    <span style={{ color: "#2a4a30", fontSize: 11 }}>{a.label}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Btn onClick={() => setAttr(a.key, char.attrs[a.key] - 1)}>−</Btn>
                    <span style={{ color: "#c0d0b8", fontWeight: "bold", fontSize: 22, minWidth: 26, textAlign: "center" }}>{char.attrs[a.key]}</span>
                    <Btn onClick={() => setAttr(a.key, char.attrs[a.key] + 1)}>+</Btn>
                  </div>
                </div>
                <div style={{ fontSize: 10, color: "#2a4a30" }}>{a.desc}</div>
              </div>
            ))}
          </div>

          <div className="stat-row" style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <StatCard emoji="❤️" label="HP" value={hp} formula="10 + RES×2" color="#F44336" />
            <StatCard emoji="🛡️" label="AC" value={ac} formula="8 + AGI" color="#2196F3" />
          </div>
          <Nav left onLeft={() => setStep(0)} right onRight={() => setStep(2)} />
        </>}

        {/* ── STEP 2: Complex ── */}
        {step === 2 && <>
          <Title icon="🐛" text={`Insecta Complex — ${char.insect || "?"}`} />
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ padding: "8px 14px", border: `1px solid ${remainingComplex >= 0 ? "#4CAF70" : "#F44336"}`, borderRadius: 6, fontSize: 13 }}>
              <span style={{ color: "#4a6a50" }}>Pontos: </span>
              <span style={{ color: remainingComplex >= 0 ? "#4CAF70" : "#F44336", fontWeight: "bold", fontSize: 20 }}>{remainingComplex}</span>
              <span style={{ color: "#4a6a50" }}> / {complexPts}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#4a6a50", fontSize: 11 }}>Fraquezas extras (+1pt cada, máx +2):</span>
              <Btn onClick={() => setChar(c => ({...c, extraWeaknesses: Math.max(0, c.extraWeaknesses-1)}))}>−</Btn>
              <span style={{ color: "#F5A623", fontWeight: "bold", fontSize: 18 }}>{char.extraWeaknesses}</span>
              <Btn onClick={() => setChar(c => ({...c, extraWeaknesses: Math.min(2, c.extraWeaknesses+1)}))}>+</Btn>
            </div>
          </div>

          <div style={{ fontSize: 10, color: "#2a4a30", marginBottom: 14, lineHeight: 1.6 }}>
            {ABILITY_TYPES.map(t => <span key={t.value} style={{ marginRight: 14 }}><span style={{ color: t.color }}>{t.badge}</span> {t.label} = {t.cost}pt{t.insanity > 0 ? ` · 🌑+${t.insanity}` : " · grátis"}</span>)}
          </div>

          {char.abilities.map((ab, i) => {
            const t = ABILITY_TYPES.find(t => t.value === ab.type);
            return (
              <div key={i} style={{ background: "#0c1610", border: `1px solid #1a2e1e`, borderLeft: `3px solid ${t?.color}`, borderRadius: 8, padding: 14, marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                  <span style={{ background: t?.color + "22", color: t?.color, borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: "bold", whiteSpace: "nowrap" }}>{t?.badge} {t?.label}</span>
                  <input value={ab.name} onChange={e => updAbility(i, "name", e.target.value)} placeholder="Nome da habilidade..." style={{ ...inp, flex: 1, minWidth: 120 }} />
                  <select value={ab.type} onChange={e => updAbility(i, "type", e.target.value)} style={{ ...inp, width: 160 }}>
                    {ABILITY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label} ({t.cost}pt)</option>)}
                  </select>
                  <button onClick={() => rmAbility(i)} style={{ background: "#1a0808", border: "1px solid #3a1010", color: "#F44336", borderRadius: 4, padding: "6px 10px", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>✕</button>
                </div>
                <input value={ab.desc} onChange={e => updAbility(i, "desc", e.target.value)} placeholder="Descrição da habilidade..." style={{ ...inp, width: "100%", marginBottom: 8 }} />
                <input value={ab.damage || ""} onChange={e => updAbility(i, "damage", e.target.value)} placeholder="Dado de dano (opcional, ex: 1d6)" style={{ ...inp, width: "100%", marginBottom: 8 }} />
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#F5A623", fontSize: 11, whiteSpace: "nowrap" }}>⚠️ Fraqueza:</span>
                  <input value={ab.weakness} onChange={e => updAbility(i, "weakness", e.target.value)} placeholder="Limitação obrigatória..." style={{ ...inp, flex: 1 }} />
                </div>
              </div>
            );
          })}

          {char.abilities.length < 6 && (
            <button onClick={addAbility} style={{ width: "100%", background: "transparent", border: "1px dashed #1a2e1e", color: "#2a4a30", borderRadius: 8, padding: 12, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}
              onMouseOver={e => { e.target.style.borderColor="#4CAF70"; e.target.style.color="#4CAF70"; }}
              onMouseOut={e => { e.target.style.borderColor="#1a2e1e"; e.target.style.color="#2a4a30"; }}>
              + Adicionar Habilidade
            </button>
          )}
          <Nav left onLeft={() => setStep(1)} right onRight={() => setStep(3)} />
        </>}

        {/* ── STEP 3: Itens ── */}
        {step === 3 && <>
          <Title icon="🎒" text="Itens e Adaptações" />
          <div style={{ fontSize: 11, color: "#2a4a30", marginBottom: 16 }}>Máximo 2 itens equipados. Cada item deve fazer sentido com o seu Complex.</div>
          {[0, 1].map(i => (
            <div key={i} style={{ background: "#0c1610", border: "1px solid #1a2e1e", borderRadius: 8, padding: 16, marginBottom: 14 }}>
              <div style={{ color: "#4CAF70", fontSize: 11, marginBottom: 10, letterSpacing: 1 }}>SLOT {i + 1} {char.items[i].name ? `— ${char.items[i].name}` : ""}</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                <input value={char.items[i].name} onChange={e => updItem(i, "name", e.target.value)} placeholder="Nome do item..." style={{ ...inp, flex: 1, minWidth: 140 }} />
                <select value={char.items[i].tier} onChange={e => updItem(i, "tier", e.target.value)} style={{ ...inp, width: 220 }}>
                  {ITEM_TIERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <input value={char.items[i].desc} onChange={e => updItem(i, "desc", e.target.value)} placeholder="Como este item se relaciona com o seu Complex?" style={{ ...inp, width: "100%" }} />
            </div>
          ))}
          <Nav left onLeft={() => setStep(2)} right onRight={() => setStep(4)} rightLabel="Ver Ficha →" />
        </>}

        {/* ── STEP 4: Export ── */}
        {step === 4 && <>
          <Title icon="📤" text="Exportar" />
          <p style={{ color: "#2a4a30", fontSize: 11, marginBottom: 16 }}>
            Discord: bloco de texto formatado. Foundry: JSON para importar na aba Identidade (GM) ou sidebar Atores.
          </p>

          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <StatMini emoji="❤️" label="HP" value={`${hp}/${hp}`} color="#F44336" />
            <StatMini emoji="🛡️" label="AC" value={ac} color="#2196F3" />
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#0c1610", border: "1px solid #1a2e1e", borderRadius: 6, padding: "8px 14px" }}>
              <span>🧠</span>
              <span style={{ color: "#4a6a50", fontSize: 12 }}>Insanidade:</span>
              <Btn onClick={() => setChar(c => ({...c, insanity: Math.max(0, c.insanity-5)}))}>−</Btn>
              <span style={{ color: insanityColor, fontWeight: "bold", fontSize: 16, minWidth: 28, textAlign: "center" }}>{char.insanity}</span>
              <Btn onClick={() => setChar(c => ({...c, insanity: Math.min(100, c.insanity+5)}))}>+</Btn>
              <span style={{ color: insanityColor, fontSize: 11 }}>({insanityLabel})</span>
            </div>
          </div>

          <div style={{ color: "#4CAF70", fontSize: 11, letterSpacing: 1, marginBottom: 6 }}>FICHA PARA O DISCORD</div>
          <textarea readOnly value={generateDiscord()} style={{
            width: "100%", minHeight: 280, maxHeight: 340, background: "#060c08", border: "1px solid #1a2e1e",
            borderRadius: 8, padding: 16, color: "#8aaa84", fontFamily: "'Courier New', monospace",
            fontSize: 12, lineHeight: 1.8, resize: "vertical", outline: "none", marginBottom: 10
          }} />
          <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
            <button onClick={() => copyText(generateDiscord(), setCopiedDiscord)} style={{
              background: copiedDiscord ? "#1a3a1a" : "#1a2e1e",
              border: "1px solid #4CAF70", color: "#4CAF70",
              padding: "12px 16px", borderRadius: 8, cursor: "pointer",
              fontSize: 13, fontFamily: "inherit", fontWeight: "bold"
            }}>
              {copiedDiscord ? "✓ Copiado!" : "📋 Copiar Discord"}
            </button>
          </div>

          <div style={{ color: "#2196F3", fontSize: 11, letterSpacing: 1, marginBottom: 6 }}>JSON PARA O FOUNDRY</div>
          <textarea readOnly value={generateJson()} style={{
            width: "100%", minHeight: 180, maxHeight: 260, background: "#060c08", border: "1px solid #1a2e1e",
            borderRadius: 8, padding: 16, color: "#8aaa84", fontFamily: "'Courier New', monospace",
            fontSize: 12, lineHeight: 1.6, resize: "vertical", outline: "none", marginBottom: 10
          }} />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button onClick={() => copyText(generateJson(), setCopiedJson)} style={{
              background: copiedJson ? "#10243a" : "#1a2e1e",
              border: "1px solid #2196F3", color: "#2196F3",
              padding: "12px 16px", borderRadius: 8, cursor: "pointer",
              fontSize: 13, fontFamily: "inherit", fontWeight: "bold"
            }}>
              {copiedJson ? "✓ Copiado!" : "📥 Copiar JSON (Foundry)"}
            </button>
            <button onClick={downloadJson} style={{
              background: "transparent", border: "1px solid #1a2e1e", color: "#4a6a50",
              padding: "12px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "inherit"
            }}>💾 Baixar .json</button>
            <button onClick={() => setStep(0)} style={{
              background: "transparent", border: "1px solid #1a2e1e", color: "#4a6a50",
              padding: "12px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "inherit"
            }}>← Editar</button>
          </div>
        </>}

      </div>
    </div>
  );
}

// ── Helpers ──
const inp = {
  background: "#060c08", border: "1px solid #1a2e1e", borderRadius: 5,
  padding: "9px 12px", color: "#c0d0b8", fontSize: 13, outline: "none", boxSizing: "border-box"
};

function Btn({ onClick, children }) {
  return <button onClick={onClick} style={{ background: "#1a2e1e", border: "1px solid #2a4a30", color: "#4CAF70", borderRadius: 4, padding: "3px 10px", cursor: "pointer", fontFamily: "inherit", fontSize: 15, fontWeight: "bold", lineHeight: 1 }}>{children}</button>;
}

function Title({ icon, text }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingBottom: 10, borderBottom: "1px solid #1a2e1e" }}>
    <span style={{ fontSize: 18 }}>{icon}</span>
    <span style={{ color: "#4CAF70", fontWeight: "bold", fontSize: 16, letterSpacing: 1 }}>{text}</span>
  </div>;
}

function Field({ label, value, onChange, placeholder, multi }) {
  const style = { ...inp, width: "100%", ...(multi ? { minHeight: 80, resize: "vertical", display: "block" } : {}) };
  return <div>
    <label style={{ display: "block", color: "#2a4a30", fontSize: 10, letterSpacing: 1, marginBottom: 5, textTransform: "uppercase" }}>{label}</label>
    {multi ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={style} />
           : <input   value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={style} />}
  </div>;
}

function StatCard({ emoji, label, value, formula, color }) {
  return <div style={{ flex: 1, background: "#0c1610", border: `1px solid ${color}33`, borderRadius: 8, padding: "12px 16px", display: "flex", alignItems: "center", gap: 14 }}>
    <span style={{ fontSize: 24 }}>{emoji}</span>
    <span style={{ color, fontWeight: "bold", fontSize: 30 }}>{value}</span>
    <div><div style={{ color, fontWeight: "bold", fontSize: 12 }}>{label}</div><div style={{ color: "#2a4a30", fontSize: 10 }}>{formula}</div></div>
  </div>;
}

function StatMini({ emoji, label, value, color }) {
  return <div style={{ background: "#0c1610", border: `1px solid ${color}33`, borderRadius: 6, padding: "8px 14px", display: "flex", alignItems: "center", gap: 8 }}>
    <span>{emoji}</span>
    <span style={{ color: "#4a6a50", fontSize: 12 }}>{label}:</span>
    <span style={{ color, fontWeight: "bold" }}>{value}</span>
  </div>;
}

function Nav({ left, onLeft, right, onRight, rightLabel = "Próximo →" }) {
  return <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: left && right ? "space-between" : right ? "flex-end" : "flex-start" }}>
    {left && <button onClick={onLeft} style={{ background: "transparent", border: "1px solid #1a2e1e", color: "#4a6a50", padding: "10px 18px", borderRadius: 6, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>← Anterior</button>}
    {right && <button onClick={onRight} style={{ background: "#1a2e1e", border: "1px solid #4CAF70", color: "#4CAF70", padding: "10px 20px", borderRadius: 6, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: "bold" }}>{rightLabel}</button>}
  </div>;
}
