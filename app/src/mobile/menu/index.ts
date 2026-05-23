import {popSearch} from "./search";
import {closePanel} from "../util/closePanel";
import {mountHelp, newDailyNote, newNotebook} from "../../util/mount";
import {access} from "../../config/access";
import {exitSiYuan, lockScreen, processSync} from "../../dialog/processSystem";
import {openHistory} from "../../history/history";
import {syncGuide} from "../../sync/syncGuide";
import {openCard} from "../../card/openCard";
import {activeBlur} from "../util/keyboardToolbar";
import {openModel} from "./model";
import {getRecentDocs} from "./getRecentDocs";
import {App} from "../../index";
import {isInMobileApp, isIPhone} from "../../protyle/util/compatibility";
import {newFile} from "../../util/newFile";
import {afterLoadPlugin} from "../../plugin/loader";
import {commandPanel} from "../../boot/globalEvent/command/panel";
import {openTopBarMenu} from "../../plugin/openTopBarMenu";
import {getConfigTabDefs, configTabToMenuId, isConfigTabMenuHidden} from "../../config/tabs";
import type {TConfigTab} from "../../config/types";
import {openMobileConfigTab} from "./openConfigTab";
import {getCurrentEditor} from "../editor";

const getConfigTabFromMenuTarget = (target: HTMLElement): TConfigTab | undefined => {
    const item = target.closest(".b3-menu__item") as HTMLElement | null;
    if (!item?.id) {
        return undefined;
    }
    return getConfigTabDefs().find(def => configTabToMenuId(def.id) === item.id)?.id;
};

export const popMenu = () => {
    if (getCurrentEditor()?.protyle.toolbar.isMultiSelectMode()) {
        return;
    }
    activeBlur();
    document.getElementById("menu").style.transform = "translateX(0px)";
};

export const initRightMenu = (app: App) => {
    const menuElement = document.getElementById("menu");
    const configSettingsMenuHTML = getConfigTabDefs().filter(def => !isConfigTabMenuHidden(def.id)).map(def =>
        `<div class="b3-menu__item" id="${configTabToMenuId(def.id)}">
        <svg class="b3-menu__icon"><use xlink:href="#${def.icon}"></use></svg>
        <span class="b3-menu__label">${def.title}</span>
    </div>`).join("");

    menuElement.innerHTML = `<div class="b3-menu__title">
    <svg class="b3-menu__icon"><use xlink:href="#iconLeft"></use></svg>
    <span class="b3-menu__label">${window.siyuan.languages.back}</span>
</div>
<div class="b3-menu__items">
    <div id="menuRecent" class="b3-menu__item">
        <svg class="b3-menu__icon"><use xlink:href="#iconList"></use></svg><span class="b3-menu__label">${window.siyuan.languages.recentDocs}</span>
    </div>
    <div id="menuSearch" class="b3-menu__item">
        <svg class="b3-menu__icon"><use xlink:href="#iconSearch"></use></svg><span class="b3-menu__label">${window.siyuan.languages.search}</span>
    </div>
    <div id="menuCommand" class="b3-menu__item">
        <svg class="b3-menu__icon"><use xlink:href="#iconTerminal"></use></svg><span class="b3-menu__label">${window.siyuan.languages.commandPanel}</span>
    </div>
    <div class="b3-menu__item${window.siyuan.config.readonly ? " fn__none" : ""}" id="menuSyncNow">
        <svg class="b3-menu__icon"><use xlink:href="#iconCloudSucc"></use></svg><span class="b3-menu__label">${window.siyuan.languages.syncNow}</span>
    </div>
    <div class="b3-menu__item${window.siyuan.config.readonly ? " fn__none" : ""}" id="menuNewDoc">
        <svg class="b3-menu__icon"><use xlink:href="#iconFile"></use></svg><span class="b3-menu__label">${window.siyuan.languages.newFile}</span>
    </div>
    <div class="b3-menu__item${window.siyuan.config.readonly ? " fn__none" : ""}" id="menuNewNotebook">
        <svg class="b3-menu__icon"><use xlink:href="#iconNewNoteBook"></use></svg><span class="b3-menu__label">${window.siyuan.languages.newNotebook}</span>
    </div>
    <div class="b3-menu__separator"></div>
    <div id="menuNewDaily" class="b3-menu__item${window.siyuan.config.readonly ? " fn__none" : ""}">
        <svg class="b3-menu__icon"><use xlink:href="#iconCalendar"></use></svg><span class="b3-menu__label">${window.siyuan.languages.dailyNote}</span>
    </div>
    <div id="menuCard" class="b3-menu__item${window.siyuan.config.readonly ? " fn__none" : ""}">
        <svg class="b3-menu__icon"><use xlink:href="#iconRiffCard"></use></svg><span class="b3-menu__label">${window.siyuan.languages.spaceRepetition}</span>
    </div>
    <div class="b3-menu__item${window.siyuan.config.readonly ? " fn__none" : ""}" id="menuLock">
        <svg class="b3-menu__icon"><use xlink:href="#iconLock"></use></svg><span class="b3-menu__label">${window.siyuan.languages.lockScreen}</span>
    </div>
    <div class="b3-menu__item${window.siyuan.config.readonly ? " fn__none" : ""}" id="menuHistory">
        <svg class="b3-menu__icon"><use xlink:href="#iconHistory"></use></svg><span class="b3-menu__label">${window.siyuan.languages.dataHistory}</span>
    </div>
    <div class="b3-menu__separator${isInMobileApp() ? "" : " fn__none"}"></div>
    <div class="b3-menu__item b3-menu__item--warning${isInMobileApp() ? "" : " fn__none"}" id="menuSafeQuit">
        <svg class="b3-menu__icon"><use xlink:href="#iconQuit"></use></svg><span class="b3-menu__label">${window.siyuan.languages.safeQuit}</span>
    </div>
    <div class="b3-menu__separator"></div>
    ${configSettingsMenuHTML}
    <div class="b3-menu__item${window.siyuan.config.readonly ? " fn__none" : ""}" id="menuPublish">
        <svg class="b3-menu__icon"><use xlink:href="#iconPublish"></use></svg><span class="b3-menu__label">${window.siyuan.languages.publish}</span>
    </div>
    <div class="b3-menu__item" id="menuPlugin">
        <svg class="b3-menu__icon"><use xlink:href="#iconPlugin"></use></svg><span class="b3-menu__label">${window.siyuan.languages.plugin}</span>
    </div>
    <div class="b3-menu__separator"></div>
    <div class="b3-menu__item${(isIPhone() || window.siyuan.config.readonly) ? " fn__none" : ""}" id="menuHelp">
        <svg class="b3-menu__icon"><use xlink:href="#iconHelp"></use></svg><span class="b3-menu__label">${window.siyuan.languages.userGuide}</span>
    </div>
    <a class="b3-menu__item" href="${"zh_CN" === window.siyuan.config.lang || "zh_CHT" === window.siyuan.config.lang ? "https://ld246.com/article/1649901726096" : "https://liuyun.io/article/1686530886208"}" target="_blank">
        <svg class="b3-menu__icon"><use xlink:href="#iconFeedback"></use></svg>
        <span class="b3-menu__label">${window.siyuan.languages.feedback}</span>
    </a>
</div>`;
    processSync();
    app.plugins.forEach(item => {
        afterLoadPlugin(item);
    });
    // 只能用 click，否则无法上下滚动 https://github.com/siyuan-note/siyuan/issues/6628
    menuElement.addEventListener("click", (event) => {
        let target = event.target as HTMLElement;
        let configTab: TConfigTab | undefined;
        while (target && !target.isEqualNode(menuElement)) {
            if (target.classList.contains("b3-menu__title")) {
                closePanel();
                event.preventDefault();
                event.stopPropagation();
                break;
            } else if (target.id === "menuRecent") {
                getRecentDocs(app);
                event.preventDefault();
                event.stopPropagation();
                break;
            } else if (target.id === "menuSearch") {
                popSearch(app);
                event.preventDefault();
                event.stopPropagation();
                break;
            } else if (target.id === "menuCommand") {
                closePanel();
                commandPanel(app);
                event.preventDefault();
                event.stopPropagation();
                break;
            } else if (target.id === "menuSyncNow") {
                syncGuide();
                event.preventDefault();
                event.stopPropagation();
                break;
            } else if (target.id === "menuNewDoc") {
                newFile({
                    app,
                    useSavePath: true
                });
                closePanel();
                event.preventDefault();
                event.stopPropagation();
                break;
            } else if (target.id === "menuNewNotebook") {
                newNotebook();
                closePanel();
                event.preventDefault();
                event.stopPropagation();
                break;
            } else if (target.id === "menuNewDaily") {
                newDailyNote(app);
                closePanel();
                event.preventDefault();
                event.stopPropagation();
                break;
            } else if (target.id === "menuCard") {
                openCard(app);
                closePanel();
                event.preventDefault();
                event.stopPropagation();
                break;
            } else if (target.id === "menuLock") {
                lockScreen(app);
                event.preventDefault();
                event.stopPropagation();
                break;
            } else if (target.id === "menuHistory") {
                openHistory(app);
                event.preventDefault();
                event.stopPropagation();
                break;
            } else if (target.id === "menuSafeQuit") {
                event.preventDefault();
                event.stopPropagation();
                exitSiYuan();
                break;
            } else if ((configTab = getConfigTabFromMenuTarget(target))) {
                openMobileConfigTab(configTab, app);
                event.preventDefault();
                event.stopPropagation();
                break;
            } else if (target.id === "menuPublish") {
                openModel({
                    title: window.siyuan.languages.publish,
                    icon: "iconPublish",
                    html: access.genPublishHTML(),
                    bindEvent(modelMainElement: HTMLElement) {
                        access.bindPublishEvent(modelMainElement);
                    }
                });
                event.preventDefault();
                event.stopPropagation();
                break;
            } else if (target.id === "menuPlugin") {
                openTopBarMenu(app);
                event.preventDefault();
                event.stopPropagation();
                break;
            } else if (target.id === "menuHelp") {
                mountHelp();
                event.preventDefault();
                event.stopPropagation();
                break;
            }
            target = target.parentElement;
        }
    });
};
