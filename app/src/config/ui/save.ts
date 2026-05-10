import {editor} from "../editor";
import {file} from "../file";
import type {SettingBindApi, SettingSection} from "./types";

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
        editor.send(root, controlId);
    } else {
        file.send(root, controlId);
    }
};

/**
 * 设置 Tab 在写入 `innerHTML` 之后：为 `custom.bind` 提供 `scheduleSave`，并为 `input` / `select` 挂上 `change` → `scheduleSettingSave`。
 */
export const mountScheduleSettingSave = async (root: HTMLElement, sections: SettingSection[]): Promise<void> => {
    const scheduleSave = (controlId: string) => scheduleSettingSave(root, controlId);
    for (const section of sections) {
        for (const row of section.items) {
            if (row.type === "custom" && row.bind) {
                await row.bind({root, scheduleSave} satisfies SettingBindApi);
            }
        }
    }
    root.querySelectorAll("input, select").forEach((item) => {
        item.addEventListener("change", () => {
            scheduleSave(item.id);
        });
    });
};
