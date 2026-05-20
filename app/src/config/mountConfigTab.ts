import type {App} from "../index";
import type {TConfigTab} from "./types";
import {editorSettings} from "./editor";
import {fileSettings} from "./file";
import {appearanceSettings} from "./appearance";
import {flashcardSettings} from "./flashcard";
import {aiSettings} from "./ai";
import {exportSettings} from "./export";
import {assets} from "./assets";
import {keymap} from "./keymap";
import {bazaar} from "./bazaar";
import {searchConfig} from "./searchConfig";
import {sync} from "./sync";
import {access} from "./access";
import {appConfig} from "./appConfig";
import {about} from "./about";

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
