import type {TConfigTab} from "../types";
import {filterItemsBySearch} from "../filter/itemSearch";
import {renderGroupedItems} from "../render/render";
import {getAllSettingItems} from "./item";
import {syncRangeRowValue} from "../ui/formValue";

export const queryItemsForTab = (tab: TConfigTab, searchQuery?: string) => {
    const items = getAllSettingItems()
        .filter((item) => item.tab === tab && (item.visible?.() ?? true))
        .sort((a, b) => a.order - b.order);
    return filterItemsBySearch(items, searchQuery);
};

export const mountConfigPage = async (tab: TConfigTab, root: HTMLElement, searchQuery?: string) => {
    const items = queryItemsForTab(tab, searchQuery);
    root.innerHTML = renderGroupedItems(items);
    const afterMountItems = getAllSettingItems()
        .filter((item) => item.tab === tab)
        .sort((a, b) => a.order - b.order);
    for (const item of afterMountItems) {
        if (item.afterMount) {
            // TODO sync 等 Tab：若 afterMount 会请求接口，搜索导致反复 remount 时应加 if (!searchQuery) 等守卫
            await item.afterMount(root);
        }
    }
    for (const item of items) {
        if (item.kind === "control" && item.parts) {
            const rangePart = item.parts.find((p) => p.kind === "range");
            if (rangePart && rangePart.kind === "range") {
                const rangeEl = root.querySelector<HTMLInputElement>(`#${CSS.escape(rangePart.id)}`);
                syncRangeRowValue(rangeEl);
            }
        }
    }
};
