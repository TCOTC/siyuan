import type {SettingItem} from "../registry/item";
import type {RowPart} from "../render/parts";
import {textMatchesSearch} from "../ui/search";

const partSearchStrings = (part: RowPart): string[] => {
    switch (part.kind) {
        case "title":
        case "desc":
            // TODO title 可能含 HTML（如快捷键 <code>），收集检索串时应转为纯文本
            return [part.text];
        case "select":
            return part.options.map((o) => o.label ?? String(o.value));
        case "number":
            return part.unit ? [part.unit] : [];
        default:
            return [];
    }
};

export const itemMatchesSearch = (item: SettingItem, queryLower: string): boolean => {
    if (!queryLower) {
        return true;
    }
    if (item.searchTexts().some((s) => textMatchesSearch(s, queryLower))) {
        return true;
    }
    if (item.kind === "control" && item.parts) {
        return item.parts.some((p) => partSearchStrings(p).some((s) => textMatchesSearch(s, queryLower)));
    }
    return false;
};

export const filterItemsBySearch = (items: SettingItem[], searchQuery?: string): SettingItem[] => {
    const queryLower = (searchQuery ?? "").trim().toLowerCase();
    if (!queryLower) {
        return items;
    }
    const sectionMatched = new Set<string>();
    for (const item of items) {
        if (textMatchesSearch(item.sectionTitle, queryLower)) {
            sectionMatched.add(item.sectionKey);
        }
    }
    return items.filter(
        (item) => sectionMatched.has(item.sectionKey) || itemMatchesSearch(item, queryLower),
    );
};

/** 侧栏 / 一级 Tab 命中用的检索串列表（由 ConfigPage.searchStrings 调用） */
export const collectTabSearchStrings = (tabLabel: string, items: SettingItem[]): string[] => {
    // TODO 在此或注册时：strip HTML、检索串统一 toLowerCase 一次，供 textMatchesSearch 直接比对
    const strings: string[] = [tabLabel];
    const sectionTitles = new Set<string>();
    for (const item of items) {
        if (item.sectionTitle && !sectionTitles.has(item.sectionKey)) {
            sectionTitles.add(item.sectionKey);
            strings.push(item.sectionTitle);
        }
        strings.push(...item.searchTexts());
    }
    return strings;
};
