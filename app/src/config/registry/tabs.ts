import {editorConfigApi} from "../tabs/editorRuntime";
import {fileConfigApi} from "../tabs/fileRuntime";
import {flashcardConfigApi} from "../tabs/flashcardRuntime";
import {aiConfigApi} from "../tabs/aiRuntime";
import {exportConfigApi} from "../tabs/exportRuntime";
import {searchConfigApi} from "../tabs/searchRuntime";
import {appearanceConfigApi} from "../tabs/appearanceRuntime";
import {mountSyncTabExtras, patchSyncConfig} from "../tabs/syncRuntime";
import {mountAccessTab} from "../tabs/accessRuntime";
import {bazaar} from "../bazaar";
import {assets} from "../assets";
import {collectKeymapTabSearchStrings, mountKeymapTab} from "../tabs/keymapUi";
import {isHuawei, isInHarmony} from "../../protyle/util/compatibility";
import {isMobile} from "../../util/functions";
import {defineConfigRegistry, buildConfigTabDefs, getConfigTabFrom, type ConfigTab, type IConfigTabShell} from "./registry";
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

export const configTabs = defineConfigRegistry((r) => ({
    editor: r.tab({
        id: "editor",
        icon: "iconEdit",
        title: () => window.siyuan.languages.editor,
        namespace: "editor",
        defaultSave: editorConfigApi.patch,
    }, registerEditorTab),
    file: r.tab({
        id: "file",
        icon: "iconFiles",
        title: () => window.siyuan.languages.fileTree,
        namespace: "fileTree",
        defaultSave: fileConfigApi.patch,
    }, registerFileTab),
    appearance: r.tab({
        id: "appearance",
        icon: "iconTheme",
        title: () => window.siyuan.languages.appearance,
        namespace: "appearance",
        defaultSave: appearanceConfigApi.patch,
    }, registerAppearanceTab),
    bazaar: r.panel({
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
        mount: (root, _searchQuery, app) => {
            bazaar.element = root;
            root.innerHTML = bazaar.genHTML();
            if (app) {
                bazaar.bindEvent(app);
            }
        },
    }),
    flashcard: r.tab({
        id: "flashcard",
        icon: "iconRiffCard",
        title: () => window.siyuan.languages.riffCard,
        namespace: "flashcard",
        defaultSave: flashcardConfigApi.patch,
    }, registerFlashcardTab),
    ai: r.tab({
        id: "ai",
        icon: "iconSparkles",
        title: () => window.siyuan.languages.ai,
        namespace: "ai",
        defaultSave: aiConfigApi.patch,
    }, registerAiTab),
    assets: r.panel({
        id: "assets",
        icon: "iconImage",
        title: () => window.siyuan.languages.assets,
        searchStrings: () => [
            window.siyuan.languages.assets,
            window.siyuan.languages.unreferencedAssets,
            window.siyuan.languages.unreferencedAV,
            window.siyuan.languages.missingAssets,
        ],
        mount: (root, _searchQuery, app) => {
            assets.element = root;
            root.innerHTML = assets.genHTML();
            if (app) {
                assets.bindEvent(app);
            }
        },
    }),
    export: r.tab({
        id: "export",
        icon: "iconUpload",
        title: () => window.siyuan.languages.export,
        namespace: "export",
        defaultSave: exportConfigApi.patch,
    }, registerExportTab),
    search: r.tab({
        id: "search",
        icon: "iconSearch",
        title: () => window.siyuan.languages.search,
        namespace: "search",
        defaultSave: searchConfigApi.patch,
    }, registerSearchTab),
    keymap: r.panel({
        id: "keymap",
        icon: "iconKeymap",
        title: () => window.siyuan.languages.keymap,
        searchStrings: collectKeymapTabSearchStrings,
        mount: mountKeymapTab,
    }),
    sync: r.tab({
        id: "sync",
        icon: "iconCloud",
        title: () => window.siyuan.languages.accountSync,
        namespace: "sync",
        defaultSave: patchSyncConfig,
        afterMount: mountSyncTabExtras,
    }, registerSyncTab),
    access: r.tab({
        id: "access",
        icon: "iconLock",
        title: () => window.siyuan.languages.authentication,
        namespace: "access",
        afterMount: mountAccessTab,
    }, registerAccessTab),
    app: r.tab({
        id: "app",
        icon: "iconSiYuan",
        title: () => window.siyuan.languages.application,
        namespace: "system",
    }, registerAppTab),
    about: r.tab({
        id: "about",
        icon: "iconInfo",
        title: () => window.siyuan.languages.about,
        namespace: "about",
    }, registerAboutTab),
}));

export type TConfigTab = keyof typeof configTabs;

export const getConfigTab = (id: TConfigTab): ConfigTab | undefined =>
    getConfigTabFrom(configTabs, id);

export const getConfigTabDefs = (): IConfigTabShell<TConfigTab>[] => buildConfigTabDefs(configTabs);
