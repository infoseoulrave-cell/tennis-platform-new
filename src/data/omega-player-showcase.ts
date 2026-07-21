import {
  players,
  type PlayerEquipment,
  type PlayerPhoto,
} from "@/data/players";

export type OmegaPlayerShowcase = {
  id: string;
  name: string;
  nameKo: string;
  countryFlag: string;
  initial: string;
  tags: string[];
  equipment: PlayerEquipment;
  synergy: string;
  photo: PlayerPhoto;
  verifiedAt: string;
};

const shortNames: Record<string, string> = {
  sinner: "시너",
  alcaraz: "알카라스",
  djokovic: "조코비치",
  zverev: "즈베레프",
  medvedev: "메드베데프",
  fritz: "프리츠",
  ruud: "루드",
  "de-minaur": "드 미노르",
  rublev: "루블료프",
};

export const omegaPlayerShowcase: OmegaPlayerShowcase[] = players
  .slice(0, 9)
  .map((player) => ({
    id: player.id,
    name: player.name,
    nameKo: shortNames[player.id] ?? player.nameKo,
    countryFlag: player.countryFlag,
    initial: player.initial,
    tags: player.tags,
    equipment: player.equipment,
    synergy: player.synergy,
    photo: player.photo,
    verifiedAt: player.verifiedAt,
  }));
