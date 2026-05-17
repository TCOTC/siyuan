import {appearance} from "../appearance";
import {editor} from "../editor";
import {file} from "../file";
import {flashcard} from "../flashcard";
import {ai} from "../ai";
import type {SettingBindApi, SettingSection} from "./settingRows";
import {bindPasswordIconaToggle} from "./render";

const routedNamespaces = new Set(["editor", "fileTree", "appearance", "flashcard", "ai"]);

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
    switch (ns) {
        case "editor":
            editor.set(root, controlId, sections);
            break;
        case "fileTree":
            file.set(root, controlId, sections);
            break;
        case "appearance":
            appearance.set(root, controlId, sections);
            break;
        case "flashcard":
            flashcard.set(root, controlId, sections);
            break;
        case "ai":
            ai.set(root, controlId, sections);
            break;
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
                const el = root.querySelector<HTMLInputElement>(`#${CSS.escape(row.pathId)}`);
                if (el) {
                    el.value = row.getPathValue();
                }
            } else if (row.type === "textBlock" && row.mode === "input-password") {
                bindPasswordIconaToggle(root, row.id);
            }
        }
    }
    root.querySelectorAll("input, select, textarea").forEach((item) => {
        item.addEventListener("change", () => {
            routeSave(item.id);
        });
    });
};
