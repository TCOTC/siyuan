/** 从设置面板表单控件读取值（与 `renderSettingTabHtmlFromSections` 生成的 DOM 一致） */

export function clampNumber(n: number, min?: number, max?: number, el?: HTMLInputElement): number {
    let v = n;
    if (min !== undefined && v < min) {
        v = min;
    }
    if (max !== undefined && v > max) {
        v = max;
    }
    if (el && String(v) !== el.value) {
        el.value = String(v);
    }
    return v;
}

export function parseInputBound(el: HTMLInputElement, attr: "min" | "max"): number | undefined {
    const s = el.getAttribute(attr);
    if (s === null || s === "") {
        return undefined;
    }
    const n = parseInt(s, 10);
    return Number.isNaN(n) ? undefined : n;
}

export function readDomValueFromEl(el: HTMLElement): unknown {
    if (el instanceof HTMLSelectElement) {
        return parseInt(el.value, 10);
    }
    if (el instanceof HTMLTextAreaElement) {
        return el.value;
    }
    if (el instanceof HTMLInputElement) {
        if (el.type === "checkbox") {
            return el.checked;
        }
        if (el.type === "number") {
            const n = parseInt(el.value, 10);
            if (Number.isNaN(n)) {
                return undefined;
            }
            const minV = parseInputBound(el, "min");
            const maxV = parseInputBound(el, "max");
            return clampNumber(n, minV, maxV, el);
        }
        if (el.type === "range") {
            let n = parseInt(el.value, 10);
            if (Number.isNaN(n)) {
                return undefined;
            }
            const minV = parseInputBound(el, "min");
            const maxV = parseInputBound(el, "max");
            n = clampNumber(n, minV, maxV, el);
            const parent = el.parentElement;
            if (parent) {
                parent.setAttribute("aria-label", String(n));
            }
            return n;
        }
        return el.value;
    }
    return undefined;
}
