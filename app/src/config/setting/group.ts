import {normalizeSearchText} from "../search/normalize";

interface SettingGroup {
    id: string;
    tabId: string;
    title: string;
    order: number;
    /** 分组检索串（注册时 normalize） */
    searchIndex: readonly string[];
}

const groupsByTab = new Map<string, Map<string, SettingGroup>>();
const groupOrderByTab = new Map<string, number>();

export const registerSettingGroup = (tabId: string, groupId: string, title: string): SettingGroup => {
    let tabGroups = groupsByTab.get(tabId);
    if (!tabGroups) {
        tabGroups = new Map();
        groupsByTab.set(tabId, tabGroups);
    }
    const existing = tabGroups.get(groupId);
    if (existing) {
        return existing;
    }
    const order = groupOrderByTab.get(tabId) ?? 0;
    groupOrderByTab.set(tabId, order + 1);
    const searchText = normalizeSearchText(title);
    const group: SettingGroup = {
        id: groupId,
        tabId,
        title,
        order,
        searchIndex: searchText ? [searchText] : [],
    };
    tabGroups.set(groupId, group);
    return group;
};

/** 按注册顺序返回 Tab 下全部分组 */
export const getSettingGroupsByTabId = (tabId: string): SettingGroup[] => {
    const tabGroups = groupsByTab.get(tabId);
    return tabGroups ? [...tabGroups.values()].sort((a, b) => a.order - b.order) : [];
};
