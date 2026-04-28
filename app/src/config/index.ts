/// #if MOBILE
import {popMenu} from "../mobile/menu";
/// #else
import type {TConfigTab} from "./types";
import {editor} from "./editor";
import {about} from "./about";
import {appearance} from "./appearance";
import {assets} from "./assets";
import {initConfigSearch} from "./search";
import {file} from "./file";
import {exportConfig} from "./exportConfig";
import {keymap} from "./keymap";
import {bazaar} from "./bazaar";
import {searchConfig} from "./searchConfig";
import {sync} from "./sync";
import {access} from "./access";
import {appConfig} from "./appConfig";
import {Dialog} from "../dialog";
import {ai} from "./ai";
import {flashcard} from "./flashcard";
import {App} from "../index";
import {isHuawei, isInHarmony} from "../protyle/util/compatibility";
import {Constants} from "../constants";
import {focusByRange} from "../protyle/util/selection";
/// #endif


export const genItemPanel = (type: TConfigTab, containerElement: Element, app: App) => {
    switch (type) {
        case "editor":
            break;
        case "file":
            file.element = containerElement;
            containerElement.innerHTML = file.genHTML();
            file.bindEvent();
            break;
        case "appearance":
            appearance.element = containerElement;
            containerElement.innerHTML = appearance.genHTML();
            appearance.bindEvent();
            break;
        case "bazaar":
            bazaar.element = containerElement;
            containerElement.innerHTML = bazaar.genHTML();
            bazaar.bindEvent(app);
            break;
        case "flashcard":
            flashcard.element = containerElement;
            containerElement.innerHTML = flashcard.genHTML();
            flashcard.bindEvent();
            break;
        case "ai":
            ai.element = containerElement;
            containerElement.innerHTML = ai.genHTML();
            ai.bindEvent();
            break;
        case "assets":
            assets.element = containerElement;
            containerElement.innerHTML = assets.genHTML();
            assets.bindEvent(app);
            break;
        case "export":
            exportConfig.element = containerElement;
            containerElement.innerHTML = exportConfig.genHTML();
            exportConfig.bindEvent();
            break;
        case "search":
            searchConfig.element = containerElement;
            containerElement.innerHTML = searchConfig.genHTML();
            searchConfig.bindEvent();
            break;
        case "keymap":
            keymap.element = containerElement;
            containerElement.innerHTML = keymap.genHTML(app);
            keymap.bindEvent(app);
            break;
        case "sync":
            sync.element = containerElement;
            containerElement.innerHTML = sync.genHTML();
            sync.bindEvent();
            break;
        case "access":
            access.element = containerElement;
            containerElement.innerHTML = access.genHTML();
            access.bindEvent();
            break;
        case "app":
            appConfig.element = containerElement;
            containerElement.innerHTML = appConfig.genHTML();
            appConfig.bindEvent();
            break;
        case "about":
            about.element = containerElement;
            containerElement.innerHTML = about.genAboutHTML();
            about.bindEvent();
            break;
    }
};

export const openSetting = (app: App) => {
    /// #if MOBILE
    popMenu();
    /// #else
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
  <div class="b3-tab-bar b3-list b3-list--background">
    <div class="config__tab-head">
        <div class="config__tab-title resize__move">
            <svg class="b3-list-item__graphic"><use xlink:href="#iconSettings"></use></svg>
            <span class="b3-list-item__text">${window.siyuan.languages.config}</span>
        </div>
        <div class="b3-form__icon"><svg class="b3-form__icon-icon"><use xlink:href="#iconSearch"></use></svg><input placeholder="${window.siyuan.languages.search}" class="b3-text-field fn__block b3-form__icon-input"></div>
        <div class="config__tab-hr"></div>
    </div>
    <ul class="config__tab-scroll">
        <li data-name="editor" class="b3-list-item--focus b3-list-item"><svg class="b3-list-item__graphic"><use xlink:href="#iconEdit"></use></svg><span class="b3-list-item__text">${window.siyuan.languages.editor}</span></li>
        <li data-name="file" class="b3-list-item"><svg class="b3-list-item__graphic"><use xlink:href="#iconFiles"></use></svg><span class="b3-list-item__text">${window.siyuan.languages.fileTree}</span></li>
        <li data-name="appearance" class="b3-list-item"><svg class="b3-list-item__graphic"><use xlink:href="#iconTheme"></use></svg><span class="b3-list-item__text">${window.siyuan.languages.appearance}</span></li>
        <li data-name="bazaar" class="b3-list-item${isHuawei() || isInHarmony() ? " fn__none" : ""}"><svg class="b3-list-item__graphic"><use xlink:href="#iconBazaar"></use></svg><span class="b3-list-item__text">${window.siyuan.languages.bazaar}</span></li>
        <li data-name="flashcard" class="b3-list-item"><svg class="b3-list-item__graphic"><use xlink:href="#iconRiffCard"></use></svg><span class="b3-list-item__text">${window.siyuan.languages.riffCard}</span></li>
        <li data-name="ai" class="b3-list-item"><svg class="b3-list-item__graphic"><use xlink:href="#iconSparkles"></use></svg><span class="b3-list-item__text">${window.siyuan.languages.ai}</span></li>
        <li data-name="assets" class="b3-list-item"><svg class="b3-list-item__graphic"><use xlink:href="#iconImage"></use></svg><span class="b3-list-item__text">${window.siyuan.languages.assets}</span></li>
        <li data-name="export" class="b3-list-item"><svg class="b3-list-item__graphic"><use xlink:href="#iconUpload"></use></svg><span class="b3-list-item__text">${window.siyuan.languages.export}</span></li>
        <li data-name="search" class="b3-list-item"><svg class="b3-list-item__graphic"><use xlink:href="#iconSearch"></use></svg><span class="b3-list-item__text">${window.siyuan.languages.search}</span></li>
        <li data-name="keymap" class="b3-list-item"><svg class="b3-list-item__graphic"><use xlink:href="#iconKeymap"></use></svg><span class="b3-list-item__text">${window.siyuan.languages.keymap}</span></li>
        <li data-name="sync" class="b3-list-item"><svg class="b3-list-item__graphic"><use xlink:href="#iconCloud"></use></svg><span class="b3-list-item__text">${window.siyuan.languages.configGroupAccountSync}</span></li>
        <li data-name="access" class="b3-list-item"><svg class="b3-list-item__graphic"><use xlink:href="#iconLock"></use></svg><span class="b3-list-item__text">${window.siyuan.languages.configGroupAuthentication}</span></li>
        <li data-name="app" class="b3-list-item"><svg class="b3-list-item__graphic"><use xlink:href="#iconSettings"></use></svg><span class="b3-list-item__text">${window.siyuan.languages.configGroupApp}</span></li>
        <li data-name="about" class="b3-list-item"><svg class="b3-list-item__graphic"><use xlink:href="#iconInfo"></use></svg><span class="b3-list-item__text">${window.siyuan.languages.about}</span></li>
    </ul>
  </div>
  <div class="config__tab-wrap">
      <div class="fn__hr--b resize__move"></div>
      <div class="config__tab-container" data-name="editor">${editor.genHTML()}</div>
      <div class="config__tab-container fn__none" data-name="file"></div>
      <div class="config__tab-container fn__none" data-name="appearance"></div>
      <div class="config__tab-container config__tab-container--top fn__none" data-name="bazaar"></div>
      <div class="config__tab-container fn__none" data-name="flashcard"></div>
      <div class="config__tab-container fn__none" data-name="ai"></div>
      <div class="config__tab-container config__tab-container--top fn__none" data-name="assets"></div>
      <div class="config__tab-container fn__none" data-name="export"></div>
      <div class="config__tab-container fn__none" data-name="search"></div>
      <div class="config__tab-container fn__none" style="overflow: scroll" data-name="keymap"></div>
      <div class="config__tab-container config__tab-container--full fn__none" data-name="sync"></div>
      <div class="config__tab-container fn__none" data-name="access"></div>
      <div class="config__tab-container fn__none" data-name="app"></div>
      <div class="config__tab-container fn__none" data-name="about"></div>
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

    initConfigSearch(dialog.element, app);
    (dialog.element.querySelector(".b3-dialog__container") as HTMLElement).style.maxWidth = "1280px";
    dialog.element.querySelectorAll(".b3-tab-bar .b3-list-item").forEach(item => {
        item.addEventListener("click", () => {
            const type = item.getAttribute("data-name") as TConfigTab;
            const containerElement = dialog.element.querySelector(`.config__tab-container[data-name="${type}"]`);
            dialog.element.querySelectorAll(".config__tab-container").forEach((container) => {
                container.classList.add("fn__none");
            });
            dialog.element.querySelector(".b3-tab-bar .b3-list-item.b3-list-item--focus").classList.remove("b3-list-item--focus");
            item.classList.add("b3-list-item--focus");
            containerElement.classList.remove("fn__none");
            if (containerElement.innerHTML === "" || type === "sync" || type === "bazaar") {
                genItemPanel(type, containerElement, app);
            }
        });
    });
    editor.element = dialog.element.querySelector('.config__tab-container[data-name="editor"]');
    editor.bindEvent();
    return dialog;
    /// #endif
};