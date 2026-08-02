import { racketCustomizerPath } from "./racket-customizer";
import {
  schematicFromSpec,
  type RacketRenderSpec,
  type SchematicGeometry,
} from "./racket-schematic";

export type RacketCustomizerCandidate = RacketRenderSpec & {
  slug: string;
};

export type RacketCustomizerRouteResolution<
  TRacket extends RacketCustomizerCandidate,
> =
  | {
      kind: "ready";
      racket: TRacket;
      geometry: SchematicGeometry;
    }
  | {
      kind: "redirect";
      location: string;
    }
  | {
      kind: "not-found";
    };

/**
 * 커스터마이저 진입 가능 여부를 판정한다.
 *
 * 예전에는 라켓별로 손으로 찍은 마스크 프로파일과 제품 사진의 픽셀 크기가
 * 모두 일치해야만 열렸다. 그래서 운영에서는 사실상 아무 라켓도 열리지 않았다.
 * 이제는 헤드 면적과 스트링 패턴만 있으면 도식을 그릴 수 있으므로 그것만 본다.
 */
export async function resolveRacketCustomizerRoute<
  TRacket extends RacketCustomizerCandidate,
>(
  requestedSlug: string,
  loadRacket: (slug: string) => Promise<TRacket | null>,
): Promise<RacketCustomizerRouteResolution<TRacket>> {
  const racket = await loadRacket(requestedSlug);

  if (!racket) {
    return { kind: "not-found" };
  }

  // 스펙이 모자라면 추측해서 그리지 않는다.
  const geometry = schematicFromSpec(racket);
  if (!geometry) {
    return { kind: "not-found" };
  }

  if (requestedSlug !== racket.slug) {
    return {
      kind: "redirect",
      location: racketCustomizerPath(racket.slug),
    };
  }

  return { kind: "ready", racket, geometry };
}
