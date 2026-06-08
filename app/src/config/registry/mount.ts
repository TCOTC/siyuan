import {computeConfigSearchVisibility} from "../search/match";
import {genGroupedItems} from "../render/render";
import {getMountableItemsByTabId} from "./item";
import {syncRangeRowValue} from "../ui/formValue";

/** 首次挂载：渲染全部注册项并执行 afterMount */
export const mountConfigPage = async (tabId: string, root: HTMLElement) => {
    const tabItems = getMountableItemsByTabId(tabId);

    root.innerHTML = genGroupedItems(tabId);

    for (const item of tabItems) {
        await item.afterMount?.(root);
    }
    for (const item of tabItems) {
        if (item.kind !== "full" || !item.parts) {
            continue;
        }
        for (const part of item.parts) {
            if (part.kind !== "range") {
                continue;
            }
            const rangeEl = root.querySelector<HTMLElement>(`#${CSS.escape(part.id)}`);
            if (rangeEl) {
                syncRangeRowValue(rangeEl);
            }
        }
    }
};

/** 设置搜索：切换注册项 / 分组的显隐，不重建 DOM，因为有的设置项在挂载的时候会请求数据，避免搜索时重复请求 */
export const applyConfigPageSearch = (
    root: HTMLElement,
    tabId: string,
    tabTitle: string,
    searchQuery?: string,
) => {
    const query = (searchQuery ?? "").trim();
    if (!query) {
        clearConfigPageSearch(root);
        return;
    }
    const visibility = computeConfigSearchVisibility(tabId, tabTitle, query);
    root.querySelectorAll("[data-config-group-key]").forEach((groupEl) => {
        const groupKey = groupEl.getAttribute("data-config-group-key");
        const groupVisible = groupKey && visibility.visibleGroupKeys.has(groupKey);
        groupEl.classList.toggle("config-search-hidden", !groupVisible);
        if (!groupVisible) {
            return;
        }

        let lastVisibleItem: Element | null = null;
        groupEl.querySelectorAll("[data-config-item-id]").forEach((itemEl) => {
            itemEl.classList.remove("config-item--last-visible");
            const itemId = itemEl.getAttribute("data-config-item-id");
            const itemVisible = itemId && visibility.visibleItemIds.has(itemId);
            itemEl.classList.toggle("config-search-hidden", !itemVisible);
            if (itemVisible) {
                lastVisibleItem = itemEl;
            }
        });
        // 标记每组最后一个未隐藏条目，不显示 border-bottom
        lastVisibleItem?.classList.add("config-item--last-visible");
    });
};

export const clearConfigPageSearch = (root: HTMLElement) => {
    root.querySelectorAll("[data-config-group-key], [data-config-item-id]").forEach((el) => {
        el.classList.remove("config-search-hidden", "config-item--last-visible");
    });
};
