import {editorConfigApi} from "../tabs/editorRuntime";
import {fileConfigApi} from "../tabs/fileRuntime";
import {flashcardConfigApi} from "../tabs/flashcardRuntime";
import {aiConfigApi} from "../tabs/aiRuntime";
import {exportConfigApi} from "../tabs/exportRuntime";
import {searchConfigApi} from "../tabs/searchRuntime";
import {appearanceConfigApi} from "../tabs/appearanceRuntime";
import {mountSyncTabExtras, patchSyncConfig} from "../tabs/syncRuntime";
import {mountAccessTab} from "../tabs/accessRuntime";
import {mountBazaarTab} from "../bazaar";
import {mountAssetsTab} from "../assets";
import {collectKeymapTabSearchStrings, mountKeymapTab} from "../tabs/keymapUi";
import {isHuawei, isInHarmony} from "../../protyle/util/compatibility";
import {isMobile} from "../../util/functions";
import {SettingBuilder, type SettingTab} from "./builder";
import {registerEditorTab} from "../tabs/editorTab";
import {registerFileTab} from "../tabs/fileTab";
import {registerFlashcardTab} from "../tabs/flashcardTab";
import {registerAiTab} from "../tabs/aiTab";
import {registerExportTab} from "../tabs/exportTab";
import {registerSearchTab} from "../tabs/searchTab";
import {registerAppearanceTab} from "../tabs/appearanceTab";
import {registerSyncTab} from "../tabs/syncTab";
import {registerAccessTab} from "../tabs/accessTab";
import {registerAppTab} from "../tabs/appTab";
import {registerAboutTab} from "../tabs/aboutTab";

const setting = new SettingBuilder();
const settingTabs = {
    editor: setting.tab({
        id: "editor",
        icon: "iconEdit",
        title: () => window.siyuan.languages.editor,
        namespace: "editor",
        defaultSave: editorConfigApi.patch,
    }, registerEditorTab),
    file: setting.tab({
        id: "file",
        icon: "iconFiles",
        title: () => window.siyuan.languages.fileTree,
        namespace: "fileTree",
        defaultSave: fileConfigApi.patch,
    }, registerFileTab),
    appearance: setting.tab({
        id: "appearance",
        icon: "iconTheme",
        title: () => window.siyuan.languages.appearance,
        namespace: "appearance",
        defaultSave: appearanceConfigApi.patch,
    }, registerAppearanceTab),
    bazaar: setting.panel({
        id: "bazaar",
        icon: "iconBazaar",
        title: () => window.siyuan.languages.bazaar,
        hidden: () => !!(isMobile() || isHuawei() || isInHarmony()),
        searchStrings: () => [
            window.siyuan.languages.bazaar,
            window.siyuan.languages.downloaded,
            window.siyuan.languages.plugin,
            window.siyuan.languages.theme,
            window.siyuan.languages.icon,
            window.siyuan.languages.template,
            window.siyuan.languages.widget,
        ],
        mount: mountBazaarTab,
    }),
    flashcard: setting.tab({
        id: "flashcard",
        icon: "iconRiffCard",
        title: () => window.siyuan.languages.riffCard,
        namespace: "flashcard",
        defaultSave: flashcardConfigApi.patch,
    }, registerFlashcardTab),
    ai: setting.tab({
        id: "ai",
        icon: "iconSparkles",
        title: () => window.siyuan.languages.ai,
        namespace: "ai",
        defaultSave: aiConfigApi.patch,
    }, registerAiTab),
    assets: setting.panel({
        id: "assets",
        icon: "iconImage",
        title: () => window.siyuan.languages.assets,
        searchStrings: () => [
            window.siyuan.languages.assets,
            window.siyuan.languages.unreferencedAssets,
            window.siyuan.languages.unreferencedAV,
            window.siyuan.languages.missingAssets,
        ],
        mount: mountAssetsTab,
    }),
    export: setting.tab({
        id: "export",
        icon: "iconUpload",
        title: () => window.siyuan.languages.export,
        namespace: "export",
        defaultSave: exportConfigApi.patch,
    }, registerExportTab),
    search: setting.tab({
        id: "search",
        icon: "iconSearch",
        title: () => window.siyuan.languages.search,
        namespace: "search",
        defaultSave: searchConfigApi.patch,
    }, registerSearchTab),
    keymap: setting.panel({
        id: "keymap",
        icon: "iconKeymap",
        title: () => window.siyuan.languages.keymap,
        searchStrings: collectKeymapTabSearchStrings,
        mount: mountKeymapTab,
    }),
    sync: setting.tab({
        id: "sync",
        icon: "iconCloud",
        title: () => window.siyuan.languages.accountSync,
        namespace: "sync",
        defaultSave: patchSyncConfig,
        afterMount: mountSyncTabExtras,
    }, registerSyncTab),
    access: setting.tab({
        id: "access",
        icon: "iconLock",
        title: () => window.siyuan.languages.authentication,
        namespace: "access",
        afterMount: mountAccessTab,
    }, registerAccessTab),
    app: setting.tab({
        id: "app",
        icon: "iconSiYuan",
        title: () => window.siyuan.languages.application,
        namespace: "system",
    }, registerAppTab),
    about: setting.tab({
        id: "about",
        icon: "iconInfo",
        title: () => window.siyuan.languages.about,
        namespace: "about",
    }, registerAboutTab),
};

export type TSettingTab = keyof typeof settingTabs;

export const getSettingTab = (id: TSettingTab): SettingTab => settingTabs[id];

export interface ISettingTabShell<TId extends string = string> {
    id: TId;
    icon: string;
    title: string;
    hidden?: boolean;
}

let settingTabShellCache: ISettingTabShell<TSettingTab>[] | undefined;

export const getSettingTabDefs = (): ISettingTabShell<TSettingTab>[] => {
    if (settingTabShellCache) {
        return settingTabShellCache;
    }
    settingTabShellCache = (Object.keys(settingTabs) as TSettingTab[]).map((id) => {
        const tab = settingTabs[id];
        return {
            id,
            icon: tab.icon,
            title: tab.title(),
            hidden: tab.hidden?.(),
        };
    });
    return settingTabShellCache;
};

/** 移动端侧栏中设置标签页菜单项的 DOM `id` */
export const settingTabToMenuId = (tabId: string): string =>
    "menuConfig" + tabId[0].toUpperCase() + tabId.slice(1);
