const { StringField } = foundry.data.fields;

export class GearModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      tier: new StringField({
        required: false,
        blank: false,
        initial: "1",
        choices: ["1", "2", "3"],
      }),
      desc: new StringField({ required: false, blank: true, initial: "" }),
    };
  }
}
