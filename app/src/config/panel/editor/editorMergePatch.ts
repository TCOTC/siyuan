/** 按实心点路径读取配置（与控件 `id` 约定一致） */
import {readDomValueFromEl} from "../readDomControlValue";
import {mergeRecordByDottedPath} from "../../registry/mergeRecordByDottedPath";

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

const EDITOR_CONFIG_PREFIX = "editor.";

function editorRelativePath(controlId: string): string {
    return controlId.startsWith(EDITOR_CONFIG_PREFIX) ? controlId.slice(EDITOR_CONFIG_PREFIX.length) : controlId;
}

/// #if !BROWSER
function collectSpellcheckLanguagesFromDom(root: HTMLElement): string[] {
    const spellcheckLanguagesElement = root.querySelector<HTMLElement>(
        `[id="${CSS.escape("editor.spellcheckLanguages")}"]`
    );
    if (!spellcheckLanguagesElement) {
        return window.siyuan.config.editor.spellcheckLanguages;
    }
    return Array.from(spellcheckLanguagesElement.querySelectorAll(".b3-chip--current")).map(
        (item) => item.textContent || ""
    );
}
/// #endif

/**
 * 基于当前 `window.siyuan.config.editor`，仅根据 **本次变动的控件 `id`** 从 DOM 读取并合并一项。
 * `id` 为完整配置路径（如 `editor.markdown.inlineAsterisk`）；合并到 `IEditor` 时去掉 `editor.` 前缀。
 * 拼写语言 chips 见 `editor.spellcheckLanguages` 分支。
 */
export function mergeEditorFromControlId(root: HTMLElement, controlId: string): Config.IEditor {
    const prev = window.siyuan.config.editor;
    if (!controlId.startsWith(EDITOR_CONFIG_PREFIX)) {
        return prev;
    }

    /// #if !BROWSER
    if (controlId === "editor.spellcheckLanguages") {
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
    const rel = editorRelativePath(controlId);
    return mergeRecordByDottedPath(prev as unknown as Record<string, unknown>, rel, value) as unknown as Config.IEditor;
}
