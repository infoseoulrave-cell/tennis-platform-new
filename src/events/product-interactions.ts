import type { GripColorId, StringColorId } from "../data/racket-customizer";

/** Public product identifiers only; never include diagnosis answers or run IDs. */
export interface ProductInteractionPayloadMap {
  string_pairing_click: {
    source: "racket_detail" | "diagnosis_result";
    racketSlug: string;
    stringOfferKey: `string:${string}`;
    mode: "comfort" | "balanced" | "spin-control";
  };
  customizer_change: {
    racketSlug: string;
    renderMode: "photo" | "schematic";
    action: "select-string" | "select-grip" | "reset";
    stringColorId: StringColorId | null;
    gripColorId: GripColorId | null;
  };
  player_racket_click: {
    source: "home" | "players";
    playerId: string;
  };
}

export type ProductInteraction = {
  [K in keyof ProductInteractionPayloadMap]: {
    eventType: K;
    payload: ProductInteractionPayloadMap[K];
  };
}[keyof ProductInteractionPayloadMap];
