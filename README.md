# Jungle Juice RPG — Foundry VTT

Sistema de mesa para **Jungle Juice RPG** no [Foundry Virtual Tabletop](https://foundryvtt.com/) v14.364.

Repositório: [github.com/mantocaio1/jungle_juice_foundryvtt](https://github.com/mantocaio1/jungle_juice_foundryvtt)

## Requisitos

- Foundry VTT **v14.364** (build 364) ou superior na geração 14

## Instalação (desenvolvimento)

1. Clone este repositório:
   ```powershell
   git clone https://github.com/mantocaio1/jungle_juice_foundryvtt.git
   ```

2. Crie um symlink (ou copie a pasta) para o diretório de sistemas do Foundry:
   ```powershell
   # Ajuste o caminho do userData do seu Foundry
   New-Item -ItemType SymbolicLink `
     -Path "$env:LOCALAPPDATA\FoundryVTT\Data\systems\jungle-juice" `
     -Target "C:\Users\Administrator\Projects\jungle_juice_foundryvtt"
   ```

   > A pasta dentro de `Data/systems/` **deve** se chamar `jungle-juice` (igual ao `id` em `system.json`).

3. No Foundry, crie um mundo usando o sistema **Jungle Juice RPG**.

## Instalação (manifest URL)

Cole esta URL na tela de instalação de sistemas do Foundry:

```
https://raw.githubusercontent.com/mantocaio1/jungle_juice_foundryvtt/main/system.json
```

## Regras implementadas (v0.1.0 — MVP)

### Atributos (customização)

- 7 atributos: FOR, AGI, RES, MEN, PER, PRE, INT
- **Começam em 0** — orçamento total de **21 pontos** a distribuir
- Máximo **7** por atributo na criação
- HP = `10 + RES × 2` | AC = `8 + AGI`

### Insecta Complex

- 5 pontos base (+1 por fraqueza extra, máx +2)
- Tipos: Passiva (1pt), Ativa leve (2pt/+5 ins), Ativa forte (3pt/+10 ins), Especial (4pt/+15 ins)

### Rolagens

- Teste: `D20 + Atributo` vs CD
- Ataque: `D20 + Atributo` vs AC (natural 20 = acerto garantido)
- Iniciativa: `D20 + AGI`
- Estado Morrendo: rolagem de sobrevivência `D20` (≤10 perde 1 HP)

## Estrutura do projeto

```
jungle_juice_foundryvtt/     ← repositório Git
└── (instalado como) jungle-juice/   ← pasta em Data/systems/
    ├── system.json
    ├── jungle-juice.mjs
    ├── module/
    │   ├── config.mjs
    │   ├── data/character-model.mjs
    │   ├── dice.mjs
    │   ├── documents.mjs
    │   └── applications/actor-sheet.mjs
    ├── templates/actor-sheet.hbs
    ├── styles/jungle-juice.css
    └── lang/pt-BR.json
```

## Roadmap

- [x] Esqueleto do sistema (v14 TypeDataModel)
- [x] Ficha de personagem básica
- [x] Rolagens D20, iniciativa, sobrevivência
- [ ] Condições de combate automatizadas
- [ ] Complex Runaway e alucinações
- [ ] Compêndios (facções, NPCs)
- [ ] Sincronizar ficha HTML com regra de atributos base 0

## Licença

Uso pessoal / campanha. Consulte o autor do Jungle Juice RPG antes de distribuição pública.
