import {editorConfigApi} from "../pages/editorRuntime";
import {fileConfigApi} from "../pages/fileRuntime";
import {flashcardConfigApi} from "../pages/flashcardRuntime";
import {aiConfigApi} from "../pages/aiRuntime";
import {exportConfigApi} from "../pages/exportRuntime";
import {searchConfigApi} from "../pages/searchRuntime";
import {appearanceConfigApi} from "../pages/appearanceRuntime";
import {mountSyncTabExtras, sendSyncSetting} from "../pages/syncRuntime";
import {mountAccessTab} from "../pages/accessRuntime";
import {bazaar} from "../bazaar";
import {assets} from "../assets";
import {collectKeymapTabSearchStrings, mountKeymapTab} from "../pages/keymapUi";
import {isHuawei, isInHarmony} from "../../protyle/util/compatibility";
import {isMobile} from "../../util/functions";
import {defineConfigPage, definePanelPage, type ConfigPage} from "./pageBuilder";
import {
    registerEditorBehaviorSection,
    registerEditorBlockFeaturesSection,
    registerEditorBidirectionalSection,
    registerEditorMarkdownInlineSection,
    registerEditorAdvancedSection,
} from "../pages/editorPage";
import {
    registerFileManagementSection,
    registerFileNewDocumentSection,
    registerFileOthersSection,
    registerFileTabsSection,
} from "../pages/filePage";
import {
    registerFlashcardCreationSection,
    registerFlashcardOthersSection,
    registerFlashcardReviewSection,
} from "../pages/flashcardPage";
import {registerAiServiceSection, registerAiModelSection} from "../pages/aiPage";
import {
    registerExportFormatSection,
    registerExportImagesSection,
    registerExportPandocSection,
    registerExportPdfSection,
    registerExportReferencesSection,
} from "../pages/exportPage";
import {registerSearchLimitsSection, registerSearchQuerySection} from "../pages/searchPage";
import {
    registerAppearanceContentSection,
    registerAppearanceControlsSection,
    registerAppearanceInterfaceSection,
    registerAppearancePersonalizationSection,
} from "../pages/appearancePage";
import {registerAccountSection} from "../pages/accountUi";
import {registerRepoSection, registerSyncSection} from "../pages/syncPage";
import {
    registerAccessAuthSection,
    registerAccessPublishSection,
    registerAccessServerSection,
} from "../pages/accessPage";
import {
    registerAppDataSection,
    registerAppGeneralSection,
    registerAppMaintenanceSection,
} from "../pages/appPage";
import {registerAboutInfoSection, registerAboutVersionSection} from "../pages/aboutPage";

export const editorPage = defineConfigPage(
    {
        id: "editor",
        order: 0,
        icon: "iconEdit",
        title: () => window.siyuan.languages.editor,
        namespace: "editor",
        saveDefaults: editorConfigApi,
    },
    (p) => {
        registerEditorBehaviorSection(p);
        registerEditorBlockFeaturesSection(p);
        registerEditorBidirectionalSection(p);
        registerEditorMarkdownInlineSection(p);
        registerEditorAdvancedSection(p);
    },
);

export const filePage = defineConfigPage(
    {
        id: "file",
        order: 1,
        icon: "iconFiles",
        title: () => window.siyuan.languages.fileTree,
        namespace: "fileTree",
        saveDefaults: fileConfigApi,
    },
    (p) => {
        registerFileTabsSection(p);
        registerFileNewDocumentSection(p);
        registerFileManagementSection(p);
        registerFileOthersSection(p);
    },
);

export const appearancePage = defineConfigPage(
    {
        id: "appearance",
        order: 2,
        icon: "iconTheme",
        title: () => window.siyuan.languages.appearance,
        namespace: "appearance",
        saveDefaults: appearanceConfigApi,
    },
    (p) => {
        registerAppearanceContentSection(p);
        registerAppearanceInterfaceSection(p);
        registerAppearanceControlsSection(p);
        registerAppearancePersonalizationSection(p);
    },
);

export const bazaarPage = definePanelPage({
    id: "bazaar",
    order: 3,
    icon: "iconBazaar",
    title: () => window.siyuan.languages.bazaar,
    hidden: () => !!(isMobile() || isHuawei() || isInHarmony()),
    searchStrings: () => [
        window.siyuan.languages.bazaar,
        window.siyuan.languages.plugin,
        window.siyuan.languages.theme,
        window.siyuan.languages.icon,
        window.siyuan.languages.template,
        window.siyuan.languages.widget,
        window.siyuan.languages.downloaded,
    ],
    mount: (root, _searchQuery, app) => {
        bazaar.element = root;
        root.innerHTML = bazaar.genHTML();
        if (app) {
            bazaar.bindEvent(app);
        }
    },
});

export const flashcardPage = defineConfigPage(
    {
        id: "flashcard",
        order: 4,
        icon: "iconRiffCard",
        title: () => window.siyuan.languages.riffCard,
        namespace: "flashcard",
        saveDefaults: flashcardConfigApi,
    },
    (p) => {
        registerFlashcardCreationSection(p);
        registerFlashcardReviewSection(p);
        registerFlashcardOthersSection(p);
    },
);

export const aiPage = defineConfigPage(
    {
        id: "ai",
        order: 5,
        icon: "iconSparkles",
        title: () => window.siyuan.languages.ai,
        namespace: "ai",
        saveDefaults: aiConfigApi,
    },
    (p) => {
        registerAiServiceSection(p);
        registerAiModelSection(p);
    },
);

export const assetsPage = definePanelPage({
    id: "assets",
    order: 6,
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
});

export const exportPage = defineConfigPage(
    {
        id: "export",
        order: 7,
        icon: "iconUpload",
        title: () => window.siyuan.languages.export,
        namespace: "export",
        saveDefaults: exportConfigApi,
    },
    (p) => {
        registerExportReferencesSection(p);
        registerExportFormatSection(p);
        registerExportPdfSection(p);
        registerExportImagesSection(p);
        registerExportPandocSection(p);
    },
);

export const searchPage = defineConfigPage(
    {
        id: "search",
        order: 8,
        icon: "iconSearch",
        title: () => window.siyuan.languages.search,
        namespace: "search",
        saveDefaults: searchConfigApi,
    },
    (p) => {
        registerSearchQuerySection(p);
        registerSearchLimitsSection(p);
    },
);

export const keymapPage = definePanelPage({
    id: "keymap",
    order: 9,
    icon: "iconKeymap",
    title: () => window.siyuan.languages.keymap,
    searchStrings: collectKeymapTabSearchStrings,
    mount: mountKeymapTab,
});

export const syncPage = defineConfigPage(
    {
        id: "sync",
        order: 10,
        icon: "iconCloud",
        title: () => window.siyuan.languages.accountSync,
        namespace: "sync",
        saveDefaults: {patch: sendSyncSetting},
        afterMount: mountSyncTabExtras,
    },
    (p) => {
        registerAccountSection(p);
        registerSyncSection(p);
        registerRepoSection(p);
    },
);

export const accessPage = defineConfigPage(
    {
        id: "access",
        order: 11,
        icon: "iconLock",
        title: () => window.siyuan.languages.authentication,
        namespace: "access",
        afterMount: mountAccessTab,
    },
    (p) => {
        registerAccessAuthSection(p);
        registerAccessServerSection(p);
        registerAccessPublishSection(p);
    },
);

export const appPage = defineConfigPage(
    {
        id: "app",
        order: 12,
        icon: "iconSiYuan",
        title: () => window.siyuan.languages.application,
        namespace: "system",
    },
    (p) => {
        registerAppGeneralSection(p);
        registerAppDataSection(p);
        registerAppMaintenanceSection(p);
    },
);

export const aboutPage = defineConfigPage(
    {
        id: "about",
        order: 13,
        icon: "iconInfo",
        title: () => window.siyuan.languages.about,
        namespace: "about",
    },
    (p) => {
        registerAboutVersionSection(p);
        registerAboutInfoSection(p);
    },
);

const configPages = {
    editor: editorPage,
    file: filePage,
    appearance: appearancePage,
    bazaar: bazaarPage,
    flashcard: flashcardPage,
    ai: aiPage,
    assets: assetsPage,
    export: exportPage,
    search: searchPage,
    keymap: keymapPage,
    sync: syncPage,
    access: accessPage,
    app: appPage,
    about: aboutPage,
} as const;

export type TConfigTab = keyof typeof configPages;

/** 侧栏 / 菜单展示用（`title` 为求值后的文案） */
export interface IConfigTabShell {
    id: TConfigTab;
    icon: string;
    title: string;
    hidden?: boolean;
}

export const getConfigPage = (id: TConfigTab): ConfigPage | undefined => configPages[id];

let configTabShellCache: IConfigTabShell[] | undefined;

export const getConfigTabDefs = (): IConfigTabShell[] => {
    if (configTabShellCache) {
        return configTabShellCache;
    }
    configTabShellCache = (Object.keys(configPages) as TConfigTab[])
        .map((id) => ({id, page: configPages[id]}))
        .sort((a, b) => a.page.order - b.page.order)
        .map(({id, page}) => ({
            id,
            icon: page.icon,
            title: page.title(),
            hidden: page.hidden?.(),
        }));
    return configTabShellCache;
};
