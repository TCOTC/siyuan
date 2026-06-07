import type {TConfigTab} from "./types";
import {getConfigTabDefs} from "./tabs";
import {collectSettingTabSearchStrings, textMatchesSearch} from "./ui/search";
import {buildEditorSections, editorSettings} from "./editor";
import {buildFileSections, fileSettings} from "./file";
import {buildAppearanceSections, appearanceSettings} from "./appearance";
import {buildFlashcardSections, flashcardSettings} from "./flashcard";
import {buildAiSections, aiSettings} from "./ai";
import {buildExportSections, exportSettings} from "./export";
import {buildSearchSections, searchSettings} from "./searchSettings";
import {buildKeymapSections, keymapSettings} from "./keymap";
import {buildSyncSections, syncSettings} from "./sync";
import {buildAccessSections, accessSettings} from "./access";
import {buildAppSections, appSettings} from "./app";
import {buildAboutSections, aboutSettings} from "./about";
import {mountConfigTab} from "./mountConfigTab";
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
    panelElement.querySelectorAll(":scope > .config-group").forEach((groupEl) => {
        const titleEl = groupEl.querySelector(":scope > .config-title") as HTMLElement | null;
        const itemsEl = groupEl.querySelector(":scope > .config-items") as HTMLElement | null;
        const targetEl = itemsEl || (groupEl as HTMLElement);
        filterGroupSection(titleEl, targetEl, queryLower);
        const itemsHidden = targetEl.hasAttribute(CONFIG_SEARCH_MARK);
        const titleHidden = !titleEl || titleEl.hasAttribute(CONFIG_SEARCH_MARK);
        if (itemsHidden && titleHidden) {
            markSearchHidden(groupEl as HTMLElement);
        } else {
            (groupEl as HTMLElement).style.display = "";
            groupEl.removeAttribute(CONFIG_SEARCH_MARK);
        }
    });
};

type TConfigTabLangKeys = Exclude<TConfigTab, "editor" | "file" | "appearance" | "flashcard" | "ai" | "export" | "search" | "keymap" | "sync" | "access" | "app" | "about">;

/**
 * 侧栏标签索引关键词：按一级 Tab 的 `id` 与 `TAB_LANG_KEYS` 的键对应；
 * 用于在未展开面板时匹配「应显示哪几个一级标签」（与侧栏 `li[data-name]` 对齐）。
 * TODO 最终要实现移除这个对象
 */
const TAB_LANG_KEYS: Record<TConfigTabLangKeys, string[]> = {
    bazaar: [
        "bazaar", "theme", "template", "icon", "widget", "plugin", "downloaded", "search", "enterKey", "total",
        "sortByUpdateTimeDesc", "sortByUpdateTimeAsc", "sortByDownloadsDesc", "sortByDownloadsAsc", "all", "themeLight", "themeDark",
    ],
    assets: [
        "assets", "unreferencedAssets", "unreferencedAV", "missingAssets", "delete", "clearAll", "clearAllAV", "emptyContent",
    ],
};

const getTabSearchStrings = (tabId: TConfigTab): string[] => {
    switch (tabId) {
        case "editor":
            return collectSettingTabSearchStrings(window.siyuan.languages.editor, buildEditorSections());
        case "file":
            return collectSettingTabSearchStrings(window.siyuan.languages.fileTree, buildFileSections());
        case "appearance":
            return collectSettingTabSearchStrings(window.siyuan.languages.appearance, buildAppearanceSections());
        case "flashcard":
            return collectSettingTabSearchStrings(window.siyuan.languages.riffCard, buildFlashcardSections());
        case "ai":
            return collectSettingTabSearchStrings(window.siyuan.languages.ai, buildAiSections());
        case "export":
            return collectSettingTabSearchStrings(window.siyuan.languages.export, buildExportSections());
        case "search":
            return collectSettingTabSearchStrings(window.siyuan.languages.search, buildSearchSections());
        case "keymap":
            return collectSettingTabSearchStrings(window.siyuan.languages.keymap, buildKeymapSections());
        case "sync":
            return collectSettingTabSearchStrings(window.siyuan.languages.accountSync, buildSyncSections());
        case "access":
            return collectSettingTabSearchStrings(window.siyuan.languages.authentication, buildAccessSections());
        case "app":
            return collectSettingTabSearchStrings(window.siyuan.languages.application, buildAppSections());
        case "about":
            return collectSettingTabSearchStrings(window.siyuan.languages.about, buildAboutSections());
    }
    return getLang(TAB_LANG_KEYS[tabId]);
};

export const initConfigSearch = (element: HTMLElement, app: App) => {
    const tabSearchStrings = getConfigTabDefs().map((def) => ({
        id: def.id,
        // TODO build*Sections() 的结果是动态的，需要单独给每一个 sections 保存一个缓存，
        // 每次 build*Sections() 之后都更新缓存，搜索时直接使用缓存。
        strings: getTabSearchStrings(def.id),
    }));
    const inputElement = element.querySelector(".b3-form__icon input") as HTMLInputElement;
    if (!isPhablet()) {
        inputElement.focus();
    } else {
        (document.activeElement as HTMLElement)?.blur();
    }
    const updateTab = () => {
        const keywords = inputElement.value.trim().toLowerCase();
        if (!keywords) {
            restoreConfigTabs(element, app);
            return;
        }

        const matchedTabIds = new Set<TConfigTab>();
        tabSearchStrings.forEach(({ id, strings }) => {
            for (const subItem of strings) {
                if (!subItem) {
                    console.warn("Search config miss language: ", id, strings);
                    continue;
                }
                // TODO 在把所有设置项都改成注册式之后，把 .toLowerCase() 移到对应的收集文案的函数里只处理一次，而不是在这里反复处理
                // TODO 预先将含 HTML 的文案转为纯文本（比如 innerText 或 textContent），避免命中 HTML 标签中的文本（例如搜索 "code" 会命中包含 <code> 标签的文案）
                if (textMatchesSearch(subItem, keywords)) {
                    matchedTabIds.add(id);
                    break;
                }
            }
        });

        // 尽量保持在当前聚焦的标签页；若当前页已不在命中集合，则自动切到侧栏顺序中的第一个命中项（沿用原交互）。
        let currentTabElement: HTMLElement | undefined;
        const focusedLi = element.querySelector(".config__side .b3-list-item.b3-list-item--focus") as HTMLElement | null;
        if (focusedLi && focusedLi.style.display !== "none") {
            const focusedTabId = focusedLi.getAttribute("data-name") as TConfigTab | null;
            if (focusedTabId && matchedTabIds.has(focusedTabId)) {
                currentTabElement = focusedLi;
            }
        }
        element.querySelectorAll(".config__side .b3-list-item").forEach((item: HTMLElement) => {
            const tabId = item.getAttribute("data-name") as TConfigTab | null;
            if (tabId && matchedTabIds.has(tabId)) {
                if (!currentTabElement) {
                    currentTabElement = item;
                }
                item.style.display = "";
            } else {
                item.style.display = "none";
            }
        });

        if (currentTabElement) {
            const tabType = currentTabElement.getAttribute("data-name") as TConfigTab;
            if (tabType) {
                switchConfigTab(element, app, tabType);
            }
        } else {
            element.querySelectorAll(".config__tab-container").forEach((item) => {
                item.classList.add("fn__none");
            });
        }
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

/** 切换一级设置 Tab：挂载空面板（如需）；若搜索框有关键词则对当前 Tab 套用筛选。 */
export const switchConfigTab = (dialogElement: HTMLElement, app: App, type: TConfigTab) => {
    const containerElement = dialogElement.querySelector(`.config__tab-container[data-name="${type}"]`) as HTMLElement | null;
    if (!containerElement) {
        return;
    }
    dialogElement.querySelectorAll(".config__tab-container").forEach((container) => {
        if (container !== containerElement) {
            container.classList.add("fn__none");
        }
    });
    containerElement.classList.remove("fn__none");
    dialogElement.querySelector(`.config__side .b3-list-item.b3-list-item--focus:not([data-name="${type}"])`)?.classList.remove("b3-list-item--focus");
    dialogElement.querySelector(`.config__side .b3-list-item[data-name="${type}"]`)?.classList.add("b3-list-item--focus");
    const searchInput = dialogElement.querySelector(".b3-form__icon input") as HTMLInputElement | null;
    const keywords = (searchInput?.value ?? "").trim();

    if (keywords) {
        const el = containerElement as HTMLElement;
        switch (type) {
            case "editor":
                void editorSettings.mount(el, keywords);
                return;
            case "file":
                void fileSettings.mount(el, keywords);
                return;
            case "appearance":
                void appearanceSettings.mount(el, keywords);
                return;
            case "flashcard":
                void flashcardSettings.mount(el, keywords);
                return;
            case "ai":
                void aiSettings.mount(el, keywords);
                return;
            case "export":
                void exportSettings.mount(el, keywords);
                return;
            case "search":
                void searchSettings.mount(el, keywords);
                return;
            case "keymap":
                void keymapSettings.mount(el, keywords);
                return;
            case "sync":
                void syncSettings.mount(el, keywords);
                return;
            case "access":
                void accessSettings.mount(el, keywords);
                return;
            case "app":
                void appSettings.mount(el, keywords);
                return;
            case "about":
                void aboutSettings.mount(el, keywords);
                return;
        }
    }

    if (containerElement.innerHTML === "") {
        mountConfigTab(type, containerElement, app);
    }
    if (!keywords) {
        return;
    }
    applySettingPanelSearch(containerElement, keywords);
};

/**
 * 清空设置搜索时，对已挂载的各标签页面板撤销 DOM 筛选
 * TODO 把筛选改成仅渲染匹配到的注册项，而不是操作 style.display，然后就不需要撤销筛选了。不过官方同步那里好像就会反复请求数据了，要考虑一下
 */
const restoreConfigTabs = (dialogElement: HTMLElement, app: App) => {
    dialogElement.querySelectorAll(".config__side .b3-list-item").forEach((item: HTMLElement) => {
        item.style.display = "";
    });
    dialogElement.querySelectorAll(".config__tab-container").forEach((container: HTMLElement) => {
        if (!container.innerHTML) {
            return;
        }
        const type = container.getAttribute("data-name") as TConfigTab | null;
        if (!type) {
            return;
        }
        switch (type) {
            case "editor":
                void editorSettings.mount(container);
                break;
            case "file":
                void fileSettings.mount(container as HTMLElement);
                break;
            case "appearance":
                void appearanceSettings.mount(container as HTMLElement);
                break;
            case "flashcard":
                void flashcardSettings.mount(container as HTMLElement);
                break;
            case "ai":
                void aiSettings.mount(container as HTMLElement);
                break;
            case "export":
                void exportSettings.mount(container as HTMLElement);
                break;
            case "search":
                void searchSettings.mount(container as HTMLElement);
                break;
            case "keymap":
                void keymapSettings.mount(container as HTMLElement);
                break;
            case "sync":
                void syncSettings.mount(container as HTMLElement);
                break;
            case "access":
                void accessSettings.mount(container as HTMLElement);
                break;
            case "app":
                void appSettings.mount(container as HTMLElement);
                break;
            case "about":
                void aboutSettings.mount(container as HTMLElement);
                break;
            default:
                applySettingPanelSearch(container, "");
                break;
        }
    });
    // 清空搜索后根据侧栏仍保留的焦点项重新渲染，避免中间区域空白
    const focusLi = dialogElement.querySelector(".config__side .b3-list-item.b3-list-item--focus") as HTMLElement | null;
    const tabFromFocus = focusLi?.getAttribute("data-name") as TConfigTab | undefined;
    const tabToShow =
        tabFromFocus && getConfigTabDefs().some((def) => def.id === tabFromFocus)
            ? tabFromFocus
            : "editor";
    switchConfigTab(dialogElement, app, tabToShow);
};
