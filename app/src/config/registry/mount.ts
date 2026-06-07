import {filterItemsBySearch} from "../filter/itemSearch";
import {genGroupedItems} from "../render/render";
import {getAllSettingItems} from "./item";
import {syncRangeRowValue} from "../ui/formValue";

export const mountConfigPage = async (tabId: string, root: HTMLElement, searchQuery?: string) => {
    const tabItems = getAllSettingItems()
        .filter((item) => item.tabId === tabId)
        .sort((a, b) => a.order - b.order);
    // 按 Tab 取待渲染项；`visible` 为 false 的内嵌控件在此过滤（不参与 mount）
    const filteredTabItems = tabItems.filter((item) => item.visible?.() ?? true);
    const items = filterItemsBySearch(filteredTabItems, searchQuery);

    root.innerHTML = genGroupedItems(items);

    for (const item of tabItems) {
        // TODO sync 等 Tab：若 afterMount 会请求接口，搜索导致反复 remount 时应加 if (!searchQuery) 等守卫
        await item.afterMount?.(root);
    }

    for (const item of items) {
        if (item.kind !== "control" || !item.parts) {
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
