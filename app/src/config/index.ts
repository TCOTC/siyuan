/// #if MOBILE
import {popMenu} from "../mobile/menu";
/// #else
import {initConfigSearch, switchConfigTab} from "./search/dialog";
import {bindSettingSaveDelegation} from "./registry/save";
import {Dialog} from "../dialog";
import {Constants} from "../constants";
import {focusByRange} from "../protyle/util/selection";
import {getConfigTabDefs} from "./registry/tabs";
/// #endif
import type {TConfigTab} from "./registry/tabs";
import type {App} from "../index";

/// #if !MOBILE
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
    const tabListItems: string[] = [];
    const tabPanels: string[] = [];
    for (const def of getConfigTabDefs()) {
        const isActive = def.id === initialTab;
        tabListItems.push(`<li data-name="${def.id}" class="b3-list-item${isActive ? " b3-list-item--focus" : ""}${def.hidden ? " fn__none" : ""}"><svg class="b3-list-item__graphic"><use xlink:href="#${def.icon}"></use></svg><span class="b3-list-item__text">${def.title}</span></li>`);
        tabPanels.push(`<div class="config__tab-container${isActive ? "" : " fn__none"}" data-name="${def.id}"></div>`);
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
            ${tabListItems.join("")}
        </ul>
    </div>
    <div class="config__tab-wrap">
        ${tabPanels.join("")}
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

    const tabWrap = dialog.element.querySelector(".config__tab-wrap") as HTMLElement;
    bindSettingSaveDelegation(tabWrap);
    initConfigSearch(dialog.element, app);
    (dialog.element.querySelector(".b3-dialog__container") as HTMLElement).style.maxWidth = "1280px";
    dialog.element.querySelectorAll(".config__side .b3-list-item").forEach(item => {
        item.addEventListener("click", () => {
            const tabId = item.getAttribute("data-name") as TConfigTab;
            switchConfigTab(dialog.element, app, tabId);
        });
    });
    switchConfigTab(dialog.element, app, initialTab);
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
