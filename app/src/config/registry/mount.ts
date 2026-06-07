import {filterItemsBySearch} from "../filter/itemSearch";
import {genGroupedItems} from "../render/render";
import {getMountableItemsByTabId} from "./item";
import {syncRangeRowValue} from "../ui/formValue";

export const mountConfigPage = async (tabId: string, root: HTMLElement, searchQuery?: string) => {
    const tabItems = getMountableItemsByTabId(tabId).sort((a, b) => a.order - b.order);
    const items = filterItemsBySearch(tabItems, searchQuery);

    root.innerHTML = genGroupedItems(items);

    for (const item of items) {
        // TODO sync 等 Tab：若 afterMount 会请求接口，搜索导致反复 remount 时应加 if (!searchQuery) 等守卫
        await item.afterMount?.(root);
    }

    for (const item of items) {
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
