import type {App} from "../index";
import type {TConfigTab} from "./types";
import {editor} from "./editor";
import {about} from "./about";
import {appearance} from "./appearance";
import {assets} from "./assets";
import {exportConfig} from "./exportConfig";
import {file} from "./file";
import {keymap} from "./keymap";
import {bazaar} from "./bazaar";
import {searchConfig} from "./searchConfig";
import {sync} from "./sync";
import {access} from "./access";
import {appConfig} from "./appConfig";
import {ai} from "./ai";
import {flashcard} from "./flashcard";

/** 将指定设置页面挂载到容器 */
export const mountConfigTab = (type: TConfigTab, containerElement: Element, app: App) => {
    switch (type) {
        case "editor":
            void editor.mount(containerElement as HTMLElement);
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
