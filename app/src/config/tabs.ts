import type {TConfigTab} from "./types";
import {isHuawei, isInHarmony} from "../protyle/util/compatibility";
import {isMobile} from "../util/functions";

/** 移动端侧栏中设置标签页菜单项的 DOM `id` */
export const configTabToMenuId = (tabId: TConfigTab): string =>
    "menuConfig" + tabId[0].toUpperCase() + tabId.slice(1);

export interface IConfigTabDef {
    id: TConfigTab;
    icon: string;
    title: string;
    hidden?: boolean;
}

let configTabDefsCache: IConfigTabDef[] | undefined;

export const getConfigTabDefs = (): IConfigTabDef[] => {
    if (configTabDefsCache) {
        return configTabDefsCache;
    }
    configTabDefsCache = [
        {id: "editor", icon: "iconEdit", title: window.siyuan.languages.editor},
        {id: "file", icon: "iconFiles", title: window.siyuan.languages.fileTree},
        {id: "appearance", icon: "iconTheme", title: window.siyuan.languages.appearance},
        {id: "bazaar", icon: "iconBazaar", title: window.siyuan.languages.bazaar, hidden: !!(isMobile() || isHuawei() || isInHarmony())},
        {id: "flashcard", icon: "iconRiffCard", title: window.siyuan.languages.riffCard},
        {id: "ai", icon: "iconSparkles", title: window.siyuan.languages.ai},
        {id: "assets", icon: "iconImage", title: window.siyuan.languages.assets},
        {id: "export", icon: "iconUpload", title: window.siyuan.languages.export},
        {id: "search", icon: "iconSearch", title: window.siyuan.languages.search},
        {id: "keymap", icon: "iconKeymap", title: window.siyuan.languages.keymap},
        {id: "sync", icon: "iconCloud", title: window.siyuan.languages.accountSync},
        {id: "access", icon: "iconLock", title: window.siyuan.languages.authentication},
        {id: "app", icon: "iconSiYuan", title: window.siyuan.languages.application}, // TODO 添加新图标
        {id: "about", icon: "iconInfo", title: window.siyuan.languages.about},
    ];
    return configTabDefsCache;
};