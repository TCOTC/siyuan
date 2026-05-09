/// #if MOBILE
import {popMenu} from "../mobile/menu";
/// #else
import {applySettingSearchToTab, initConfigSearch} from "./search";
import {Dialog} from "../dialog";
import {Constants} from "../constants";
import {focusByRange} from "../protyle/util/selection";
import {CONFIG_TAB_DEFS, getConfigTabTitle, isConfigTabMenuHidden} from "./tabs";
/// #endif

import type {TConfigTab} from "./types";
import type {App} from "../index";
import {mountConfigTab} from "./mountConfigTab";

/// #if !MOBILE
const switchConfigTab = (dialogElement: HTMLElement, app: App, type: TConfigTab) => {
    const containerElement = dialogElement.querySelector(`.config__tab-container[data-name="${type}"]`) as HTMLElement | null;
    if (!containerElement) {
        return;
    }
    dialogElement.querySelectorAll(".config__tab-container").forEach((container) => {
        container.classList.add("fn__none");
    });
    dialogElement.querySelector(".config__side .b3-list-item.b3-list-item--focus")?.classList.remove("b3-list-item--focus");
    dialogElement.querySelector(`.config__side .b3-list-item[data-name="${type}"]`)?.classList.add("b3-list-item--focus");
    containerElement.classList.remove("fn__none");
    if (containerElement.innerHTML === "") {
        mountConfigTab(type, containerElement, app);
    }
};

const genConfigTabListHTML = (activeTab: TConfigTab) => CONFIG_TAB_DEFS.map(def => {
    const hidden = isConfigTabMenuHidden(def.id) ? " fn__none" : "";
    const focus = def.id === activeTab ? " b3-list-item--focus" : "";
    return `<li data-name="${def.id}" class="b3-list-item${focus}${hidden}"><svg class="b3-list-item__graphic"><use xlink:href="#${def.icon}"></use></svg><span class="b3-list-item__text">${getConfigTabTitle(def.id)}</span></li>`;
}).join("");

const genConfigTabPanelsHTML = (activeTab: TConfigTab) => CONFIG_TAB_DEFS.map(def => {
    const none = def.id === activeTab ? "" : " fn__none";
    const extra = def.panelExtraClass ? ` ${def.panelExtraClass}` : "";
    const style = def.panelStyle ? ` style="${def.panelStyle}"` : "";
    return `      <div class="config__tab-container${none}${extra}" data-name="${def.id}"${style}></div>`;
}).join("\n");

const openSettingDialog = (app: App, initialTab: TConfigTab = "editor") => {
    const exitDialog = window.siyuan.dialogs.find((item) => {
        if (item.element.querySelector(".config__tab-container")) {
            item.destroy();
            return true;
        }
    });
    if (exitDialog) {
        return exitDialog;
    }
    let range: Range;
    if (getSelection().rangeCount > 0) {
        range = getSelection().getRangeAt(0);
    }
    const dialog = new Dialog({
        content: `<div class="fn__flex-1 fn__flex config__panel" style="overflow: hidden;position: relative">
    <div class="config__side b3-list b3-list--background">
        <div class="config__tab-head">
            <div class="config__tab-title resize__move">
                <svg class="b3-list-item__graphic"><use xlink:href="#iconSettings"></use></svg>
                <span class="b3-list-item__text">${window.siyuan.languages.config}</span>
            </div>
            <div class="b3-form__icon">
                <svg class="b3-form__icon-icon"><use xlink:href="#iconSearch"></use></svg>
                <input placeholder="${window.siyuan.languages.search}" class="b3-text-field fn__block b3-form__icon-input">
            </div>
            <div class="config__tab-hr"></div>
        </div>
        <ul class="config__tab-scroll">
            ${genConfigTabListHTML(initialTab)}
        </ul>
    </div>
    <div class="config__tab-wrap">
        <div class="fn__hr--b resize__move"></div>
        ${genConfigTabPanelsHTML(initialTab)}
        <div class="fn__hr--b"></div>
    </div>
</div>`,
        width: "90vw",
        height: "90vh",
        destroyCallback() {
            if (range) {
                focusByRange(range);
            }
        },
    });
    dialog.element.setAttribute("data-key", Constants.DIALOG_SETTING);

    initConfigSearch(dialog.element, app, switchConfigTab);
    (dialog.element.querySelector(".b3-dialog__container") as HTMLElement).style.maxWidth = "1280px";
    dialog.element.querySelectorAll(".config__side .b3-list-item").forEach(item => {
        item.addEventListener("click", () => {
            const type = item.getAttribute("data-name") as TConfigTab;
            switchConfigTab(dialog.element, app, type);
            applySettingSearchToTab(dialog.element, app, type);
        });
    });
    switchConfigTab(dialog.element, app, initialTab);
    applySettingSearchToTab(dialog.element, app, initialTab);
    return dialog;
};
/// #endif

export const openSetting = (app: App, tab?: TConfigTab) => {
    /// #if MOBILE
    popMenu();
    /// #else
    return openSettingDialog(app, tab);
    /// #endif
};
