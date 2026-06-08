import {editorConfigApi} from "../pages/editorRuntime";
import {fileConfigApi} from "../pages/fileRuntime";
import {flashcardConfigApi} from "../pages/flashcardRuntime";
import {aiConfigApi} from "../pages/aiRuntime";
import {exportConfigApi} from "../pages/exportRuntime";
import {searchConfigApi} from "../pages/searchRuntime";
import {appearanceConfigApi} from "../pages/appearanceRuntime";
import {mountSyncTabExtras, patchSyncConfig} from "../pages/syncRuntime";
import {mountAccessTab} from "../pages/accessRuntime";
import {bazaar} from "../bazaar";
import {assets} from "../assets";
import {collectKeymapTabSearchStrings, mountKeymapTab} from "../pages/keymapUi";
import {isHuawei, isInHarmony} from "../../protyle/util/compatibility";
import {isMobile} from "../../util/functions";
import {defineConfigRegistry, buildConfigTabDefs, getConfigPageFrom, type ConfigPage, type IConfigTabShell} from "./registry";
import {registerEditorPage} from "../pages/editorPage";
import {registerFilePage} from "../pages/filePage";
import {registerFlashcardPage} from "../pages/flashcardPage";
import {registerAiPage} from "../pages/aiPage";
import {registerExportPage} from "../pages/exportPage";
import {registerSearchPage} from "../pages/searchPage";
import {registerAppearancePage} from "../pages/appearancePage";
import {registerSyncPage} from "../pages/syncPage";
import {registerAccessPage} from "../pages/accessPage";
import {registerAppPage} from "../pages/appPage";
import {registerAboutPage} from "../pages/aboutPage";

export const configPages = defineConfigRegistry((r) => ({
    editor: r.page({
        id: "editor",
        icon: "iconEdit",
        title: () => window.siyuan.languages.editor,
        namespace: "editor",
        defaultSave: editorConfigApi.patch,
    }, registerEditorPage),
    file: r.page({
        id: "file",
        icon: "iconFiles",
        title: () => window.siyuan.languages.fileTree,
        namespace: "fileTree",
        defaultSave: fileConfigApi.patch,
    }, registerFilePage),
    appearance: r.page({
        id: "appearance",
        icon: "iconTheme",
        title: () => window.siyuan.languages.appearance,
        namespace: "appearance",
        defaultSave: appearanceConfigApi.patch,
    }, registerAppearancePage),
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
    flashcard: r.page({
        id: "flashcard",
        icon: "iconRiffCard",
        title: () => window.siyuan.languages.riffCard,
        namespace: "flashcard",
        defaultSave: flashcardConfigApi.patch,
    }, registerFlashcardPage),
    ai: r.page({
        id: "ai",
        icon: "iconSparkles",
        title: () => window.siyuan.languages.ai,
        namespace: "ai",
        defaultSave: aiConfigApi.patch,
    }, registerAiPage),
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
    export: r.page({
        id: "export",
        icon: "iconUpload",
        title: () => window.siyuan.languages.export,
        namespace: "export",
        defaultSave: exportConfigApi.patch,
    }, registerExportPage),
    search: r.page({
        id: "search",
        icon: "iconSearch",
        title: () => window.siyuan.languages.search,
        namespace: "search",
        defaultSave: searchConfigApi.patch,
    }, registerSearchPage),
    keymap: r.panel({
        id: "keymap",
        icon: "iconKeymap",
        title: () => window.siyuan.languages.keymap,
        searchStrings: collectKeymapTabSearchStrings,
        mount: mountKeymapTab,
    }),
    sync: r.page({
        id: "sync",
        icon: "iconCloud",
        title: () => window.siyuan.languages.accountSync,
        namespace: "sync",
        defaultSave: patchSyncConfig,
        afterMount: mountSyncTabExtras,
    }, registerSyncPage),
    access: r.page({
        id: "access",
        icon: "iconLock",
        title: () => window.siyuan.languages.authentication,
        namespace: "access",
        afterMount: mountAccessTab,
    }, registerAccessPage),
    app: r.page({
        id: "app",
        icon: "iconSiYuan",
        title: () => window.siyuan.languages.application,
        namespace: "system",
    }, registerAppPage),
    about: r.page({
        id: "about",
        icon: "iconInfo",
        title: () => window.siyuan.languages.about,
        namespace: "about",
    }, registerAboutPage),
}));

export type TConfigTab = keyof typeof configPages;

export type {ConfigPage, IConfigTabShell} from "./registry";

export const getConfigPage = (id: TConfigTab): ConfigPage | undefined =>
    getConfigPageFrom(configPages, id);

export const getConfigTabDefs = (): IConfigTabShell<TConfigTab>[] => buildConfigTabDefs(configPages);
