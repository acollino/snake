export class CreativeCommonsGenerator {
  static url = "https://creativecommons.org/licenses/";
  static edition = "/4.0/";

  static parseAttribution(attribStr) {
    let creator = attribStr.substring(
      attribStr.indexOf(" ") + 1,
      attribStr.indexOf(",")
    );
    let license = attribStr.substring(
      attribStr.indexOf("(CC BY") + 4,
      attribStr.indexOf(")", 3)
    );
    let licenseLink = `${this.url}${license.toLowerCase()}${this.edition}`;
    return { creator, license, licenseLink };
  }
}
