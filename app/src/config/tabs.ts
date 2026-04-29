import type {TConfigTab} from "./types";
import {isHuawei, isInHarmony} from "../protyle/util/compatibility";

/** 与桌面端设置侧栏顺序一致的一级标签定义 */
export interface IConfigTabDef {
    id: TConfigTab;
    icon: string;
    /** 全局隐藏（与桌面侧栏一致：如华为隐藏集市） */
    isGloballyHidden?: () => boolean;
    /** 桌面设置面板中 `.config__tab-container` 的附加 class（如置顶、全高） */
    panelExtraClass?: string;
    /** 桌面设置面板中容器的行内 style */
    panelStyle?: string;
}

export const CONFIG_TAB_DEFS: IConfigTabDef[] = [
    {id: "editor", icon: "iconEdit"},
    {id: "file", icon: "iconFiles"},
    {id: "appearance", icon: "iconTheme"},
    {id: "bazaar", icon: "iconBazaar", isGloballyHidden: () => isHuawei() || isInHarmony(), panelExtraClass: "config__tab-container--top"},
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
            return window.siyuan.languages.configGroupAccountSync;
        case "access":
            return window.siyuan.languages.configGroupAuthentication;
        case "app":
            return window.siyuan.languages.configGroupApp;
        case "about":
            return window.siyuan.languages.about;
    }
};

export const getConfigTabIcon = (type: TConfigTab): string =>
    CONFIG_TAB_DEFS.find(t => t.id === type)?.icon ?? "iconSettings";

/** 侧栏 / 菜单中是否不展示该设置项（与桌面设置标签栏可见性一致） */
export const isConfigTabMenuHidden = (type: TConfigTab): boolean => {
    const def = CONFIG_TAB_DEFS.find(t => t.id === type);
    if (!def) {
        return true;
    }
    return !!def.isGloballyHidden?.();
};
