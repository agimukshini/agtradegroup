import { env } from '../config/env';

export function calculateShippingFee(city: string): number {
  if (city.toLowerCase() === env.freeDeliveryCity.toLowerCase()) {
    return 0;
  }
  return env.standardDeliveryFee;
}

export function getCities(): string[] {
  return [
    'Ferizaj',
    'Prishtina',
    'Prizren',
    'Gjilan',
    'Gjakova',
    'Peja',
    'Mitrovica',
    'Podujeva',
    'Vushtrri',
    'Fushe Kosove',
    'Suhareke',
    'Rahovec',
    'Drenas',
    'Lipjan',
    'Kastriot',
    'Kamenice',
    'Viti',
    'Klin',
    'Shtime',
    'Malisheve',
    'Skenderaj',
    'Decan',
  ];
}
