import {editorSettings} from "../editor";
import {fileSettings} from "../file";
import {appearanceSettings} from "../appearance";
import {flashcardSettings} from "../flashcard";
import {aiSettings} from "../ai";
import {exportSettings} from "../export";
import type {SettingSection} from "./settingRows";
import {bindPasswordIconaToggle} from "./render";

const routedNamespaces = new Set(["editor", "fileTree", "appearance", "flashcard", "ai", "export"]);

const settingSaveBoundWraps = new WeakSet<HTMLElement>();

export const bindSettingSaveDelegation = (tabWrap: HTMLElement) => {
    if (settingSaveBoundWraps.has(tabWrap)) {
        return;
    }
    settingSaveBoundWraps.add(tabWrap);
    tabWrap.addEventListener("change", onSettingTabWrapChange);
};

const onSettingTabWrapChange = (event: Event) => {
    const el = event.target;
    if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement)) {
        return;
    }
    if (!el.id) {
        return;
    }
    routeSettingSave(el, el.id);
};

export const routeSettingSave = (el: HTMLElement, controlId: string) => {
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
            editorSettings.set(el, controlId);
            break;
        case "fileTree":
            fileSettings.set(el, controlId);
            break;
        case "appearance":
            appearanceSettings.set(el, controlId);
            break;
        case "flashcard":
            flashcardSettings.set(el, controlId);
            break;
        case "ai":
            aiSettings.set(el, controlId);
            break;
        case "export":
            exportSettings.set(el, controlId);
            break;
    }
};

export const mountSettingSaveHandlers = async (root: HTMLElement, sections: SettingSection[]): Promise<void> => {
    for (const section of sections) {
        for (const row of section.items) {
            if ("bind" in row && row.bind) {
                await row.bind(root);
            } else if (row.type === "stack") {
                for (const line of row.lines) {
                    const {left, right} = line;
                    if (left.kind === "textBlock" && left.mode === "input-password") {
                        bindPasswordIconaToggle(root, left.id);
                    }
                    if (right && "bind" in right && right.bind) {
                        await right.bind(root);
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
};
