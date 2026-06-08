import {getConfigTabDefs, getConfigTab, type TConfigTab} from "../registry/tabs";
import type {RegistryTabSearchVisibility} from "../search/match";
import {applyConfigTabSearchVisibility, clearConfigTabSearch} from "../registry/mount";
import {App} from "../../index";
import {isPhablet} from "../../protyle/util/compatibility";

let lastConfigSearchTabId: TConfigTab | undefined;
let lastConfigSearchKeywords: string | undefined;

const readSearchKeywordsLower = (dialogElement: HTMLElement): string | undefined => {
    const searchInput = dialogElement.querySelector(".b3-form__icon input") as HTMLInputElement | null;
    const trimmed = (searchInput?.value ?? "").trim();
    return trimmed ? trimmed.toLowerCase() : undefined;
};

const resetConfigSearchSession = () => {
    lastConfigSearchTabId = undefined;
    lastConfigSearchKeywords = undefined;
};

export const initConfigSearch = (element: HTMLElement, app: App) => {
    resetConfigSearchSession();
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
        const registryVisibilityByTab = new Map<TConfigTab, RegistryTabSearchVisibility>();
        for (const def of getConfigTabDefs()) {
            const tab = getConfigTab(def.id);
            if (!tab) {
                continue;
            }
            const scan = tab.scanSearch(keywords);
            if (scan.matches) {
                matchedTabIds.add(def.id);
            }
            if (scan.registryVisibility) {
                registryVisibilityByTab.set(def.id, scan.registryVisibility);
            }
        }

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
            const tabId = currentTabElement.getAttribute("data-name") as TConfigTab;
            if (tabId) {
                switchConfigTab(element, app, tabId, keywords, registryVisibilityByTab.get(tabId));
            }
        } else {
            resetConfigSearchSession();
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

/** 切换一级设置 Tab（已迁移 Tab 走 registry） */
export const switchConfigTab = (
    dialogElement: HTMLElement,
    app: App,
    tabId: TConfigTab,
    searchQueryLower?: string,
    registryVisibility?: RegistryTabSearchVisibility,
) => {
    const keywords = searchQueryLower ?? readSearchKeywordsLower(dialogElement);
    const tab = getConfigTab(tabId);
    if (!tab) {
        // TODO 未迁移 Tab 恢复旧 mount
        return;
    }
    const containerElement = dialogElement.querySelector(`.config__tab-container[data-name="${tabId}"]`) as HTMLElement | null;
    if (!containerElement) {
        return;
    }

    if (keywords && tabId === lastConfigSearchTabId && keywords === lastConfigSearchKeywords) {
        return;
    }

    const tabChanged = tabId !== lastConfigSearchTabId;
    if (tabChanged) {
        dialogElement.querySelectorAll(".config__tab-container").forEach((container) => {
            container.classList.toggle("fn__none", container !== containerElement);
        });
        dialogElement.querySelectorAll(".config__side .b3-list-item").forEach((item) => {
            item.classList.toggle("b3-list-item--focus", item.getAttribute("data-name") === tabId);
        });
    }

    if (keywords && !tabChanged && registryVisibility && containerElement.innerHTML) {
        applyConfigTabSearchVisibility(containerElement, registryVisibility);
        lastConfigSearchKeywords = keywords;
        return;
    }

    lastConfigSearchTabId = tabId;
    lastConfigSearchKeywords = keywords;

    void tab.mount(containerElement, keywords, app, registryVisibility);
};

/** 清空设置搜索：侧栏复原并取消内容区 fn__none 过滤（不 remount）。 */
const restoreConfigTabs = (dialogElement: HTMLElement, app: App) => {
    resetConfigSearchSession();
    dialogElement.querySelectorAll(".config__side .b3-list-item").forEach((item: HTMLElement) => {
        item.style.display = "";
    });
    dialogElement.querySelectorAll(".config__tab-container").forEach((container) => {
        if (container.innerHTML) {
            clearConfigTabSearch(container as HTMLElement);
        }
    });
    const focusLi = dialogElement.querySelector(".config__side .b3-list-item.b3-list-item--focus") as HTMLElement | null;
    const tabFromFocus = focusLi?.getAttribute("data-name") as TConfigTab | undefined;
    const tabToShow =
        tabFromFocus && getConfigTab(tabFromFocus)
            ? tabFromFocus
            : "editor";
    switchConfigTab(dialogElement, app, tabToShow);
};
