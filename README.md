# Jungle Juice RPG — Foundry VTT

Sistema de mesa para **Jungle Juice RPG** no [Foundry Virtual Tabletop](https://foundryvtt.com/) v14.364.

Repositório: [github.com/mantocaio1/Jungle_Juice_FoundryVTT](https://github.com/mantocaio1/Jungle_Juice_FoundryVTT)

## Requisitos

- Foundry VTT **v14.364** (build 364) ou superior na geração 14

## Instalação (manifest URL — recomendado)

### 1. Sistema (obrigatório)

Na tela **Instalar Sistema**, cole:

```
https://raw.githubusercontent.com/mantocaio1/Jungle_Juice_FoundryVTT/main/system.json
```

### 2. Módulo de compêndios (recomendado)

Na tela **Instalar Módulo**, cole:

```
https://raw.githubusercontent.com/mantocaio1/Jungle_Juice_FoundryVTT/main/companion/module.json
```

> Os pacotes de instalação via manifest usam os [releases do GitHub](https://github.com/mantocaio1/Jungle_Juice_FoundryVTT/releases). Para a primeira instalação, crie um release com tag `v0.6.0` ou use o symlink de desenvolvimento abaixo.

Ative o módulo **Jungle Juice — Compêndios** na configuração do mundo.

## Instalação (desenvolvimento)

1. Clone o repositório:
   ```powershell
   git clone https://github.com/mantocaio1/Jungle_Juice_FoundryVTT.git
   ```

2. Symlink do **sistema**:
   ```powershell
   New-Item -ItemType SymbolicLink `
     -Path "$env:LOCALAPPDATA\FoundryVTT\Data\systems\jungle-juice" `
     -Target "C:\caminho\para\Jungle_Juice_FoundryVTT"
   ```

3. Symlink do **módulo de compêndios**:
   ```powershell
   New-Item -ItemType SymbolicLink `
     -Path "$env:LOCALAPPDATA\FoundryVTT\Data\modules\jungle-juice-compendia" `
     -Target "C:\caminho\para\Jungle_Juice_FoundryVTT\companion"
   ```

   > A pasta do sistema deve se chamar `jungle-juice` e a do módulo `jungle-juice-compendia` (iguais aos `id` nos manifests).

4. Crie um mundo com o sistema **Jungle Juice RPG** e ative o módulo de compêndios.

## Regras implementadas (v0.6.0)

### Atributos

- 7 atributos: FOR, AGI, RES, MEN, PER, PRE, INT
- **Começam em 0** — orçamento total de **21 pontos**
- Máximo **7** por atributo na criação
- HP = `10 + RES × 2` | AC = `8 + AGI`

### Insecta Complex

- 5 pontos base (+1 por fraqueza extra, máx +2)
- Tipos: Passiva (1pt), Ativa leve (2pt/+5 ins), Ativa forte (3pt/+10 ins), Especial (4pt/+15 ins)
- Runaway desbloqueado pelo Mestre em Colapso (100); alucinações privadas a partir de 50

### Combate

- **4 ações por turno:** Principal, Movimentação, Suporte, Livre (tracker na ficha)
- Ataque com diálogo: atributo, AC, habilidade do Complex, bônus de item (+1d4/1d6/1d8)
- 8 condições com desvantagem, dano/insanidade por turno e testes de recuperação
- Morrendo: sobrevivência D20, estabilizar RES CD 12, cura estabiliza

### Itens

- Documentos Foundry (`gear`) — máx. 2 por personagem (Mestre pode adicionar mais)
- Ficha de item própria; migração automática de `system.items` legado

### Cura & Descanso

- Item de cura (💊): dado do tier (1d4 / 1d6 / 1d8)
- Descanso Curto: +RES HP, −5 Ins | Descanso Longo: HP cheio, −15 Ins

### Compêndios (módulo companion)

Populados automaticamente na primeira carga do mundo (GM):

| Compêndio | Tipo | Conteúdo |
|-----------|------|----------|
| **Facções** | Journal | 8 facções do Guia do Player |
| **NPCs** | Actor | 10 NPCs pré-prontos |
| **Bestiário** | Actor | 10 criaturas de combate |
| **Macros do Mestre** | Macro | Horror, insanidade em massa, whispers |
| **Cenas** | Journal | Templates de investigação, enigma, horror |

### Ficha standalone (Discord)

A pasta [`ficha/`](ficha/) contém o criador de ficha fora do Foundry:

| Arquivo | Uso |
|---------|-----|
| `ficha/JungleJuice_Ficha.html` | Abrir no navegador |
| `ficha/JungleJuice_FichaCreator.jsx` | Componente React |

## Estrutura do projeto

```
Jungle_Juice_FoundryVTT/
├── system.json              # Sistema (regras + ficha)
├── jungle-juice.mjs
├── module/                  # Motor do sistema
├── templates/
├── styles/
├── companion/               # Módulo opcional de compêndios
│   ├── module.json
│   ├── jungle-juice-compendia.mjs
│   ├── module/data/         # Dados dos compêndios
│   └── packs/
└── ficha/                   # Criador standalone
```

## Releases

Tags `v*` disparam o workflow que gera:

- `jungle-juice.zip` — sistema
- `jungle-juice-compendia.zip` — módulo de compêndios

## Roadmap

- [x] MVP combate, insanidade, condições
- [x] Compêndios, bestiário, macros e cenas
- [x] Ações por turno e bônus de item em ataque
- [x] Itens como documentos Foundry
- [x] Módulo companion + manifests para instalação
- [ ] Testes E2E automatizados
- [ ] Submissão ao package browser oficial do Foundry

## Licença

Uso pessoal / campanha. Consulte o autor do Jungle Juice RPG antes de distribuição pública.
