import type {RowPart} from "../render/parts";
import {readControlPart} from "../render/read";
import {buildItemSearchIndex} from "../search/normalize";

export type ControlPart = Exclude<RowPart, {kind: "title"} | {kind: "desc"}>;
export type SettingItemKind = "full" | "render" | "binding";
export interface SettingItem {
    id: string;
    tabId: string;
    groupKey: string;
    kind: SettingItemKind;
    /** full 项：由 parts 描述一行 UI，参与 mount、save、搜索 */
    parts?: RowPart[];
    /** binding 项：复合块内嵌控件的 read / save */
    part?: ControlPart;
    /** render 项：自定义 HTML，参与 mount、搜索 */
    html?: () => string;
    /** 设置搜索关键词；`binding` 项不参与搜索，故无此字段 */
    searchTexts?: () => string[];
    /** 条目检索串（注册时 normalize） */
    searchIndex: readonly string[];
    read?: (el: HTMLElement) => unknown;
    save?: (value: unknown) => void | Promise<void>;
    afterMount?: (root: HTMLElement) => void | Promise<void>;
}

const registry = new Map<SettingItem["id"], SettingItem>();
const itemsByGroupCache = new Map<string, Map<string, SettingItem[]>>();

export const registerItem = (item: Omit<SettingItem, "searchIndex">) => {
    registry.set(item.id, {
        ...item,
        searchIndex: buildItemSearchIndex(item),
    });
    if (item.kind !== "binding") {
        itemsByGroupCache.delete(item.tabId);
    }
};

/** 按 registerItem 调用顺序（Map 插入序）返回可挂载条目；不含 binding */
export const getMountableItemsByTabId = (tabId: string) => {
    const result: SettingItem[] = [];
    for (const item of registry.values()) {
        if (item.kind !== "binding" && item.tabId === tabId) {
            result.push(item);
        }
    }
    return result;
};

/** 按分组返回注册项（组内保持注册顺序）；注册变更后自动失效并懒重建 */
export const getMountableItemsByGroup = (tabId: string) => {
    let itemsByGroup = itemsByGroupCache.get(tabId);
    if (itemsByGroup) {
        return itemsByGroup;
    }
    itemsByGroup = new Map<string, SettingItem[]>();
    for (const item of getMountableItemsByTabId(tabId)) {
        const groupItems = itemsByGroup.get(item.groupKey);
        if (groupItems) {
            groupItems.push(item);
        } else {
            itemsByGroup.set(item.groupKey, [item]);
        }
    }
    itemsByGroupCache.set(tabId, itemsByGroup);
    return itemsByGroup;
};

/** change 委托：命中注册表则已处理并返回 true */
export const tryRouteRegistrySave = (el: HTMLElement, controlId: string): boolean => {
    const item = registry.get(controlId);
    if (!item?.save) {
        return false;
    }
    let value: unknown;
    if (item.kind === "binding") {
        if (!item.part) {
            return false;
        }
        value = item.read ? item.read(el) : readControlPart(item.part, el);
    } else if (item.kind === "full") {
        const controlPart = item.parts?.find(
            (p): p is ControlPart =>
                p.kind !== "title" && p.kind !== "desc" && p.id === controlId,
        );
        value = item.read
            ? item.read(el)
            : controlPart
              ? readControlPart(controlPart, el)
              : undefined;
    } else {
        return false;
    }
    if (value !== undefined) {
        void item.save(value);
    }
    return true;
};
