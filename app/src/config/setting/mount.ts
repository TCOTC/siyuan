import {genGroupedItems} from "../render/render";
import {getMountableItemsByTabId} from "./item";
import {syncRangeRowValue} from "./domIO";

/** 首次挂载：渲染全部注册项并执行 afterMount */
export const mountSettingTab = async (tabId: string, root: HTMLElement) => {
    const tabItems = getMountableItemsByTabId(tabId);

    root.innerHTML = genGroupedItems(tabId);

    for (const item of tabItems) {
        await item.afterMount?.(root);
    }
    for (const item of tabItems) {
        if (item.kind !== "full") {
            continue;
        }
        for (const part of item.rowParts) {
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

export const applySettingTabSearchVisibility = (
    root: HTMLElement,
    visibleItemIds: Set<string>,
    visibleGroupIds: Set<string>,
) => {
    root.querySelectorAll("[data-config-group-id]").forEach((groupEl) => {
        const groupId = groupEl.getAttribute("data-config-group-id");
        const groupVisible = groupId && visibleGroupIds.has(groupId);
        groupEl.classList.toggle("config-search-hidden", !groupVisible);
        if (!groupVisible) {
            return;
        }

        let lastVisibleItem: Element | null = null;
        groupEl.querySelectorAll("[data-config-item-id]").forEach((itemEl) => {
            itemEl.classList.remove("config-item--last-visible");
            const itemId = itemEl.getAttribute("data-config-item-id");
            const itemVisible = itemId && visibleItemIds.has(itemId);
            itemEl.classList.toggle("config-search-hidden", !itemVisible);
            if (itemVisible) {
                lastVisibleItem = itemEl;
            }
        });
        // 标记每组最后一个未隐藏条目，不显示 border-bottom
        lastVisibleItem?.classList.add("config-item--last-visible");
    });
};

export const clearSettingTabSearch = (root: HTMLElement) => {
    root.querySelectorAll("[data-config-group-id], [data-config-item-id]").forEach((el) => {
        el.classList.remove("config-search-hidden", "config-item--last-visible");
    });
};
