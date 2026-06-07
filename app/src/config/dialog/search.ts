import {getConfigTabDefs, type TConfigTab} from "../registry/pages";
import {textMatchesSearch} from "../ui/search";
import {getConfigPage} from "../registry/pages";
import {App} from "../../index";
import {isPhablet} from "../../protyle/util/compatibility";

export const initConfigSearch = (element: HTMLElement, app: App) => {
    const tabSearchStrings = getConfigTabDefs().map((def) => ({
        id: def.id,
        // TODO 侧栏检索串：searchStrings() 结果宜缓存，注册项或界面语言变更时失效，避免每次 input 重复收集
        // TODO 集市 / 资源等无注册项面板：迁移后用 panels/* 的 searchStrings()，勿再硬编码 TAB_LANG_KEYS
        strings: getConfigPage(def.id)?.searchStrings() || [],
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
        tabSearchStrings.forEach(({id, strings}) => {
            for (const subItem of strings) {
                if (!subItem) {
                    console.warn("Search config miss language: ", id, strings);
                    continue;
                }
                // TODO 检索串收集时统一 toLowerCase 一次，匹配侧勿对每条文案重复变形（见 filter/itemSearch collectTabSearchStrings）
                // TODO 收集时 strip HTML（如 title 含 <code>），避免命中标签内文本（例如搜 "code"）
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
            const tabId = currentTabElement.getAttribute("data-name") as TConfigTab;
            if (tabId) {
                switchConfigTab(element, app, tabId);
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

/** 切换一级设置 Tab（已迁移 Tab 走 registry） */
export const switchConfigTab = (dialogElement: HTMLElement, app: App, tabId: TConfigTab) => {
    const page = getConfigPage(tabId);
    if (!page) {
        // TODO 未迁移 Tab 恢复旧 mount
        return;
    }
    const containerElement = dialogElement.querySelector(`.config__tab-container[data-name="${tabId}"]`) as HTMLElement | null;
    if (!containerElement) {
        return;
    }
    dialogElement.querySelectorAll(".config__tab-container").forEach((container) => {
        container.classList.toggle("fn__none", container !== containerElement);
    });
    dialogElement.querySelectorAll(".config__side .b3-list-item").forEach((item) => {
        item.classList.toggle("b3-list-item--focus", item.getAttribute("data-name") === tabId);
    });
    const searchInput = dialogElement.querySelector(".b3-form__icon input") as HTMLInputElement | null;
    const keywords = (searchInput?.value ?? "").trim();

    if (keywords) {
        void page.mount(containerElement, keywords, app);
        return;
    }
    if (containerElement.innerHTML === "") {
        void page.mount(containerElement, undefined, app);
    }
};

/**
 * 清空设置搜索：侧栏复原并重 mount 内容区（注册式 Tab 按 query 重渲染，不再用 style.display 筛 DOM）。
 * // TODO sync 等 Tab 的 afterMount 若在每次 mount 拉接口，清空搜索 / 输入关键词时会反复请求；可加 if (!searchQuery) 守卫或缓存。
 */
const restoreConfigTabs = (dialogElement: HTMLElement, app: App) => {
    dialogElement.querySelectorAll(".config__side .b3-list-item").forEach((item: HTMLElement) => {
        item.style.display = "";
    });
    getConfigTabDefs().forEach((def) => {
        const page = getConfigPage(def.id);
        if (!page) {
            return;
        }
        const container = dialogElement.querySelector(`.config__tab-container[data-name="${def.id}"]`) as HTMLElement | null;
        if (container?.innerHTML) {
            void page.mount(container, undefined, app);
        }
    });
    const focusLi = dialogElement.querySelector(".config__side .b3-list-item.b3-list-item--focus") as HTMLElement | null;
    const tabFromFocus = focusLi?.getAttribute("data-name") as TConfigTab | undefined;
    const tabToShow =
        tabFromFocus && getConfigPage(tabFromFocus)
            ? tabFromFocus
            : "editor";
    switchConfigTab(dialogElement, app, tabToShow);
};
