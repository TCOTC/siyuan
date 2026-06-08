import {getGroupsByTabId} from "../registry/group";
import {getMountableItemsByGroup} from "../registry/item";
import {normalizeSearchText} from "./normalize";

export const stringsMatchQuery = (strings: readonly string[], queryLower: string): boolean =>
    strings.some((s) => s.includes(queryLower));

/** 注册页 Tab 是否命中全局搜索（Tab 标题 / 任意分组 / 任意条目） */
export const registryTabMatchesSearch = (tabId: string, tabTitle: string, queryLower: string): boolean => {
    if (stringsMatchQuery([normalizeSearchText(tabTitle)], queryLower)) {
        return true;
    }
    const itemsByGroup = getMountableItemsByGroup(tabId);
    for (const group of getGroupsByTabId(tabId)) {
        if (stringsMatchQuery(group.searchIndex, queryLower)) {
            return true;
        }
        const groupItems = itemsByGroup.get(group.key);
        if (groupItems?.some((item) => stringsMatchQuery(item.searchIndex, queryLower))) {
            return true;
        }
    }
    return false;
};

/** 计算注册项在设置搜索下的可见性（分组标题命中时该组下全部条目可见） */
export const computeConfigSearchVisibility = (
    tabId: string,
    tabTitle: string,
    searchQuery: string,
): {
    visibleItemIds: Set<string>;
    visibleGroupKeys: Set<string>;
} => {
    const queryLower = searchQuery.toLowerCase();
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
        return {visibleItemIds, visibleGroupKeys};
    }

    const itemsByGroup = getMountableItemsByGroup(tabId);
    for (const group of getGroupsByTabId(tabId)) {
        if (stringsMatchQuery(group.searchIndex, queryLower)) {
            visibleGroupKeys.add(group.key);
            for (const item of itemsByGroup.get(group.key) ?? []) {
                visibleItemIds.add(item.id);
            }
            continue;
        }
        for (const item of itemsByGroup.get(group.key) ?? []) {
            if (stringsMatchQuery(item.searchIndex, queryLower)) {
                visibleItemIds.add(item.id);
                visibleGroupKeys.add(group.key);
            }
        }
    }
    return {visibleItemIds, visibleGroupKeys};
};
