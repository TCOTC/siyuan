import {getAtPath} from "../util/dotPath";

/** 控件初值：渲染时求值，读取当前 `window.siyuan.config` */
export type ConfigValue<T> = () => T;

export const configNumberValue = (dottedId: string, fallback = 0): ConfigValue<number> => () => {
    const raw = getAtPath(window.siyuan.config, dottedId);
    return typeof raw === "number" && !Number.isNaN(raw) ? raw : fallback;
};

export const configStringValue = (dottedId: string, fallback = ""): ConfigValue<string> => () => {
    const raw = getAtPath(window.siyuan.config, dottedId);
    return typeof raw === "string" ? raw : fallback;
};

export const configBooleanValue = (dottedId: string): ConfigValue<boolean> => () =>
    Boolean(getAtPath(window.siyuan.config, dottedId));

export const configSelectValue = (
    dottedId: string,
    options: {value: number | string}[],
): ConfigValue<number | string> => () => {
    const raw = getAtPath(window.siyuan.config, dottedId);
    const firstVal = options[0]?.value;
    const numericSelect = options.length > 0 && typeof firstVal === "number";
    if (numericSelect) {
        return typeof raw === "number" && !Number.isNaN(raw)
            ? raw
            : typeof firstVal === "number"
              ? firstVal
              : 0;
    }
    return typeof raw === "string"
        ? raw
        : typeof firstVal === "string"
          ? firstVal
          : "";
};

export const resolveBooleanValue = (
    id: string,
    value: ConfigValue<boolean> | undefined,
): boolean => (value ?? configBooleanValue(id))();

export const resolveNumberValue = (
    id: string,
    value: ConfigValue<number> | undefined,
    fallback = 0,
): number => (value ?? configNumberValue(id, fallback))();

export const resolveStringValue = (
    id: string,
    value: ConfigValue<string> | undefined,
): string => (value ?? configStringValue(id))();

export const resolveSelectValue = (
    id: string,
    options: {value: number | string}[],
    value: ConfigValue<number | string> | undefined,
): number | string => (value ?? configSelectValue(id, options))();
