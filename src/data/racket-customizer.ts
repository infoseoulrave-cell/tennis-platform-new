export const STRING_COLOR_OPTIONS = [
  { id: "black", label: "검정", hex: "#171717" },
  { id: "white", label: "흰색", hex: "#F4F2E8" },
  { id: "natural", label: "내추럴", hex: "#D9C69C" },
  { id: "silver", label: "실버", hex: "#A8ADB4" },
  { id: "gold", label: "골드", hex: "#C7A34B" },
  { id: "flash-yellow", label: "형광 노랑", hex: "#D9F22A" },
  { id: "blue", label: "파랑", hex: "#2F65C8" },
  { id: "red", label: "빨강", hex: "#D44747" },
] as const;

export const GRIP_COLOR_OPTIONS = [
  { id: "white", label: "흰색", hex: "#F4F2E8" },
  { id: "black", label: "검정", hex: "#171717" },
  { id: "blue", label: "파랑", hex: "#315FA8" },
  { id: "red", label: "빨강", hex: "#C74449" },
  { id: "yellow", label: "노랑", hex: "#E5D33E" },
  { id: "green", label: "초록", hex: "#438A61" },
  { id: "pink", label: "분홍", hex: "#DE88A7" },
  { id: "purple", label: "보라", hex: "#76579C" },
] as const;

export type StringColorId = (typeof STRING_COLOR_OPTIONS)[number]["id"];
export type GripColorId = (typeof GRIP_COLOR_OPTIONS)[number]["id"];

export type CustomizerState = {
  stringColorId: StringColorId | null;
  gripColorId: GripColorId | null;
};

export type CustomizerAction =
  | { type: "select-string"; colorId: StringColorId }
  | { type: "select-grip"; colorId: GripColorId }
  | { type: "reset" };

export const initialCustomizerState: CustomizerState = {
  stringColorId: null,
  gripColorId: null,
};

export function reduceCustomizerState(
  state: CustomizerState,
  action: CustomizerAction,
): CustomizerState {
  switch (action.type) {
    case "select-string":
      return { ...state, stringColorId: action.colorId };
    case "select-grip":
      return { ...state, gripColorId: action.colorId };
    case "reset":
      return initialCustomizerState;
  }
}
