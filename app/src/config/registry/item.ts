import type {RowPart} from "../render/parts";
import {readControlPart} from "../render/read";
import {buildItemSearchIndex} from "../search/normalize";

export type ControlPart = Exclude<RowPart, {kind: "title"} | {kind: "desc"}>;

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

/** change 委托：命中注册表则已处理并返回 true */
export const tryRouteRegistrySave = (el: HTMLElement, controlId: string): boolean => {
    const item = registry.get(controlId);
    if (!item?.save) {
        return false;
    }
    let value: unknown;
    if (item.kind === "binding") {
        value = item.read ? item.read(el) : readControlPart(item.controlPart, el);
    } else if (item.kind === "full") {
        const controlPart = item.rowParts.find(
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
