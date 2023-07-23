/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
    // Define template paths to load
    const templatePaths = [
      // Actor Sheet Partials
      'systems/twdu/templates/sheets/parts/character-inventory.hbs',
      'systems/twdu/templates/sheets/parts/character-notes.hbs',
      'systems/twdu/templates/sheets/parts/character-talents.hbs',
      'systems/twdu/templates/sheets/parts/character-main.hbs',
      
    ];
  
    // Load the template parts
    return loadTemplates(templatePaths);
  };
  