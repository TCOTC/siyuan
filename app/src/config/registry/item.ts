import type {RowPart} from "../render/parts";
import type {ControlPart} from "./domIO";
import {buildItemSearchIndex} from "../search/normalize";

type SettingItemBase = {
    id: string;
    tabId: string;
    groupKey: string;
    /** 条目检索串（注册时 normalize） */
    searchIndex: readonly string[];
    read?: (el: HTMLElement) => unknown;
    save?: (value: unknown) => void | Promise<void>;
    afterMount?: (root: HTMLElement) => void | Promise<void>;
};

/** 标准控件行：由 rowParts 描述整行 UI，参与 mount、save、搜索 */
export type FullSettingItem = SettingItemBase & {
    kind: "full";
    rowParts: RowPart[];
    searchTexts?: () => string[];
};

/** 自定义 HTML 块：参与 mount、搜索 */
export type RenderSettingItem = SettingItemBase & {
    kind: "render";
    html: () => string;
    searchTexts?: () => string[];
};

/** 复合块内嵌控件：仅参与 read / save 路由 */
export type BindingSettingItem = SettingItemBase & {
    kind: "binding";
    controlPart: ControlPart;
};

export type SettingItem = FullSettingItem | RenderSettingItem | BindingSettingItem;
export type MountableSettingItem = FullSettingItem | RenderSettingItem;
export type RegisterSettingItem =
    | Omit<FullSettingItem, "searchIndex">
    | Omit<RenderSettingItem, "searchIndex">
    | Omit<BindingSettingItem, "searchIndex">;

const registry = new Map<SettingItem["id"], SettingItem>();
const itemsByGroupCache = new Map<string, Map<string, MountableSettingItem[]>>();

export const registerItem = (item: RegisterSettingItem) => {
    registry.set(item.id, {
        ...item,
        searchIndex: buildItemSearchIndex(item)
    } as SettingItem);
    if (item.kind !== "binding") {
        itemsByGroupCache.delete(item.tabId);
    }
};

/** 按 registerItem 调用顺序（Map 插入序）返回可挂载条目；不含 binding */
export const getMountableItemsByTabId = (tabId: string): MountableSettingItem[] => {
    const result: MountableSettingItem[] = [];
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
    itemsByGroup = new Map<string, MountableSettingItem[]>();
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

export const getSettingItem = (id: string) => registry.get(id);
