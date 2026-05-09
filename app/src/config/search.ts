import {Constants} from "../constants";
import type {TConfigTab} from "./types";
import {CONFIG_TAB_DEFS} from "./tabs";
import {mountConfigTab} from "./mountConfigTab";
import {keymap} from "./keymap";
import {App} from "../index";
import {isPhablet} from "../protyle/util/compatibility";

const getLang = (keys: string[]) => {
    const langArray: string[] = [];
    keys.forEach((key) => {
        langArray.push(window.siyuan.languages[key]);
    });
    return langArray;
};

/** 标记由设置搜索临时隐藏的节点，清空搜索时需一并复原 */
const CONFIG_SEARCH_MARK = "data-config-search";

const clearConfigSearchDisplay = (panel: HTMLElement) => {
    panel.querySelectorAll(`[${CONFIG_SEARCH_MARK}]`).forEach((el) => {
        const node = el as HTMLElement;
        node.style.display = "";
        node.removeAttribute(CONFIG_SEARCH_MARK);
    });
};

const markSearchHidden = (el: HTMLElement) => {
    el.style.display = "none";
    el.setAttribute(CONFIG_SEARCH_MARK, "1");
};

/**
 * 正文包含关键词即命中；空串不参与匹配（避免 query.indexOf("") 恒为真）。
 */
const textMatchesQuery = (text: string, queryLower: string) => {
    if (!queryLower) {
        return true;
    }
    const t = (text || "").toLowerCase().trim();
    if (!t) {
        return false;
    }
    return t.indexOf(queryLower) > -1;
};

/** 应用侧因条件隐藏的设置行（fn__none），不参与搜索展开 */
const isRowAppHidden = (row: HTMLElement) =>
    row.classList.contains("fn__none") && !row.hasAttribute(CONFIG_SEARCH_MARK);

const filterRowsInGroup = (groupEl: HTMLElement, queryLower: string, titleMatch: boolean): boolean => {
    let anyVisible = false;
    Array.from(groupEl.children).forEach((child) => {
        const row = child as HTMLElement;
        if (isRowAppHidden(row)) {
            return;
        }
        if (!queryLower || titleMatch) {
            row.style.display = "";
            row.removeAttribute(CONFIG_SEARCH_MARK);
            row.querySelectorAll<HTMLElement>(".config-query label.fn__flex").forEach((inner) => {
                inner.style.display = "";
                inner.removeAttribute(CONFIG_SEARCH_MARK);
            });
            anyVisible = true;
            return;
        }
        const innerLabels = row.querySelectorAll<HTMLElement>(".config-query label.fn__flex");
        if (innerLabels.length > 0) {
            let innerAny = false;
            innerLabels.forEach((inner) => {
                if (textMatchesQuery(inner.textContent || "", queryLower)) {
                    inner.style.display = "";
                    inner.removeAttribute(CONFIG_SEARCH_MARK);
                    innerAny = true;
                } else {
                    markSearchHidden(inner);
                }
            });
            if (innerAny) {
                row.style.display = "";
                row.removeAttribute(CONFIG_SEARCH_MARK);
                anyVisible = true;
            } else {
                markSearchHidden(row);
            }
        } else if (textMatchesQuery(row.textContent || "", queryLower)) {
            row.style.display = "";
            row.removeAttribute(CONFIG_SEARCH_MARK);
            anyVisible = true;
        } else {
            markSearchHidden(row);
        }
    });
    return anyVisible;
};

const filterGroupSection = (
    titleEl: HTMLElement | null,
    groupEl: HTMLElement,
    queryLower: string
) => {
    const titleMatch = titleEl ? textMatchesQuery(titleEl.textContent || "", queryLower) : false;
    if (!queryLower) {
        if (titleEl) {
            titleEl.style.display = "";
            titleEl.removeAttribute(CONFIG_SEARCH_MARK);
        }
        groupEl.style.display = "";
        groupEl.removeAttribute(CONFIG_SEARCH_MARK);
        filterRowsInGroup(groupEl, "", true);
        return;
    }
    if (titleMatch) {
        if (titleEl) {
            titleEl.style.display = "";
            titleEl.removeAttribute(CONFIG_SEARCH_MARK);
        }
        groupEl.style.display = "";
        groupEl.removeAttribute(CONFIG_SEARCH_MARK);
        filterRowsInGroup(groupEl, queryLower, true);
        return;
    }
    const anyVisible = filterRowsInGroup(groupEl, queryLower, false);
    if (titleEl) {
        if (anyVisible) {
            titleEl.style.display = "";
            titleEl.removeAttribute(CONFIG_SEARCH_MARK);
        } else {
            markSearchHidden(titleEl);
        }
    }
    if (anyVisible) {
        groupEl.style.display = "";
        groupEl.removeAttribute(CONFIG_SEARCH_MARK);
    } else {
        markSearchHidden(groupEl);
    }
};

/** 无 config-group 结构的页面（如资源、集市）：仅筛选顶部分栏 */
const filterUnstructuredPanel = (panel: HTMLElement, queryLower: string) => {
    if (!queryLower) {
        return;
    }
    panel.querySelectorAll(".layout-tab-bar .item").forEach((item) => {
        const el = item as HTMLElement;
        if (textMatchesQuery(el.textContent || "", queryLower)) {
            el.style.display = "";
            el.removeAttribute(CONFIG_SEARCH_MARK);
        } else {
            markSearchHidden(el);
        }
    });
};

/**
 * 根据关键词筛选设置面板：组标题命中则显示整组；否则按行筛选，并保留组标题以便对照。
 */
const applySettingPanelSearch = (panelElement: HTMLElement, query: string) => {
    clearConfigSearchDisplay(panelElement);
    const queryLower = query.trim().toLowerCase();
    if (!panelElement.querySelector(".config-group")) {
        filterUnstructuredPanel(panelElement, queryLower);
        return;
    }
    const children = Array.from(panelElement.children);
    let i = 0;
    while (i < children.length) {
        const el = children[i] as HTMLElement;
        const next = children[i + 1] as HTMLElement | undefined;
        if (el.classList.contains("config-group__title") && next?.classList.contains("config-group")) {
            filterGroupSection(el, next, queryLower);
            i += 2;
            continue;
        }
        if (el.classList.contains("config-group")) {
            filterGroupSection(null, el, queryLower);
        }
        i += 1;
    }
};

/**
 * 侧栏标签索引关键词：顺序必须与 CONFIG_TAB_DEFS / genConfigTabListHTML 一致；
 * 用于在未展开面板时匹配「应显示哪几个一级标签」。
 */
const TAB_LANG_KEYS: Record<TConfigTab, string[]> = {
    editor: [
        "editor", "configGroupBehavior", "configGroupBlockFeatures", "configGroupBidirectionalLinks",
        "configGroupMarkdownInlineSyntax", "configGroupAdvanced",
        "editReadonly", "editReadonlyTip", "spellcheck", "spellcheckTip", "spellcheckTip2",
        "md29", "md30", "outlineOutdent", "outlineOutdentTip", "listItemDotNumberClickFocus", "listItemDotNumberClickFocusTip",
        "pasteURLAutoConvert", "pasteURLAutoConvertTip", "dynamicLoadBlocks", "dynamicLoadBlocksTip",
        "md7", "md8", "md12", "md16", "embedBlockBreadcrumb", "embedBlockBreadcrumbTip",
        "headingEmbedMode", "headingEmbedModeTip", "showHeadingWithBlocks", "showHeadingOnlyTitle", "showHeadingOnlyBlocks",
        "md31", "md32", "md2", "md3", "md27", "md28",
        "onlySearchForDoc", "onlySearchForDocTip", "md37", "md38", "md33", "md34", "md9", "md35", "md36", "md41",
        "backlinkContainChildren", "backlinkContainChildrenTip", "backlinkExpand", "backlinkExpandTip",
        "backmentionExpand", "backmentionExpandTip",
        "editorMarkdownInlineAsterisk", "editorMarkdownInlineAsteriskTip", "editorMarkdownInlineUnderscore", "editorMarkdownInlineUnderscoreTip",
        "editorMarkdownInlineSup", "editorMarkdownInlineSupTip", "editorMarkdownInlineSub", "editorMarkdownInlineSubTip",
        "editorMarkdownInlineTag", "editorMarkdownInlineTagTip", "editorMarkdownInlineMath", "editorMarkdownInlineMathTip",
        "editorMarkdownInlineStrikethrough", "editorMarkdownInlineStrikethroughTip", "editorMarkdownInlineMark", "editorMarkdownInlineMarkTip",
        "md39", "md40", "katexMacros", "katexMacrosTip", "allowSVGScript", "allowSVGScriptTip", "allowHTMLBLockScript", "allowHTMLBLockScriptTip",
    ],
    file: [
        "fileTree", "configGroupTabs", "configGroupNewDocument", "configGroupFileManagement", "configGroupOthers",
        "selectOpen", "fileTree2", "fileTree7", "fileTree8", "noSplitScreenWhenOpenTab", "noSplitScreenWhenOpenTabTip",
        "tabLimit", "tabLimit1", "fileTree9", "fileTree10", "fileTree24", "fileTree25", "fileTree12", "fileTree13",
        "fileTree5", "fileTree6", "fileTree26", "fileTree27", "generateHistory", "generateHistoryInterval", "historyRetentionDaysTip",
        "clearHistory", "purge", "historyRetentionDays", "fileTree16", "fileTree17", "fileTree22", "fileTree23",
        "fileTree18", "fileTree19", "fileTree20", "fileTree21", "fileTree3", "fileTree4",
        "recentDocsMaxListCount", "recentDocsMaxListCountTip", "confirmClearHistory",
    ],
    appearance: [
        "appearance", "configGroupContent", "configGroupInterface", "configGroupControls", "configGroupPersonalization",
        "font", "font1", "editorFontSize", "fontSizeTip", "fontSizeScrollZoom", "fontSizeScrollZoomTip",
        "fullWidth", "fullWidthTip", "justify", "justifyTip", "rtl", "rtlTip", "default",
        "language", "language1", "appearance4", "appearance5", "themeLight", "themeDark", "themeOS", "theme", "appearance9",
        "theme11", "theme12", "icon", "appearance8", "theme2", "appearance1", "appearance2", "appearance3",
        "floatWindowMode", "floatWindowModeTip", "floatWindowMode0", "floatWindowMode1", "floatWindowMode2",
        "floatWindowDelay", "floatWindowDelayTip", "appearance10", "appearance11", "appearance16", "appearance17", "appearance18",
        "resetLayout", "appearance6", "reset", "customEmoji", "customEmojiTip", "showInFolder", "codeSnippet", "visitCommunityShare",
        "codeSnippetTip", "desktopMode", "mobileModeTip",
    ],
    bazaar: [
        "bazaar", "theme", "template", "icon", "widget", "plugin", "downloaded", "search", "enterKey", "total",
        "sortByUpdateTimeDesc", "sortByUpdateTimeAsc", "sortByDownloadsDesc", "sortByDownloadsAsc", "all", "themeLight", "themeDark",
    ],
    flashcard: [
        "riffCard", "configGroupCardCreation", "configGroupReview", "configGroupOthers",
        "flashcardNewCardLimit", "flashcardNewCardLimitTip", "flashcardReviewCardLimit", "flashcardReviewCardLimitTip",
        "flashcardMark", "flashcardMarkTip", "flashcardList", "flashcardSuperBlock", "flashcardHeading", "flashcardDeck", "flashcardDeckTip",
        "flashcardFSRSParamRequestRetention", "flashcardFSRSParamRequestRetentionTip",
        "flashcardFSRSParamMaximumInterval", "flashcardFSRSParamMaximumIntervalTip",
        "flashcardFSRSParamWeights", "flashcardFSRSParamWeightsTip", "reviewMode", "reviewModeTip",
    ],
    ai: [
        "ai", "configGroupServiceConnection", "configGroupModelParameters",
        "apiTimeout", "apiTimeoutTip", "apiMaxTokens", "apiMaxTokensTip", "apiKey", "apiKeyTip", "apiProxy", "apiProxyTip",
        "apiBaseURL", "apiBaseURLTip", "apiUserAgentTip", "apiVersion", "apiVersionTip",
        "apiProvider", "apiProviderTip", "apiTemperature", "apiTemperatureTip", "apiMaxContexts", "apiMaxContextsTip",
    ],
    assets: [
        "assets", "unreferencedAssets", "unreferencedAV", "missingAssets", "delete", "clearAll", "clearAllAV", "emptyContent",
    ],
    export: [
        "export", "configGroupReferences", "configGroupFormat", "configGroupPDF", "configGroupImages", "configGroupPandoc",
        "paragraphBeginningSpace", "md4", "export1", "export2", "export5", "export11", "export13", "export14", "export15",
        "export19", "export20", "ref", "blockEmbed", "export17", "export18", "export23", "export24", "export25", "export26",
        "export27", "export28", "export29", "removeAssetsID", "removeAssetsIDTip", "includeSubDocs", "includeSubDocsTip",
        "includeRelatedDocs", "includeRelatedDocsTip",
    ],
    search: [
        "search", "searchBlockType", "math", "table", "paragraph", "headings", "code", "database", "embedBlock", "video", "audio",
        "widget", "quote", "callout", "superBlock", "list1", "listItem", "doc", "containerBlockTip1",
        "searchBlockAttr", "name", "alias", "memo", "allAttrs", "searchBackmention", "anchor", "docName", "keywordsLimit",
        "searchVirtualRef", "searchIndex", "indexAssetPath",
        "searchLimit", "searchLimit1", "searchLimit2", "searchCaseSensitive", "searchCaseSensitive1",
    ],
    keymap: ["keymap", "keymapTip", "keymapTip2", "refresh", "reset", "clear", "search", "general", "editor", "element", "headings", "list1",
        "plugin"].concat(Object.keys(Constants.SIYUAN_KEYMAP.general))
        .concat(Object.keys(Constants.SIYUAN_KEYMAP.editor.general))
        .concat(Object.keys(Constants.SIYUAN_KEYMAP.editor.heading))
        .concat(Object.keys(Constants.SIYUAN_KEYMAP.editor.insert))
        .concat(Object.keys(Constants.SIYUAN_KEYMAP.editor.list))
        .concat(Object.keys(Constants.SIYUAN_KEYMAP.editor.table)),
    sync: [
        "configGroupAccountSync", "configGroupAccount", "configGroupSync", "configGroupLocalDataRepo",
        "cloudStorage", "trafficStat", "sync", "backup", "cdn", "total", "sizeLimit", "pointExchangeSize",
        "cloudBackup", "cloudBackupTip", "updatePath", "cloudSync", "upload", "download",
        "syncMode", "syncModeTip", "generateConflictDoc", "generateConflictDocTip",
        "syncProvider", "syncProviderTip", "syncMode1", "syncMode2", "reposTip", "openSyncTip1", "openSyncTip2",
        "cloudSyncDir", "cloudSyncDirTip", "config",
        "cloudIntro1", "cloudIntro2", "cloudIntro3", "cloudIntro4", "cloudIntro5", "cloudIntro6", "cloudIntro7", "cloudIntro8",
        "cloudIntro9", "cloudIntro10", "cloudIntro11", "syncOfficialProviderIntro", "syncThirdPartyProviderS3Intro", "syncThirdPartyProviderWebDAVIntro",
        "syncThirdPartyProviderLocalIntro", "syncThirdPartyProviderTip", "mobileNotSupport", "proFeature",
        "localFileSystem", "accountName", "password", "captcha", "forgetPassword", "login", "register",
        "twoFactorCaptcha", "account1", "account2", "account5", "account6", "account7", "account8", "account10", "account12",
        "account4", "onepay", "freeSub", "activationCodePlaceholder", "confirm", "refreshUser", "paymentStatus", "accountDisplayTitle",
        "accountDisplayVIP", "clickMeToRenew", "day", "manage", "logout", "deactivateUser", "deactivateUserTip", "imported",
        "cloudStoragePurge", "cloudStoragePurgeConfirm",
    ],
    access: [
        "configGroupAuthentication", "configGroupServer", "configGroupPublish",
        "about5", "about6", "about7", "about8", "about11", "about12", "about13", "about14",
        "networkServeTLS", "networkServeTLSTip", "networkServeTLSTip2", "exportCACert", "exportCACertTip",
        "publishService", "publishServiceTip", "publishServicePort", "publishServicePortTip",
        "publishServiceAddresses", "publishServiceAddressesTip", "publishServiceAuth", "publishServiceAuthTip",
        "publishServiceAuthAccounts", "publishServiceAuthAccountsTip",
    ],
    app: [
        "configGroupApp", "configGroupGeneral", "configGroupData", "configGroupMaintenance",
        "autoLaunch", "autoLaunchTip", "autoLaunchMode0", "autoLaunchMode1", "autoLaunchMode2",
        "networkProxy", "about17", "directConnection", "confirm",
        "export", "exportDataTip", "import", "importDataTip", "exportConf", "exportConfTip", "importConf", "importConfTip",
        "vacuumDataIndex", "vacuumDataIndexTip", "clearTempFiles", "clearTempFilesTip",
        "rebuildDataIndex", "rebuildDataIndexTip", "dataRepoPurge", "dataRepoPurgeTip",
        "dataRepoAutoPurgeIndexRetentionDays", "dataRepoAutoPurgeRetentionIndexesDaily",
        "initRepoKeyTip", "dataRepoKeyTip1", "dataRepoKeyTip2", "importKey", "genKey", "genKeyByPW", "copyKey", "resetRepo", "resetRepoTip",
        "safeQuit", "systemLog", "systemLogTip",
    ],
    about: [
        "about", "currentVer", "downloadLatestVer", "isMsStoreVerTip", "checkUpdate",
        "autoDownloadUpdatePkg", "autoDownloadUpdatePkgTip",
        "siyuanNote", "slogan", "about1", "feedback", "accountSupport1", "accountSupport2",
    ],
};

/**
 * 思路 A：仅在切换到某一设置标签时挂载该面板并套用当前搜索框中的筛选（不在搜索输入时为所有命中标签预挂载）。
 */
export const applySettingSearchToTab = (
    dialogElement: HTMLElement,
    app: App,
    type: TConfigTab
) => {
    const inputElement = dialogElement.querySelector(".b3-form__icon input") as HTMLInputElement | null;
    const query = inputElement?.value ?? "";
    const panelElement = dialogElement.querySelector(
        `.config__tab-container[data-name="${type}"]`
    ) as HTMLElement | null;
    if (!panelElement) {
        return;
    }
    if (panelElement.innerHTML === "") {
        mountConfigTab(type, panelElement, app);
    }
    if (type === "keymap") {
        const searchElement = keymap.element.querySelector("#keymapInput") as HTMLInputElement;
        const searchKeymapElement = keymap.element.querySelector("#searchByKey") as HTMLInputElement;
        searchElement.value = query;
        searchKeymapElement.value = "";
        keymap.search(searchElement.value, searchKeymapElement.value);
    } else {
        applySettingPanelSearch(panelElement, query);
    }
};

export const initConfigSearch = (
    element: HTMLElement,
    app: App,
    switchConfigTab: (dialogElement: HTMLElement, app: App, type: TConfigTab) => void // 避免循环依赖
) => {
    const configIndex = CONFIG_TAB_DEFS.map((def) => getLang(TAB_LANG_KEYS[def.id]));
    const inputElement = element.querySelector(".b3-form__icon input") as HTMLInputElement;
    if (!isPhablet()) {
        inputElement.focus();
    } else {
        (document.activeElement as HTMLElement)?.blur();
    }
    const updateTab = () => {
        const indexList: number[] = [];
        const inputValue = inputElement.value;
        const inputLower = inputValue.toLowerCase();
        configIndex.forEach((item, index) => {
            item.forEach((subItem) => {
                if (!subItem) {
                    console.warn("Search config miss language: ", item, index);
                }
                const subLower = subItem ? subItem.toLowerCase() : "";
                if (subLower && (inputLower.indexOf(subLower) > -1 || subLower.indexOf(inputLower) > -1)) {
                    indexList.push(index);
                }
            });
        });

        let currentTabElement: HTMLElement;
        element.querySelectorAll(".config__tab-scroll li").forEach((item: HTMLElement, index) => {
            if (indexList.includes(index)) {
                if (!currentTabElement) {
                    currentTabElement = item;
                }
                item.style.display = "";
            } else {
                item.style.display = "none";
            }
        });

        const tabPanelElements = element.querySelectorAll(".config__tab-container");
        const inputTrimmed = inputValue.trim();

        if (!inputTrimmed) {
            tabPanelElements.forEach((container) => {
                const c = container as HTMLElement;
                if (!c.innerHTML) {
                    return;
                }
                const t = c.getAttribute("data-name") as TConfigTab | null;
                if (!t) {
                    return;
                }
                if (t === "keymap") {
                    keymap.element = c;
                    const searchElement = c.querySelector("#keymapInput") as HTMLInputElement | null;
                    const searchKeymapElement = c.querySelector("#searchByKey") as HTMLInputElement | null;
                    if (searchElement && searchKeymapElement) {
                        searchElement.value = "";
                        searchKeymapElement.value = "";
                        keymap.search("", "");
                    }
                } else {
                    applySettingPanelSearch(c, "");
                }
            });
            if (currentTabElement) {
                const tabType = currentTabElement.getAttribute("data-name") as TConfigTab;
                if (tabType) {
                    switchConfigTab(element, app, tabType);
                }
            }
        } else if (currentTabElement) {
            const tabType = currentTabElement.getAttribute("data-name") as TConfigTab;
            if (tabType) {
                switchConfigTab(element, app, tabType);
                applySettingSearchToTab(element, app, tabType);
            }
        } else {
            tabPanelElements.forEach((item) => {
                item.classList.add("fn__none");
            });
        }

        inputElement.focus();
    };

    inputElement.addEventListener("compositionend", () => {
        updateTab();
    });
    inputElement.addEventListener("input", (event: InputEvent) => {
        if (event.isComposing) {
            return;
        }
        updateTab();
    });
};
