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
import {defineConfigPage, definePanelPage, type ConfigPage} from "./pageBuilder";
import type {TConfigTab} from "../types";
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
/**
 * 各设置 Tab 的 defineConfigPage / definePanelPage 入口（集中在此文件）。
 * 具体设置项注册见 pages/*Page.ts。
 */

export const editorPage = defineConfigPage(
    {
        id: "editor",
        namespace: "editor",
        tabLabel: () => window.siyuan.languages.editor,
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
        namespace: "fileTree",
        tabLabel: () => window.siyuan.languages.fileTree,
        saveDefaults: fileConfigApi,
    },
    (p) => {
        registerFileTabsSection(p);
        registerFileNewDocumentSection(p);
        registerFileManagementSection(p);
        registerFileOthersSection(p);
    },
);

export const flashcardPage = defineConfigPage(
    {
        id: "flashcard",
        namespace: "flashcard",
        tabLabel: () => window.siyuan.languages.riffCard,
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
        namespace: "ai",
        tabLabel: () => window.siyuan.languages.ai,
        saveDefaults: aiConfigApi,
    },
    (p) => {
        registerAiServiceSection(p);
        registerAiModelSection(p);
    },
);

export const exportPage = defineConfigPage(
    {
        id: "export",
        namespace: "export",
        tabLabel: () => window.siyuan.languages.export,
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
        namespace: "search",
        tabLabel: () => window.siyuan.languages.search,
        saveDefaults: searchConfigApi,
    },
    (p) => {
        registerSearchQuerySection(p);
        registerSearchLimitsSection(p);
    },
);

export const appearancePage = defineConfigPage(
    {
        id: "appearance",
        namespace: "appearance",
        tabLabel: () => window.siyuan.languages.appearance,
        saveDefaults: appearanceConfigApi,
    },
    (p) => {
        registerAppearanceContentSection(p);
        registerAppearanceInterfaceSection(p);
        registerAppearanceControlsSection(p);
        registerAppearancePersonalizationSection(p);
    },
);

export const syncPage = defineConfigPage(
    {
        id: "sync",
        namespace: "sync",
        tabLabel: () => window.siyuan.languages.accountSync,
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
        namespace: "access",
        tabLabel: () => window.siyuan.languages.authentication,
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
        namespace: "system",
        tabLabel: () => window.siyuan.languages.application,
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
        namespace: "about",
        tabLabel: () => window.siyuan.languages.about,
    },
    (p) => {
        registerAboutVersionSection(p);
        registerAboutInfoSection(p);
    },
);

export const keymapPage = definePanelPage({
    id: "keymap",
    tabLabel: () => window.siyuan.languages.keymap,
    searchStrings: collectKeymapTabSearchStrings,
    mount: mountKeymapTab,
});

export const bazaarPage = definePanelPage({
    id: "bazaar",
    tabLabel: () => window.siyuan.languages.bazaar,
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

export const assetsPage = definePanelPage({
    id: "assets",
    tabLabel: () => window.siyuan.languages.assets,
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

const configPages: Partial<Record<TConfigTab, ConfigPage>> = {
    editor: editorPage,
    file: filePage,
    flashcard: flashcardPage,
    ai: aiPage,
    export: exportPage,
    search: searchPage,
    appearance: appearancePage,
    sync: syncPage,
    access: accessPage,
    app: appPage,
    about: aboutPage,
    keymap: keymapPage,
    bazaar: bazaarPage,
    assets: assetsPage,
};

export const getConfigPage = (id: TConfigTab): ConfigPage | undefined => configPages[id];
