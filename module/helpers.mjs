/** Registra helpers Handlebars usados pelos templates do sistema. */
export function registerHandlebarsHelpers() {
  Handlebars.registerHelper("add", (a, b) => Number(a) + Number(b));

  Handlebars.registerHelper("eq", (a, b) => a === b);
}
