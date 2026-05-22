import type {TConfigTab} from "./types";
import {isHuawei, isInHarmony} from "../protyle/util/compatibility";

/** 移动端侧栏中设置标签页菜单项的 DOM `id` */
export const configTabToMenuId = (tabId: TConfigTab): string =>
    "menuConfig" + tabId[0].toUpperCase() + tabId.slice(1);

export interface IConfigTabDef {
    id: TConfigTab;
    icon: string;
    /** 隐藏标签页 */
    hidden?: boolean;
    /** `.config__tab-container` 的附加类名 */
    panelExtraClass?: string;
    /** `.config__tab-container` 的行内样式 */
    panelStyle?: string;
}

let configTabDefsCache: IConfigTabDef[] | undefined;

export const getConfigTabDefs = (): IConfigTabDef[] => {
    if (!configTabDefsCache) {
        configTabDefsCache = [
            {id: "editor", icon: "iconEdit"},
            {id: "file", icon: "iconFiles"},
            {id: "appearance", icon: "iconTheme"},
            {id: "bazaar", icon: "iconBazaar", hidden: !!(isHuawei() || isInHarmony()), panelExtraClass: "config__tab-container--top"},
            {id: "flashcard", icon: "iconRiffCard"},
            {id: "ai", icon: "iconSparkles"},
            {id: "assets", icon: "iconImage", panelExtraClass: "config__tab-container--top"},
            {id: "export", icon: "iconUpload"},
            {id: "search", icon: "iconSearch"},
            {id: "keymap", icon: "iconKeymap", panelStyle: "overflow: scroll"},
            {id: "sync", icon: "iconCloud", panelExtraClass: "config__tab-container--full"},
            {id: "access", icon: "iconLock"},
            {id: "app", icon: "TODO"},
            {id: "about", icon: "iconInfo"},
        ];
    }
    return configTabDefsCache;
};

export const getConfigTabTitle = (type: TConfigTab): string => {
    switch (type) {
        case "editor":
            return window.siyuan.languages.editor;
        case "file":
            return window.siyuan.languages.fileTree;
        case "appearance":
            return window.siyuan.languages.appearance;
        case "bazaar":
            return window.siyuan.languages.bazaar;
        case "flashcard":
            return window.siyuan.languages.riffCard;
        case "ai":
            return window.siyuan.languages.ai;
        case "assets":
            return window.siyuan.languages.assets;
        case "export":
            return window.siyuan.languages.export;
        case "search":
            return window.siyuan.languages.search;
        case "keymap":
            return window.siyuan.languages.keymap;
        case "sync":
            return window.siyuan.languages.accountSync;
        case "access":
            return window.siyuan.languages.authentication;
        case "app":
            return window.siyuan.languages.application;
        case "about":
            return window.siyuan.languages.about;
    }
};

export const getConfigTabIcon = (type: TConfigTab): string =>
    getConfigTabDefs().find(t => t.id === type)?.icon ?? "iconSettings";

/** 侧栏 / 菜单中是否不展示该设置项（与桌面设置标签栏可见性一致） */
export const isConfigTabMenuHidden = (type: TConfigTab): boolean => {
    const def = getConfigTabDefs().find(t => t.id === type);
    if (!def) {
        return true;
    }
    return def.hidden;
};
