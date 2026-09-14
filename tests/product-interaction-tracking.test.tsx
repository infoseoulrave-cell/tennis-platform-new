import assert from "node:assert/strict";
import test, { type TestContext } from "node:test";
import { StrictMode, type MouseEvent } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ProductInteractionLink } from "../src/components/product-interaction-link";
import { RacketVisualCustomizer } from "../src/components/racket-visual-customizer";
import {
  initialCustomizerState,
  reduceCustomizerState,
  type CustomizerAction,
  type CustomizerState,
} from "../src/data/racket-customizer";
import { CUSTOMIZER_PHOTOS } from "../src/data/racket-customizer-photos.generated";
import type { ProductInteraction } from "../src/events/product-interactions";
import { applyCustomizerInteraction, trackProductInteraction } from "../src/lib/product-interaction-tracking";
import { buildSchematicGeometry } from "../src/lib/racket-schematic";
import { trackEvent } from "../src/lib/track-event";

type CapturedEvent = {
  eventType: string;
  payload: Record<string, unknown>;
  pageUrl: string;
  referrer: string;
};

function captureEvents(t: TestContext) {
  const saved = new Map<string, string>();
  const originals = ["window", "document"].map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)] as const);
  const fakeWindow = {
    location: { href: "https://racketlab.kr/results/private-run-123?token=secret&utm_source=codex_qa&utm_campaign=product-events#private" },
    sessionStorage: {
      getItem: (key: string) => saved.get(key) ?? null,
      setItem: (key: string, value: string) => saved.set(key, value),
    },
  };
  Object.defineProperty(globalThis, "window", { configurable: true, value: fakeWindow });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { referrer: "https://racketlab.kr/results/previous-run-456?email=private%40example.com#secret" },
  });
  t.after(() => {
    for (const [key, original] of originals) {
      if (original) Object.defineProperty(globalThis, key, original);
      else Reflect.deleteProperty(globalThis, key);
    }
  });
  const events: CapturedEvent[] = [];
  t.mock.method(globalThis, "fetch", async (url: string, init: RequestInit) => {
    assert.equal(url, "/api/events");
    assert.equal(init.keepalive, true);
    events.push(JSON.parse(String(init.body)));
    return new Response(null, { status: 204 });
  });
  return { events, fakeWindow };
}

const stringInteraction = (source: "racket_detail" | "diagnosis_result"): ProductInteraction => ({
  eventType: "string_pairing_click",
  payload: {
    source,
    racketSlug: "babolat-pure-aero-2026",
    stringOfferKey: "string:head-lynx-tour-125",
    mode: "balanced",
  },
});

function click(button = 0, defaultPrevented = false) {
  let prevented = false;
  const event = {
    button,
    defaultPrevented,
    preventDefault() { prevented = true; },
  } as MouseEvent<HTMLAnchorElement>;
  return { event, wasPrevented: () => prevented };
}

test("string candidate activation distinguishes detail and diagnosis while preserving native navigation", (t) => {
  const { events } = captureEvents(t);
  for (const source of ["racket_detail", "diagnosis_result"] as const) {
    const interaction = stringInteraction(source);
    const link = ProductInteractionLink({
      href: "/strings#head-lynx-tour-125", className: "existing-card", children: "후보 스트링", interaction,
    });
    assert.equal(events.length, source === "racket_detail" ? 0 : 1, "constructing a link must not count as a click");
    const activation = click();
    link.props.onClick(activation.event);
    assert.equal(activation.wasPrevented(), false);
    assert.equal(link.props.href, "/strings#head-lynx-tour-125");
    assert.equal(link.props.className, "existing-card");
    assert.deepEqual(events.at(-1)?.payload, {
      ...interaction.payload,
      campaign: { utm_source: "codex_qa", utm_campaign: "product-events" },
      trafficType: "internal",
    });
  }
  assert.deepEqual(events.map(({ eventType }) => eventType), ["string_pairing_click", "string_pairing_click"]);
});

test("middle click is counted once and ignored/cancelled clicks do not create product events", (t) => {
  const { events } = captureEvents(t);
  const link = ProductInteractionLink({ href: "/rackets?brand=head&q=speed", children: "라켓 찾기",
    interaction: { eventType: "player_racket_click", payload: { source: "players", playerId: "sinner" } },
  });
  const middle = click(1);
  link.props.onClick(middle.event);
  link.props.onAuxClick(middle.event);
  assert.equal(events.length, 1);
  assert.equal(middle.wasPrevented(), false);
  link.props.onAuxClick(click(2).event);
  link.props.onClick(click(0, true).event);
  link.props.onAuxClick(click(1, true).event);
  assert.equal(events.length, 1);
  // Browser keyboard activation and modified primary clicks also use a primary click.
  link.props.onClick({ ...click().event, detail: 0 });
  link.props.onClick({ ...click().event, metaKey: true });
  assert.equal(events.length, 3);
  assert.deepEqual(events[0].payload, {
    source: "players", playerId: "sinner",
    campaign: { utm_source: "codex_qa", utm_campaign: "product-events" }, trafficType: "internal",
  });
  assert.equal(link.props.href, "/rackets?brand=head&q=speed");
  assert.doesNotMatch(JSON.stringify(events), /brand=head|q=speed/);
});

test("color changes and reset are counted only when state changes in both rendering modes", (t) => {
  const { events } = captureEvents(t);
  for (const renderMode of ["photo", "schematic"] as const) {
    let state: CustomizerState = initialCustomizerState;
    let dispatches = 0;
    const context = { racketSlug: "babolat-pure-aero-2026", renderMode };
    const dispatch = (action: CustomizerAction) => {
      dispatches++;
      state = reduceCustomizerState(state, action);
    };
    const act = (action: CustomizerAction) => applyCustomizerInteraction(state, action, context, dispatch);
    const before = events.length;
    act({ type: "reset" });
    assert.equal(events.length, before);
    act({ type: "select-string", colorId: "white" });
    act({ type: "select-string", colorId: "white" });
    act({ type: "select-grip", colorId: "blue" });
    act({ type: "select-grip", colorId: "blue" });
    act({ type: "reset" });
    act({ type: "reset" });
    assert.equal(dispatches, 3);
    assert.deepEqual(state, initialCustomizerState);
    assert.deepEqual(events.slice(before).map(({ eventType, payload }) => ({
      eventType, renderMode: payload.renderMode, action: payload.action,
      stringColorId: payload.stringColorId, gripColorId: payload.gripColorId,
    })), [
      { eventType: "customizer_change", renderMode, action: "select-string", stringColorId: "white", gripColorId: null },
      { eventType: "customizer_change", renderMode, action: "select-grip", stringColorId: "white", gripColorId: "blue" },
      { eventType: "customizer_change", renderMode, action: "reset", stringColorId: null, gripColorId: null },
    ]);
  }
});

test("rendering either customizer or replaying the pure reducer never records user actions", (t) => {
  const { events } = captureEvents(t);
  const props = {
    geometry: buildSchematicGeometry(100, { mains: 16, crosses: 19 }),
    pattern: "16x19", headSize: "100", racketName: "Pure Aero", slug: "babolat-pure-aero-2026",
  };
  for (const photo of [undefined, CUSTOMIZER_PHOTOS[props.slug]]) {
    const html = renderToStaticMarkup(<StrictMode><RacketVisualCustomizer {...props} photo={photo} /></StrictMode>);
    assert.equal((html.match(/type="radio"/g) ?? []).length, 16);
    const resetButton = html.match(/<button\b[^>]*disabled=""[^>]*>[\s\S]*?<\/button>/)?.[0];
    assert.ok(resetButton, "initial reset remains disabled");
    assert.match(html, photo ? /제품 사진/ : /<svg/);
    renderToStaticMarkup(<StrictMode><RacketVisualCustomizer {...props} photo={photo} /></StrictMode>);
  }
  const action = { type: "select-string", colorId: "white" } as const;
  reduceCustomizerState(initialCustomizerState, action);
  reduceCustomizerState(initialCustomizerState, action);
  assert.equal(events.length, 0);
  // React may replay the pure reducer; tracking lives only in the dispatched handler.
  applyCustomizerInteraction(initialCustomizerState, action, { racketSlug: props.slug, renderMode: "photo" }, (nextAction) => {
    reduceCustomizerState(initialCustomizerState, nextAction);
    reduceCustomizerState(initialCustomizerState, nextAction);
  });
  assert.equal(events.length, 1);
});

test("new event URLs redact result identifiers and secrets without changing legacy event paths", (t) => {
  const { events, fakeWindow } = captureEvents(t);
  trackProductInteraction(stringInteraction("diagnosis_result"));
  assert.equal(events[0].pageUrl, "https://racketlab.kr/results/[id]");
  assert.equal(events[0].referrer, "https://racketlab.kr/results/[id]");
  assert.doesNotMatch(JSON.stringify(events[0]), /private-run|previous-run|private%40|token|secret|#private/);
  fakeWindow.location.href = "https://racketlab.kr/rackets/babolat-pure-aero-2026?email=hidden";
  trackProductInteraction({ eventType: "player_racket_click", payload: { source: "home", playerId: "sinner" } });
  assert.equal(events[1].pageUrl, "https://racketlab.kr/rackets/babolat-pure-aero-2026");
  assert.equal(events[1].payload.trafficType, "internal");
  assert.deepEqual(events[1].payload.campaign, events[0].payload.campaign);
  fakeWindow.location.href = "https://racketlab.kr/results/legacy-run?token=secret";
  trackEvent("page_view");
  assert.equal(events[2].pageUrl, "https://racketlab.kr/results/legacy-run");
  assert.equal(events[2].referrer, "https://racketlab.kr/results/previous-run-456");
});

test("synchronous transport errors cannot stop color state updates or link navigation", (t) => {
  captureEvents(t);
  t.mock.method(globalThis, "fetch", () => { throw new Error("transport blocked"); });
  let state: CustomizerState = initialCustomizerState;
  assert.doesNotThrow(() => applyCustomizerInteraction(state, { type: "select-grip", colorId: "blue" }, {
    racketSlug: "babolat-pure-aero-2026", renderMode: "photo",
  }, (action) => { state = reduceCustomizerState(state, action); }));
  assert.equal(state.gripColorId, "blue");
  const link = ProductInteractionLink({ href: "/strings#head-lynx-tour-125", children: "스트링", interaction: stringInteraction("racket_detail") });
  const activation = click();
  assert.doesNotThrow(() => link.props.onClick(activation.event));
  assert.equal(activation.wasPrevented(), false);
  assert.equal(link.props.href, "/strings#head-lynx-tour-125");
});

test("rejected tracking requests are absorbed and missing public identifiers do not prevent UI actions", async (t) => {
  captureEvents(t);
  t.mock.method(globalThis, "fetch", async () => { throw new Error("offline"); });
  assert.doesNotThrow(() => trackProductInteraction(stringInteraction("racket_detail")));
  await Promise.resolve();
  let state: CustomizerState = initialCustomizerState;
  applyCustomizerInteraction(state, { type: "select-string", colorId: "black" }, { renderMode: "schematic" }, (action) => {
    state = reduceCustomizerState(state, action);
  });
  assert.equal(state.stringColorId, "black");
  const link = ProductInteractionLink({ href: "/strings", children: "스트링", interaction: null });
  assert.doesNotThrow(() => link.props.onClick(click().event));
  assert.match(renderToStaticMarkup(link), /href="\/strings"/);
});
