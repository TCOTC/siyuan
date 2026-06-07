import type {App} from "../index";
import type {TConfigTab} from "./types";
import {editorSettings} from "./editor";
import {fileSettings} from "./file";
import {appearanceSettings} from "./appearance";
import {flashcardSettings} from "./flashcard";
import {aiSettings} from "./ai";
import {exportSettings} from "./export";
import {searchSettings} from "./searchSettings";
import {assets} from "./assets";
import {keymapSettings} from "./keymap";
import {bazaar} from "./bazaar";
import {syncSettings} from "./sync";
import {accessSettings} from "./access";
import {appSettings} from "./app";
import {aboutSettings} from "./about";

/** 将指定设置页面挂载到容器 */
export const mountConfigTab = (type: TConfigTab, containerElement: Element, app: App) => {
    // TODO containerElement 上不应该绑定事件，待检查
    switch (type) {
        case "editor":
            void editorSettings.mount(containerElement as HTMLElement);
            break;
        case "file":
            void fileSettings.mount(containerElement as HTMLElement);
            break;
        case "appearance":
            void appearanceSettings.mount(containerElement as HTMLElement);
            break;
        case "bazaar":
            bazaar.element = containerElement;
            containerElement.innerHTML = bazaar.genHTML();
            bazaar.bindEvent(app);
            break;
        case "flashcard":
            void flashcardSettings.mount(containerElement as HTMLElement);
            break;
        case "ai":
            void aiSettings.mount(containerElement as HTMLElement);
            break;
        case "assets":
            assets.element = containerElement;
            containerElement.innerHTML = assets.genHTML();
            assets.bindEvent(app);
            break;
        case "export":
            void exportSettings.mount(containerElement as HTMLElement);
            break;
        case "search":
            void searchSettings.mount(containerElement as HTMLElement);
            break;
        case "keymap":
            void keymapSettings.mount(containerElement as HTMLElement);
            break;
        case "sync":
            void syncSettings.mount(containerElement as HTMLElement);
            break;
        case "access":
            void accessSettings.mount(containerElement as HTMLElement);
            break;
        case "app":
            void appSettings.mount(containerElement as HTMLElement);
            break;
        case "about":
            void aboutSettings.mount(containerElement as HTMLElement);
            break;
    }
};
