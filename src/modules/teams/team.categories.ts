export const TEAM_CATEGORIES = [
  'Sub 12 Femenino',
  'Sub 12 Masculino',
  'Sub 14 Femenino',
  'Sub 14 Masculino',
  'Sub 16 Femenino',
  'Sub 16 Masculino',
  'Sub 18 Femenino',
  'Sub 18 Masculino',
  'Sub 21 Femenino',
  'Sub 21 Masculino',
  'Primera División Femenino',
  'Primera División Masculino',
  'Maxivoley Femenino',
  'Maxivoley Masculino'
] as const;

export function normalizeTeamName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('es');
}
