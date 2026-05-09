import type {EditorRow} from "./editorEntries";
import {EDITOR_ROW_BY_ID} from "./editorEntries";

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

function readDomValue(controlId: string, row: EditorRow, el: HTMLElement): unknown {
    switch (row.type) {
        case "custom":
            return undefined;
        case "switch":
            return (el as HTMLInputElement).checked;
        case "select":
            return parseInt((el as HTMLSelectElement).value, 10);
        case "text":
            return (el as HTMLInputElement).value;
        case "number": {
            const input = el as HTMLInputElement;
            let n = parseInt(input.value, 10);
            if (Number.isNaN(n)) {
                n = row.min ?? 0;
            }
            let min = row.min;
            const max = row.max;
            if (controlId === "dynamicLoadBlocks") {
                min = 48;
            }
            n = clampNumber(n, min, max, input);
            return n;
        }
        case "range": {
            const input = el as HTMLInputElement;
            let n = parseInt(input.value, 10);
            if (Number.isNaN(n)) {
                n = row.min;
            }
            n = clampNumber(n, row.min, row.max, input);
            const parent = input.parentElement;
            if (parent) {
                parent.setAttribute("aria-label", String(n));
            }
            return n;
        }
        default:
            return undefined;
    }
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

    const row = EDITOR_ROW_BY_ID.get(controlId);
    const el = root.querySelector<HTMLElement>(`[id="${CSS.escape(controlId)}"]`);
    if (!el) {
        return prev;
    }

    if (!row) {
        if (controlId === "readOnly" && el instanceof HTMLInputElement && el.type === "checkbox") {
            return assignByDottedPath(prev, controlId, el.checked);
        }
        if (el instanceof HTMLTextAreaElement) {
            return assignByDottedPath(prev, controlId, el.value);
        }
        if (el instanceof HTMLInputElement && el.type === "checkbox") {
            return assignByDottedPath(prev, controlId, el.checked);
        }
        return prev;
    }

    const value = readDomValue(controlId, row, el);
    if (value === undefined) {
        return prev;
    }
    return assignByDottedPath(prev, controlId, value);
}
