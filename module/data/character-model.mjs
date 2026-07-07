import {
  ATTRIBUTE_POINTS,
  MAX_ATTRIBUTE_AT_CREATION,
  BASE_COMPLEX_POINTS,
  MAX_EXTRA_WEAKNESSES,
  HALLUCINATION_THRESHOLD,
  RUNAWAY_THRESHOLD,
  COLLAPSE_VALUE,
  getInsanityState,
} from "../config.mjs";

const { HTMLField, NumberField, SchemaField, StringField, BooleanField, ArrayField } =
  foundry.data.fields;

const EMPTY_ITEM = { name: "", tier: "1", desc: "" };

function attributeField() {
  return new NumberField({
    required: true,
    integer: true,
    min: 0,
    max: MAX_ATTRIBUTE_AT_CREATION,
    initial: 0,
  });
}

export class CharacterModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      insect: new StringField({ required: true, blank: true, initial: "" }),
      origin: new HTMLField({ required: true, blank: true, initial: "" }),
      motivation: new HTMLField({ required: true, blank: true, initial: "" }),
      faction: new StringField({ required: true, blank: false, initial: "NEST" }),

      attributes: new SchemaField({
        for: attributeField(),
        agi: attributeField(),
        res: attributeField(),
        men: attributeField(),
        per: attributeField(),
        pre: attributeField(),
        int: attributeField(),
      }),

      points: new SchemaField({
        total: new NumberField({ required: true, integer: true, initial: ATTRIBUTE_POINTS }),
        spent: new NumberField({ required: true, integer: true, initial: 0 }),
        remaining: new NumberField({ required: true, integer: true, initial: ATTRIBUTE_POINTS }),
      }),

      hp: new SchemaField({
        value: new NumberField({ required: true, integer: true, initial: 10 }),
        max: new NumberField({ required: true, integer: true, initial: 10 }),
      }),

      ac: new SchemaField({
        value: new NumberField({ required: true, integer: true, initial: 8 }),
      }),

      insanity: new SchemaField({
        value: new NumberField({ required: true, integer: true, min: 0, max: 100, initial: 0 }),
        max: new NumberField({ required: true, integer: true, initial: 100 }),
      }),

      extraWeaknesses: new NumberField({
        required: true,
        integer: true,
        min: 0,
        max: MAX_EXTRA_WEAKNESSES,
        initial: 0,
      }),

      abilities: new ArrayField(
        new SchemaField({
          name: new StringField({ required: false, blank: true, initial: "" }),
          type: new StringField({
            required: false,
            blank: false,
            initial: "passiva",
            choices: ["passiva", "ativa_l", "ativa_f", "especial"],
          }),
          desc: new StringField({ required: false, blank: true, initial: "" }),
          weakness: new StringField({ required: false, blank: true, initial: "" }),
          damage: new StringField({ required: false, blank: true, initial: "" }),
        })
      ),

      items: new ArrayField(
        new SchemaField({
          name: new StringField({ required: false, blank: true, initial: "" }),
          tier: new StringField({
            required: false,
            blank: false,
            initial: "1",
            choices: ["1", "2", "3"],
          }),
          desc: new StringField({ required: false, blank: true, initial: "" }),
        }),
        { initial: [{ ...EMPTY_ITEM }, { ...EMPTY_ITEM }] }
      ),

      dying: new BooleanField({ required: true, initial: false }),

      runaway: new SchemaField({
        // Ao atingir 100 (Colapso), o Runaway NÃO é forçado automaticamente:
        // o Mestre precisa desbloquear (unlocked) para permitir a ativação.
        unlocked: new BooleanField({ required: true, initial: false }),
        active: new BooleanField({ required: true, initial: false }),
      }),
    };
  }

  /** @inheritDoc */
  prepareDerivedData() {
    const attrs = this.attributes;
    const spent = Object.values(attrs).reduce((sum, value) => sum + value, 0);

    this.points.spent = spent;
    this.points.remaining = Math.max(0, this.points.total - spent);

    this.hp.max = 10 + attrs.res * 2;
    this.hp.value = Math.min(this.hp.value, this.hp.max);
    this.ac.value = 8 + attrs.agi;

    if (this.hp.value <= 0 && !this.dying) this.dying = true;
    if (this.hp.value > 0 && this.dying) this.dying = false;
  }

  /** @returns {number} */
  get complexPointsTotal() {
    return BASE_COMPLEX_POINTS + Math.min(this.extraWeaknesses, MAX_EXTRA_WEAKNESSES);
  }

  /** @returns {number} */
  get insanityLabel() {
    return getInsanityState(this.insanity.value).label;
  }

  /** @returns {string} */
  get insanityColor() {
    return getInsanityState(this.insanity.value).color;
  }

  /** @returns {boolean} Insanidade permite alucinações (50+). */
  get canHallucinate() {
    return this.insanity.value >= HALLUCINATION_THRESHOLD;
  }

  /** @returns {boolean} Insanidade permite Runaway (75+). */
  get canRunaway() {
    return this.insanity.value >= RUNAWAY_THRESHOLD;
  }

  /** @returns {boolean} Está em Colapso (100). */
  get isCollapse() {
    return this.insanity.value >= COLLAPSE_VALUE;
  }
}

// NPCs usam exatamente o mesmo modelo dos personagens, para que o Mestre
// possa criar fichas completas de NPC in-game com atributos, Complex e itens.
export class NpcModel extends CharacterModel {}
