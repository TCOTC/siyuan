import {getGroupsByTabId} from "../registry/group";
import {getMountableItemsByGroup} from "../registry/item";
import {normalizeSearchText} from "./normalize";

export const stringsMatchQuery = (strings: readonly string[], queryLower: string): boolean =>
    strings.some((s) => s.includes(queryLower));

export interface RegistryTabSearchVisibility {
    visibleItemIds: Set<string>;
    visibleGroupKeys: Set<string>;
}

export interface RegistryTabSearchScan extends RegistryTabSearchVisibility {
    matches: boolean;
}

/** 一次遍历注册 Tab 的 Group / Item，同时得到侧栏命中与内容区可见性 */
export const scanRegistryTabSearch = (
    tabId: string,
    tabTitle: string,
    queryLower: string,
): RegistryTabSearchScan => {
    const visibleItemIds = new Set<string>();
    const visibleGroupKeys = new Set<string>();

    if (stringsMatchQuery([normalizeSearchText(tabTitle)], queryLower)) {
        const itemsByGroup = getMountableItemsByGroup(tabId);
        for (const group of getGroupsByTabId(tabId)) {
            visibleGroupKeys.add(group.key);
            for (const item of itemsByGroup.get(group.key) ?? []) {
                visibleItemIds.add(item.id);
            }
        }
        return {matches: true, visibleItemIds, visibleGroupKeys};
    }

    let matches = false;
    const itemsByGroup = getMountableItemsByGroup(tabId);
    for (const group of getGroupsByTabId(tabId)) {
        if (stringsMatchQuery(group.searchIndex, queryLower)) {
            matches = true;
            visibleGroupKeys.add(group.key);
            for (const item of itemsByGroup.get(group.key) ?? []) {
                visibleItemIds.add(item.id);
            }
            continue;
        }
        for (const item of itemsByGroup.get(group.key) ?? []) {
            if (stringsMatchQuery(item.searchIndex, queryLower)) {
                matches = true;
                visibleItemIds.add(item.id);
                visibleGroupKeys.add(group.key);
            }
        }
    }
    return {matches, visibleItemIds, visibleGroupKeys};
};
