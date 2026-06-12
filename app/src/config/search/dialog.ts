import {getConfigTab, type TConfigTab} from "../registry/tabs";
import type {ConfigTabMountSearch} from "../registry/builder";
import {clearConfigTabSearch} from "../registry/mount";
import {App} from "../../index";
import {isPhablet} from "../../protyle/util/compatibility";

const readSearchKeywordsLower = (dialogElement: HTMLElement): string | undefined => {
    const searchInput = dialogElement.querySelector(".b3-form__icon input") as HTMLInputElement | null;
    const trimmed = (searchInput?.value ?? "").trim();
    return trimmed ? trimmed.toLowerCase() : undefined;
};

export const switchConfigTab = (
    dialogElement: HTMLElement,
    app: App,
    tabId: TConfigTab,
    search?: ConfigTabMountSearch,
) => {
    const containerElement = dialogElement.querySelector(`.config__tab-container[data-name="${tabId}"]`) as HTMLElement | null;
    if (!containerElement) {
        return;
    }

    const focusLi = dialogElement.querySelector(".config__side .b3-list-item.b3-list-item--focus") as HTMLElement | null;
    const focusedTabId = focusLi?.getAttribute("data-name") as TConfigTab;
    if (tabId !== focusedTabId) {
        dialogElement.querySelectorAll(".config__tab-container").forEach((container) => {
            container.classList.toggle("fn__none", container !== containerElement);
        });
        dialogElement.querySelectorAll(".config__side .b3-list-item").forEach((item) => {
            item.classList.toggle("b3-list-item--focus", item.getAttribute("data-name") === tabId);
        });
    }

    if (!search) {
        const keywords = readSearchKeywordsLower(dialogElement);
        if (keywords) {
            const {visibleItemIds, visibleGroupKeys} = getConfigTab(tabId).scanSearch(keywords);
            search = {keywords, visibleItemIds, visibleGroupKeys};
        }
    }
    void getConfigTab(tabId).mount(containerElement, search, app);
};

const syncConfigSearch = (dialogElement: HTMLElement, app: App) => {
    const keywords = readSearchKeywordsLower(dialogElement);
    if (!keywords) {
        dialogElement.querySelectorAll(".config__side .b3-list-item").forEach((item: HTMLElement) => {
            item.style.display = "";
        });
        clearConfigTabSearch(dialogElement);
        return;
    }

    const focusedLi = dialogElement.querySelector(".config__side .b3-list-item.b3-list-item--focus") as HTMLElement | null;
    const focusedTabId = (focusedLi && focusedLi.style.display !== "none") ? focusedLi.getAttribute("data-name") as TConfigTab | null : null;
    let currentMatch: ({tabId: TConfigTab} & Pick<ConfigTabMountSearch, "visibleItemIds" | "visibleGroupKeys">) | undefined;
    for (const item of dialogElement.querySelectorAll<HTMLElement>(".config__side .b3-list-item")) {
        const tabId = item.getAttribute("data-name") as TConfigTab | null;
        if (!tabId) {
            item.style.display = "none";
            continue;
        }
        const {matches, visibleItemIds, visibleGroupKeys} = getConfigTab(tabId).scanSearch(keywords);
        if (!matches) {
            item.style.display = "none";
            continue;
        }
        item.style.display = "";
        // 优先使用当前标签页；若当前标签页已不在命中集合，则切到侧栏顺序中的第一个命中项
        if (tabId === focusedTabId || !currentMatch) {
            currentMatch = {tabId, visibleItemIds, visibleGroupKeys};
        }
    }

    if (currentMatch) {
        switchConfigTab(dialogElement, app, currentMatch.tabId, {
            keywords,
            visibleItemIds: currentMatch.visibleItemIds,
            visibleGroupKeys: currentMatch.visibleGroupKeys,
        });
    } else {
        dialogElement.querySelectorAll(".config__tab-container").forEach((item) => {
            item.classList.add("fn__none");
        });
    }
};

export const initConfigSearch = (element: HTMLElement, app: App) => {
    const inputElement = element.querySelector(".b3-form__icon input") as HTMLInputElement;
    if (!isPhablet()) {
        inputElement.focus();
    } else {
        (document.activeElement as HTMLElement)?.blur();
    }

    inputElement.addEventListener("compositionend", () => {
        syncConfigSearch(element, app);
    });
    inputElement.addEventListener("input", (event: InputEvent) => {
        if (event.isComposing) {
            return;
        }
        syncConfigSearch(element, app);
    });
};
