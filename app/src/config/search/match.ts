import {ConfigTabSearchResult} from "../registry/builder";
import {getGroupsByTabId} from "../registry/group";
import {getMountableItemsByGroup} from "../registry/item";
import {normalizeSearchText} from "./normalize";

export const stringsMatchQuery = (strings: readonly string[], keywords: string): boolean =>
    strings.some((s) => s.includes(keywords));

/** 一次遍历注册 Tab 的 Group / Item，同时得到侧栏命中与内容区可见性 */
export const scanRegistryTabSearch = (
    tabId: string,
    tabTitle: string,
    keywords: string,
): ConfigTabSearchResult => {
    const visibleItemIds = new Set<string>();
    const visibleGroupKeys = new Set<string>();

    if (stringsMatchQuery([normalizeSearchText(tabTitle)], keywords)) {
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
        if (stringsMatchQuery(group.searchIndex, keywords)) {
            matches = true;
            visibleGroupKeys.add(group.key);
            for (const item of itemsByGroup.get(group.key) ?? []) {
                visibleItemIds.add(item.id);
            }
            continue;
        }
        for (const item of itemsByGroup.get(group.key) ?? []) {
            if (stringsMatchQuery(item.searchIndex, keywords)) {
                matches = true;
                visibleItemIds.add(item.id);
                visibleGroupKeys.add(group.key);
            }
        }
    }
    return {matches, visibleItemIds, visibleGroupKeys};
};

/** 面板 Tab（不走注册表）的侧栏命中判断 */
export const scanPanelTabSearch = (
    tabTitle: string,
    searchStrings: readonly string[],
    keywords: string,
): ConfigTabSearchResult => {
    if (stringsMatchQuery([normalizeSearchText(tabTitle)], keywords)) {
        return {matches: true};
    }
    const searchIndex: string[] = [];
    for (const s of searchStrings) {
        const normalized = normalizeSearchText(s);
        if (normalized.length > 0) {
            searchIndex.push(normalized);
        }
    }
    return {matches: stringsMatchQuery(searchIndex, keywords)};
};