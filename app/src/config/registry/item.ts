import type {RowPart} from "../render/parts";
import {readControlPart} from "../render/read";

type SettingItemKind = "control" | "slot";
export interface SettingItem {
    id: string;
    tabId: string;
    sectionKey: string;
    sectionTitle: string;
    order: number;
    kind: SettingItemKind;
    /** control 项：由 parts 描述一行 UI */
    parts?: RowPart[];
    /** slot 项：自定义 HTML */
    html?: () => string;
    visible?: () => boolean;
    searchTexts: () => string[];
    read?: (el: HTMLElement) => unknown;
    save?: (value: unknown) => void | Promise<void>;
    afterMount?: (root: HTMLElement) => void | Promise<void>;
}

const registry = new Map<SettingItem["id"], SettingItem>();
let orderSeq = 0;
export const registerItem = (item: Omit<SettingItem, "order"> & {order?: number}) => {
    registry.set(item.id, {
        ...item,
        order: item.order ?? orderSeq++,
    });
};

export const getAllSettingItems = () => [...registry.values()];

/** change 委托：命中注册表则已处理并返回 true */
export const tryRouteRegistrySave = (el: HTMLElement, controlId: string): boolean => {
    const item = registry.get(controlId);
    if (!item || item.kind !== "control" || !item.save) {
        return false;
    }
    const controlPart = item.parts?.find(
        (p): p is Exclude<RowPart, {kind: "title"} | {kind: "desc"}> =>
            p.kind !== "title" && p.kind !== "desc" && p.id === controlId,
    );
    const value = item.read
        ? item.read(el)
        : controlPart
          ? readControlPart(controlPart, el)
          : undefined;
    if (value !== undefined) {
        void item.save(value);
    }
    return true;
};
