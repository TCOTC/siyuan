import {mergeRecordByDottedPath} from "../../registry/mergeRecordByDottedPath";
import {readDomValueFromEl} from "../readDomControlValue";

const FILETREE_CONFIG_PREFIX = "fileTree.";

function fileTreeRelativePath(controlId: string): string {
    return controlId.startsWith(FILETREE_CONFIG_PREFIX) ? controlId.slice(FILETREE_CONFIG_PREFIX.length) : controlId;
}

function readFileTreeControlValue(root: HTMLElement, controlId: string, relPath: string): unknown {
    const el = root.querySelector<HTMLElement>(`[id="${CSS.escape(controlId)}"]`);
    if (!el) {
        return undefined;
    }
    if (el instanceof HTMLSelectElement && /SaveBox$/.test(relPath)) {
        return el.value;
    }
    return readDomValueFromEl(el);
}

/** 基于当前 `window.siyuan.config.fileTree`，仅根据本次变动的控件 `id` 从 DOM 读取并合并一项（`id` 形如 `fileTree.xxx`）。 */
export function mergeFiletreeFromControlId(root: HTMLElement, controlId: string): Config.IFileTree {
    const prev = window.siyuan.config.fileTree;
    if (!controlId.startsWith(FILETREE_CONFIG_PREFIX)) {
        return prev;
    }
    const rel = fileTreeRelativePath(controlId);
    const value = readFileTreeControlValue(root, controlId, rel);
    if (value === undefined) {
        return prev;
    }
    return mergeRecordByDottedPath({...prev} as unknown as Record<string, unknown>, rel, value) as unknown as Config.IFileTree;
}
