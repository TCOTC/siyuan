import {appearance} from "../appearance";
import {editor} from "../editor";
import {file} from "../file";
import type {SettingBindApi, SettingSection} from "./settingRows";

const routedNamespaces = new Set(["editor", "fileTree", "appearance"]);

export const routeSettingSave = (
    root: HTMLElement,
    controlId: string,
    sections: SettingSection[]
) => {
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
    // 同一个接口的配置放在不同的标签页中，要派发给不同的方法来处理
    if (ns === "editor") {
        editor.set(root, controlId, sections);
    } else if (ns === "fileTree") {
        file.set(root, controlId, sections);
    } else {
        appearance.set(root, controlId, sections);
    }
};

export const mountSettingSaveHandlers = async (root: HTMLElement, sections: SettingSection[]): Promise<void> => {
    const routeSave = (controlId: string) => routeSettingSave(root, controlId, sections);
    for (const section of sections) {
        for (const row of section.items) {
            if ("bind" in row && row.bind) {
                await row.bind({root, routeSave} as SettingBindApi);
            } else if (row.type === "stack") {
                for (const line of row.lines) {
                    const {right} = line;
                    if (right && "bind" in right && right.bind) {
                        await right.bind({root, routeSave} as SettingBindApi);
                    }
                }
            } else if (row.type === "notebookSavePath") {
                const el = root.querySelector<HTMLInputElement>(`[id="${CSS.escape(row.pathId)}"]`);
                if (el) {
                    el.value = row.getPathValue();
                }
            }
        }
    }
    root.querySelectorAll("input, select").forEach((item) => {
        item.addEventListener("change", () => {
            routeSave(item.id);
        });
    });
};
