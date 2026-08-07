export function universityLookupKey(
  universityName: string,
  countryName: string,
): string {
  return `${universityName.trim().toLowerCase()}::${countryName.trim().toLowerCase()}`;
}
