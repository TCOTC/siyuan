import {SettingTabSearchResult} from "../setting/builder";
import {getSettingGroupsByTabId} from "../setting/group";
import {getMountableItemsByGroup} from "../setting/item";
import {normalizeSearchText} from "./normalize";

const stringsMatchQuery = (strings: readonly string[], keywords: string): boolean =>
    strings.some((s) => s.includes(keywords));

/** 一次遍历 SettingTab 的 Group / Item，同时得到侧栏命中与内容区可见性 */
export const scanSettingTabSearch = (
    tabId: string,
    tabTitle: string,
    keywords: string,
): SettingTabSearchResult => {
    const visibleItemIds = new Set<string>();
    const visibleGroupIds = new Set<string>();

    if (stringsMatchQuery([normalizeSearchText(tabTitle)], keywords)) {
        const itemsByGroup = getMountableItemsByGroup(tabId);
        for (const group of getSettingGroupsByTabId(tabId)) {
            visibleGroupIds.add(group.id);
            for (const item of itemsByGroup.get(group.id) ?? []) {
                visibleItemIds.add(item.id);
            }
        }
        return {matches: true, visibleItemIds, visibleGroupIds};
    }

    let matches = false;
    const itemsByGroup = getMountableItemsByGroup(tabId);
    for (const group of getSettingGroupsByTabId(tabId)) {
        if (stringsMatchQuery(group.searchIndex, keywords)) {
            matches = true;
            visibleGroupIds.add(group.id);
            for (const item of itemsByGroup.get(group.id) ?? []) {
                visibleItemIds.add(item.id);
            }
            continue;
        }
        for (const item of itemsByGroup.get(group.id) ?? []) {
            if (stringsMatchQuery(item.searchIndex, keywords)) {
                matches = true;
                visibleItemIds.add(item.id);
                visibleGroupIds.add(group.id);
            }
        }
    }
    return {matches, visibleItemIds, visibleGroupIds};
};

/** 面板型 SettingTab 的侧栏命中判断 */
export const scanPanelSettingTabSearch = (
    tabTitle: string,
    searchStrings: readonly string[],
    keywords: string,
): SettingTabSearchResult => {
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
