import {
  reduceCustomizerState,
  type CustomizerAction,
  type CustomizerState,
} from "../data/racket-customizer";
import type { ProductInteraction } from "../events/product-interactions";
import { trackEvent } from "./track-event";

export function trackProductInteraction(interaction: ProductInteraction | null) {
  if (!interaction) return;
  try {
    trackEvent(interaction.eventType, interaction.payload, { redactResultId: true });
  } catch {
    // Storage, crypto or transport failures must never interrupt the action.
  }
}

/** Called by user handlers, never by a reducer, render, or effect. */
export function applyCustomizerInteraction(
  state: CustomizerState,
  action: CustomizerAction,
  context: { racketSlug?: string; renderMode: "photo" | "schematic" },
  dispatch: (action: CustomizerAction) => void,
) {
  const next = reduceCustomizerState(state, action);
  if (
    next.stringColorId === state.stringColorId &&
    next.gripColorId === state.gripColorId
  ) return;

  dispatch(action);
  if (!context.racketSlug) return;
  trackProductInteraction({
    eventType: "customizer_change",
    payload: {
      racketSlug: context.racketSlug,
      renderMode: context.renderMode,
      action: action.type,
      stringColorId: next.stringColorId,
      gripColorId: next.gripColorId,
    },
  });
}
