import type { RacketCustomizerProfile } from "../data/racket-customizer-profiles.generated";
import {
  racketCustomizerPath,
  resolveCustomizerProfile,
} from "./racket-customizer";

export type RacketCustomizerCandidate = {
  slug: string;
  imageUrl: string | null;
};

export type RacketCustomizerRouteResolution<
  TRacket extends RacketCustomizerCandidate,
> =
  | {
      kind: "ready";
      racket: TRacket;
      imageUrl: string;
      profile: RacketCustomizerProfile;
    }
  | {
      kind: "redirect";
      location: string;
    }
  | {
      kind: "not-found";
    };

export async function resolveRacketCustomizerRoute<
  TRacket extends RacketCustomizerCandidate,
>(
  requestedSlug: string,
  loadRacket: (slug: string) => Promise<TRacket | null>,
): Promise<RacketCustomizerRouteResolution<TRacket>> {
  const racket = await loadRacket(requestedSlug);

  if (!racket?.imageUrl) {
    return { kind: "not-found" };
  }

  const profile = resolveCustomizerProfile(racket.slug, racket.imageUrl);
  if (!profile) {
    return { kind: "not-found" };
  }

  if (requestedSlug !== racket.slug) {
    return {
      kind: "redirect",
      location: racketCustomizerPath(racket.slug),
    };
  }

  return {
    kind: "ready",
    racket,
    imageUrl: racket.imageUrl,
    profile,
  };
}
