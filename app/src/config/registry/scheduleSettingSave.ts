import {sendEditorSettingFromControl} from "../panel/editor/sendEditorSetting";
import {sendFiletreeSettingFromControl} from "../panel/file/sendFiletreeSetting";

const routedNamespaces = new Set(["editor", "fileTree"]);

/**
 * 按控件 `id` 的首段命名空间分发保存；仅处理带 `.` 且为已知命名空间的 `id`。
 * 未匹配的 `id` 不执行任何操作（其它 Tab 仍用各自 `scheduleSave` 直至迁完）。
 */
export const scheduleSettingSave = (root: HTMLElement, controlId: string) => {
    if (!controlId) {
        return;
    }
    const dot = controlId.indexOf(".");
    if (dot <= 0) {
        return;
    }
    const ns = controlId.slice(0, dot);
    if (!routedNamespaces.has(ns)) {
        return;
    }
    if (ns === "editor") {
        sendEditorSettingFromControl(root, controlId);
    } else {
        sendFiletreeSettingFromControl(root, controlId);
    }
};
