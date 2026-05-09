/** 按实心点路径读取配置（与控件 `id` 约定一致） */
export function getAtPath(root: unknown, dottedPath: string): unknown {
    const segments = dottedPath.split(".");
    let cur: unknown = root;
    for (const s of segments) {
        if (cur === null || cur === undefined) {
            return undefined;
        }
        cur = (cur as Record<string, unknown>)[s];
    }
    return cur;
}

function assignPathImmutable(
    obj: Record<string, unknown>,
    segments: string[],
    value: unknown
): Record<string, unknown> {
    if (segments.length === 1) {
        return {...obj, [segments[0]]: value};
    }
    const [head, ...rest] = segments;
    const child = obj[head];
    const base =
        typeof child === "object" && child !== null && !Array.isArray(child)
            ? {...(child as Record<string, unknown>)}
            : {};
    return {
        ...obj,
        [head]: assignPathImmutable(base, rest, value),
    };
}

/** 将叶子值合并到 `IEditor` 的嵌套路径（不可变） */
export function assignByDottedPath(editor: Config.IEditor, dottedId: string, value: unknown): Config.IEditor {
    const segments = dottedId.split(".");
    return assignPathImmutable(editor as unknown as Record<string, unknown>, segments, value) as unknown as Config.IEditor;
}

/// #if !BROWSER
function collectSpellcheckLanguagesFromDom(root: HTMLElement): string[] {
    const spellcheckLanguagesElement = root.querySelector("#spellcheckLanguages");
    if (!spellcheckLanguagesElement) {
        return window.siyuan.config.editor.spellcheckLanguages;
    }
    return Array.from(spellcheckLanguagesElement.querySelectorAll(".b3-chip--current")).map(
        (item) => item.textContent || ""
    );
}
/// #endif

function clampNumber(
    n: number,
    min?: number,
    max?: number,
    el?: HTMLInputElement
): number {
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

function parseInputBound(el: HTMLInputElement, attr: "min" | "max"): number | undefined {
    const s = el.getAttribute(attr);
    if (s === null || s === "") {
        return undefined;
    }
    const n = parseInt(s, 10);
    return Number.isNaN(n) ? undefined : n;
}

/** 仅依据 DOM（与 renderEditorHtml 生成的属性一致），不依赖编辑器行定义表 */
function readDomValueFromEl(el: HTMLElement): unknown {
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
            let n = parseInt(el.value, 10);
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

/**
 * 基于当前 `window.siyuan.config.editor`，仅根据 **本次变动的控件 `id`** 从 DOM 读取并合并一项。
 * `id` 与 `IEditor` 字段路径一致（如 `markdown.inlineAsterisk`）；特例见 `spellcheckLanguages`。
 */
export function mergeEditorFromControlId(root: HTMLElement, controlId: string): Config.IEditor {
    const prev = window.siyuan.config.editor;

    /// #if !BROWSER
    if (controlId === "spellcheckLanguages") {
        return {
            ...prev,
            spellcheckLanguages: collectSpellcheckLanguagesFromDom(root),
        };
    }
    /// #endif

    const el = root.querySelector<HTMLElement>(`[id="${CSS.escape(controlId)}"]`);
    if (!el) {
        return prev;
    }

    const value = readDomValueFromEl(el);
    if (value === undefined) {
        return prev;
    }
    return assignByDottedPath(prev, controlId, value);
}
