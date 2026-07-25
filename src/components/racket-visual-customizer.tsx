"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useReducer,
  useRef,
  useState,
} from "react";

import {
  GRIP_COLOR_OPTIONS,
  initialCustomizerState,
  reduceCustomizerState,
  STRING_COLOR_OPTIONS,
} from "@/data/racket-customizer";
import type { RacketCustomizerProfile } from "@/data/racket-customizer-profiles.generated";
import {
  matchesCustomizerDimensions,
  resolveCustomizerProfile,
} from "@/lib/racket-customizer";

type RacketVisualCustomizerProps = {
  slug: string;
  imageUrl: string;
  alt: string;
};

type CssMaskSupportApi = {
  supports?: (property: string, value: string) => boolean;
};

type ImageValidation = {
  key: string;
  element: HTMLImageElement;
};

type CustomizerImageFailure =
  | "image-error"
  | "dimension-mismatch"
  | null;

type CustomizerReadiness = {
  kind: "preparing" | "ready" | "fallback";
  message: string | null;
};

type MountedImageClassification =
  | "pending"
  | "ready"
  | "image-error"
  | "dimension-mismatch";

export function classifyMountedImage(
  image: Pick<
    HTMLImageElement,
    "complete" | "naturalWidth" | "naturalHeight"
  > | null,
  profile: RacketCustomizerProfile,
): MountedImageClassification {
  if (!image?.complete) return "pending";
  if (image.naturalWidth === 0 || image.naturalHeight === 0) {
    return "image-error";
  }

  return matchesCustomizerDimensions(
    profile,
    image.naturalWidth,
    image.naturalHeight,
  )
    ? "ready"
    : "dimension-mismatch";
}

export function decideCustomizerReadiness({
  maskSupported,
  dimensionsMatch,
  imageFailure,
}: {
  maskSupported: boolean | null;
  dimensionsMatch: boolean;
  imageFailure: CustomizerImageFailure;
}): CustomizerReadiness {
  if (imageFailure === "image-error") {
    return {
      kind: "fallback",
      message:
        "제품 이미지를 불러오지 못해 색상 시뮬레이션을 사용할 수 없습니다.",
    };
  }

  if (imageFailure === "dimension-mismatch") {
    return {
      kind: "fallback",
      message:
        "이미지 규격이 맞지 않아 색상 효과 없이 원본 이미지만 표시합니다.",
    };
  }

  if (maskSupported === false) {
    return {
      kind: "fallback",
      message:
        "이 브라우저에서는 색상 시뮬레이션을 지원하지 않아 원본 이미지만 표시합니다.",
    };
  }

  if (maskSupported && dimensionsMatch) {
    return {
      kind: "ready",
      message: null,
    };
  }

  return {
    kind: "preparing",
    message: "색상 시뮬레이션을 준비하고 있습니다.",
  };
}

export function hasCssMaskSupport(
  cssApi: CssMaskSupportApi | null | undefined,
): boolean {
  if (typeof cssApi?.supports !== "function") return false;

  try {
    return cssApi.supports("mask-image", "url(/mask.svg)")
      || cssApi.supports("-webkit-mask-image", "url(/mask.svg)");
  } catch {
    return false;
  }
}

export function customizerValidationKey(
  profile: RacketCustomizerProfile,
  imageUrl: string,
): string {
  return JSON.stringify([
    profile.slug,
    profile.productCode,
    profile.sourceLayout,
    profile.intrinsicWidth,
    profile.intrinsicHeight,
    profile.stringMaskUrl,
    profile.gripMaskUrl,
    imageUrl,
  ]);
}

export function isCurrentImageValidation(
  validation: ImageValidation | null,
  expectedKey: string,
): boolean {
  return validation?.key === expectedKey;
}

export function RacketVisualCustomizer({
  slug,
  imageUrl,
  alt,
}: RacketVisualCustomizerProps) {
  const profile = resolveCustomizerProfile(slug, imageUrl);

  if (!profile) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-white">
        <Image
          src={imageUrl}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 45vw"
          unoptimized
          priority
          className="object-contain p-8"
        />
      </div>
    );
  }

  const validationKey = customizerValidationKey(profile, imageUrl);

  return (
    <ValidatedRacketCustomizer
      key={validationKey}
      profile={profile}
      validationKey={validationKey}
      imageUrl={imageUrl}
      alt={alt}
    />
  );
}

function ValidatedRacketCustomizer({
  profile,
  validationKey,
  imageUrl,
  alt,
}: {
  profile: RacketCustomizerProfile;
  validationKey: string;
  imageUrl: string;
  alt: string;
}) {
  const [state, dispatch] = useReducer(
    reduceCustomizerState,
    initialCustomizerState,
  );
  const [imageValidation, setImageValidation] =
    useState<ImageValidation | null>(null);
  const [maskSupported, setMaskSupported] = useState<boolean | null>(null);
  const [imageFailure, setImageFailure] =
    useState<CustomizerImageFailure>(null);
  const mountedImageRef = useRef<HTMLImageElement | null>(null);
  const groupId = useId();
  const applyImageClassification = useCallback(
    (element: HTMLImageElement | null) => {
      const classification = classifyMountedImage(element, profile);
      setImageValidation(
        classification === "ready" && element
          ? { key: validationKey, element }
          : null,
      );
      setImageFailure(
        classification === "image-error"
          || classification === "dimension-mismatch"
          ? classification
          : null,
      );
    },
    [profile, validationKey],
  );

  useEffect(() => {
    setMaskSupported(hasCssMaskSupport(
      typeof CSS === "undefined" ? undefined : CSS,
    ));
  }, []);

  useEffect(() => {
    const mountedImage = mountedImageRef.current;
    if (!mountedImage) return;

    let classificationTimer: number | null = null;
    const stopWatchingImage = () => {
      if (classificationTimer === null) return;
      window.clearInterval(classificationTimer);
      classificationTimer = null;
    };
    const classifyCurrentImage = () => {
      if (mountedImage !== mountedImageRef.current) {
        stopWatchingImage();
        return;
      }
      if (!mountedImage.complete) return;
      stopWatchingImage();
      applyImageClassification(mountedImage);
    };
    const markCurrentImageFailed = () => {
      if (mountedImage !== mountedImageRef.current) return;
      stopWatchingImage();
      setImageValidation(null);
      setImageFailure("image-error");
    };

    mountedImage.addEventListener("load", classifyCurrentImage);
    mountedImage.addEventListener("error", markCurrentImageFailed);
    classifyCurrentImage();
    if (!mountedImage.complete) {
      classificationTimer = window.setInterval(classifyCurrentImage, 100);
    }

    return () => {
      stopWatchingImage();
      mountedImage.removeEventListener("load", classifyCurrentImage);
      mountedImage.removeEventListener("error", markCurrentImageFailed);
    };
  }, [applyImageClassification]);

  const dimensionsMatch = isCurrentImageValidation(
    imageValidation,
    validationKey,
  );
  const readiness = decideCustomizerReadiness({
    maskSupported,
    dimensionsMatch,
    imageFailure,
  });
  const controlsReady = readiness.kind === "ready";
  const stringColor = STRING_COLOR_OPTIONS.find(
    ({ id }) => id === state.stringColorId,
  );
  const gripColor = GRIP_COLOR_OPTIONS.find(
    ({ id }) => id === state.gripColorId,
  );
  const maskStyle = {
    maskSize: "100% 100%",
    WebkitMaskSize: "100% 100%",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    mixBlendMode: "normal",
  } as const;

  const validateLoadedImage = useCallback(
    (element: HTMLImageElement) => {
      if (element !== mountedImageRef.current) return;

      applyImageClassification(element);
    },
    [applyImageClassification],
  );
  const handleImageError = useCallback((element: HTMLImageElement) => {
    if (element !== mountedImageRef.current) return;

    setImageValidation(null);
    setImageFailure("image-error");
  }, []);

  return (
    <div>
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-white">
        <div
          className="relative overflow-hidden"
          style={{
            aspectRatio: `${profile.intrinsicWidth} / ${profile.intrinsicHeight}`,
            height: "calc(100% - 4rem)",
            maxWidth: "calc(100% - 4rem)",
          }}
        >
          <Image
            ref={mountedImageRef}
            src={imageUrl}
            alt={alt}
            fill
            sizes="(max-width: 1024px) 100vw, 45vw"
            unoptimized
            priority
            className="object-contain"
            onLoad={(event) => validateLoadedImage(event.currentTarget)}
            onError={(event) => handleImageError(event.currentTarget)}
          />

          {controlsReady && stringColor && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                ...maskStyle,
                backgroundColor: stringColor.hex,
                filter:
                  stringColor.id === "white" || stringColor.id === "silver"
                    ? "drop-shadow(0 0 0.75px rgba(38, 38, 38, 0.75))"
                    : undefined,
                maskImage: `url("${profile.stringMaskUrl}")`,
                WebkitMaskImage: `url("${profile.stringMaskUrl}")`,
              }}
            />
          )}

          {controlsReady && gripColor && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                ...maskStyle,
                backgroundColor: gripColor.hex,
                backgroundImage:
                  "repeating-linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0 2px, rgba(0, 0, 0, 0.08) 2px 4px)",
                maskImage: `url("${profile.gripMaskUrl}")`,
                WebkitMaskImage: `url("${profile.gripMaskUrl}")`,
              }}
            />
          )}
        </div>
      </div>

      {readiness.message && (
        <p
          role="status"
          className="mt-4 rounded-xl bg-[var(--color-bg-subtle)] px-4 py-3 text-xs leading-relaxed text-[var(--color-text-secondary)]"
        >
          {readiness.message}
        </p>
      )}

      <section
        hidden={!controlsReady}
        aria-labelledby={`${groupId}-title`}
        className="mt-4 rounded-2xl border border-[var(--color-border)] p-4"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={`${groupId}-title`} className="text-sm font-semibold">
              색상 시뮬레이션
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-muted)]">
              선택한 색상은 시각적 비교용이며 판매 재고를 의미하지 않습니다.
            </p>
          </div>
          <button
            type="button"
            disabled={!state.stringColorId && !state.gripColorId}
            onClick={() => dispatch({ type: "reset" })}
            className="min-h-11 shrink-0 rounded-lg border border-[var(--color-border)] px-3 text-xs font-medium hover:border-[var(--color-text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            원본으로 초기화
          </button>
        </div>

        <fieldset className="mt-5">
          <legend className="text-xs font-semibold">스트링 색상</legend>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {STRING_COLOR_OPTIONS.map((option) => {
              const selected = state.stringColorId === option.id;

              return (
                <label
                  key={option.id}
                  className={`relative flex min-h-11 min-w-11 cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs ${
                    selected
                      ? "border-[var(--color-text)] bg-[var(--color-bg-subtle)] font-semibold"
                      : "border-[var(--color-border)]"
                  }`}
                >
                  <input
                    type="radio"
                    name={`${groupId}-string-color`}
                    value={option.id}
                    checked={selected}
                    onChange={() =>
                      dispatch({
                        type: "select-string",
                        colorId: option.id,
                      })
                    }
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-xl peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-accent)] peer-focus-visible:ring-offset-2"
                  />
                  <span
                    aria-hidden="true"
                    className="h-5 w-5 shrink-0 rounded-full border border-black/20"
                    style={{ backgroundColor: option.hex }}
                  />
                  <span>{option.label}</span>
                  {selected && (
                    <span className="ml-auto" aria-hidden="true">
                      ✓
                    </span>
                  )}
                  {selected && <span className="sr-only">선택됨</span>}
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="mt-5">
          <legend className="text-xs font-semibold">그립 색상</legend>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {GRIP_COLOR_OPTIONS.map((option) => {
              const selected = state.gripColorId === option.id;

              return (
                <label
                  key={option.id}
                  className={`relative flex min-h-11 min-w-11 cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs ${
                    selected
                      ? "border-[var(--color-text)] bg-[var(--color-bg-subtle)] font-semibold"
                      : "border-[var(--color-border)]"
                  }`}
                >
                  <input
                    type="radio"
                    name={`${groupId}-grip-color`}
                    value={option.id}
                    checked={selected}
                    onChange={() =>
                      dispatch({
                        type: "select-grip",
                        colorId: option.id,
                      })
                    }
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-xl peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-accent)] peer-focus-visible:ring-offset-2"
                  />
                  <span
                    aria-hidden="true"
                    className="h-5 w-5 shrink-0 rounded-full border border-black/20"
                    style={{ backgroundColor: option.hex }}
                  />
                  <span>{option.label}</span>
                  {selected && (
                    <span className="ml-auto" aria-hidden="true">
                      ✓
                    </span>
                  )}
                  {selected && <span className="sr-only">선택됨</span>}
                </label>
              );
            })}
          </div>
        </fieldset>

        <p className="sr-only" aria-live="polite">
          {stringColor ? `스트링 ${stringColor.label}` : "스트링 원본"},{" "}
          {gripColor ? `그립 ${gripColor.label}` : "그립 원본"}
        </p>
      </section>
    </div>
  );
}
