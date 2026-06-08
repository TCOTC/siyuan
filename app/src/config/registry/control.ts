import {getAtPath} from "../util/dotPath";
import {normalizeNumberInputValue, snapRangeValue} from "./domIO";

type SelectOption = {
    value: number | string;
    label?: string;
};

type ControlBase = {
    id: string;
    /** mount 时从 config 读取初值 */
    read(): unknown;
    /** change 时从 DOM 读取提交值 */
    readDom(el: HTMLElement): unknown;
};

type BooleanControl = ControlBase & {kind: "switch"};
type NumberControl = ControlBase & {
    kind: "number";
    min?: number;
    max?: number;
    step?: string;
    unit?: string;
};
type RangeControl = ControlBase & {
    kind: "range";
    min: number;
    max: number;
    step: number;
};
type SelectControl = ControlBase & {
    kind: "select";
    options: SelectOption[];
};
export type StringControl = ControlBase & {kind: "text"};
type TextBlockControl = ControlBase & {
    kind: "textBlock";
    mode: "input-text" | "input-password" | "textarea";
};

export type ConfigControl =
    | BooleanControl
    | NumberControl
    | RangeControl
    | SelectControl
    | StringControl
    | TextBlockControl;

const readConfigAt = (id: string): unknown => getAtPath(window.siyuan.config, id);

const coerceNumber = (raw: unknown, fallback: number): number =>
    typeof raw === "number" && !Number.isNaN(raw) ? raw : fallback;

const coerceString = (raw: unknown, fallback: string): string =>
    typeof raw === "string" ? raw : fallback;

const clampNumber = (n: number, min?: number, max?: number): number => {
    let result = n;
    if (min !== undefined) {
        result = Math.max(min, result);
    }
    if (max !== undefined) {
        result = Math.min(max, result);
    }
    return result;
};

const coerceSelectValue = (
    raw: unknown,
    options: SelectOption[],
): number | string => {
    const firstVal = options[0]?.value;
    if (options.length > 0 && typeof firstVal === "number") {
        return coerceNumber(raw, firstVal);
    }
    return coerceString(raw, typeof firstVal === "string" ? firstVal : "");
};

const isNumericSelect = (options: SelectOption[]): boolean =>
    options.length > 0 && typeof options[0].value === "number";

const readSelectDom = (el: HTMLElement, options: SelectOption[]): number | string => {
    const select = el as HTMLSelectElement;
    return isNumericSelect(options) ? parseInt(select.value, 10) : select.value;
};

export const controlBoolean = (
    id: string,
    options?: {read?: () => boolean},
): BooleanControl => ({
    kind: "switch",
    id,
    read: () => options?.read?.() ?? Boolean(readConfigAt(id)),
    readDom: (el) => (el as HTMLInputElement).checked,
});

export const controlNumber = (
    id: string,
    options?: {
        min?: number;
        max?: number;
        step?: string;
        unit?: string;
        fallback?: number;
        read?: () => number;
    },
): NumberControl => {
    const {min, max, step, unit, fallback = 0, read} = options ?? {};
    return {
        kind: "number",
        id,
        min,
        max,
        step,
        unit,
        read: () => {
            const n = read?.() ?? coerceNumber(readConfigAt(id), fallback);
            return clampNumber(n, min, max);
        },
        readDom: (el) => clampNumber(normalizeNumberInputValue(el as HTMLInputElement), min, max),
    };
};

export const controlRange = (
    id: string,
    options: {min: number; max: number; step: number; read?: () => number},
): RangeControl => {
    const {min, max, step, read} = options;
    const readSnapped = () => {
        const raw = read?.() ?? coerceNumber(readConfigAt(id), min);
        return snapRangeValue(raw, min, max, step);
    };
    return {
        kind: "range",
        id,
        min,
        max,
        step,
        read: readSnapped,
        readDom: (el) => {
            const n = normalizeNumberInputValue(el as HTMLInputElement);
            return snapRangeValue(Number.isNaN(n) ? min : n, min, max, step);
        },
    };
};

export const controlSelect = (
    id: string,
    options: {options: SelectOption[]; read?: () => number | string},
): SelectControl => ({
    kind: "select",
    id,
    options: options.options,
    read: () => options.read?.() ?? coerceSelectValue(readConfigAt(id), options.options),
    readDom: (el) => readSelectDom(el, options.options),
});

export const controlString = (
    id: string,
    options?: {read?: () => string; fallback?: string},
): StringControl => {
    const fallback = options?.fallback ?? "";
    return {
        kind: "text",
        id,
        read: () => options?.read?.() ?? coerceString(readConfigAt(id), fallback),
        readDom: (el) => (el as HTMLInputElement | HTMLTextAreaElement).value,
    };
};

export const controlTextBlock = (
    id: string,
    options: {
        mode: "input-text" | "input-password" | "textarea";
        read?: () => string;
        fallback?: string;
    },
): TextBlockControl => {
    const fallback = options.fallback ?? "";
    return {
        kind: "textBlock",
        id,
        mode: options.mode,
        read: () => options.read?.() ?? coerceString(readConfigAt(id), fallback),
        readDom: (el) => (el as HTMLInputElement | HTMLTextAreaElement).value,
    };
};