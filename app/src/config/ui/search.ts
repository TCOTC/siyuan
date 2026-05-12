import type {SettingRow} from "./settingRows";

/** 设置面板内搜索：单条文案是否包含查询串（已 `trim` + `toLowerCase` 的 `queryLower`） */
export const textMatchesConfigSearch = (text: string, queryLower: string): boolean => {
    if (!queryLower) {
        return true;
    }
    const t = (text || "").toLowerCase().trim();
    if (!t) {
        return false;
    }
    return t.indexOf(queryLower) > -1;
};

/** 行是否命中设置面板搜索（工厂行看 `title` / `desc`；`custom` 看 `keywords`；`select` 另含选项文案） */
export const configRowMatchesSearchQuery = (row: SettingRow, queryLower: string): boolean => {
    switch (row.type) {
        case "custom":
            return row.keywords.some((k) => textMatchesConfigSearch(k, queryLower));
        case "select":
            if (
                textMatchesConfigSearch(row.title, queryLower) ||
                textMatchesConfigSearch(row.desc, queryLower)
            ) {
                return true;
            }
            return row.options.some((o) => textMatchesConfigSearch(o.label, queryLower));
        case "number":
            if (
                textMatchesConfigSearch(row.title, queryLower) ||
                textMatchesConfigSearch(row.desc, queryLower)
            ) {
                return true;
            }
            if (row.unit && textMatchesConfigSearch(row.unit, queryLower)) {
                return true;
            }
            return false;
        default:
            if (
                textMatchesConfigSearch(row.title, queryLower) ||
                textMatchesConfigSearch(row.desc, queryLower)
            ) {
                return true;
            }
            return false;
    }
};

/** 从一行注册数据取出参与侧栏与内容区检索索引的字符串（`custom` 仅用 `keywords`；其余含 `title` / `desc` 的行用二者） */
export const collectRowStringsForSearchIndex = (row: SettingRow): string[] => {
    switch (row.type) {
        case "custom":
            return [...row.keywords];
        case "select":
            return [row.title, row.desc, ...row.options.map((o) => o.label)];
        case "number":
            if (row.unit) {
                return [row.title, row.desc, row.unit];
            }
            return [row.title, row.desc];
        default:
            return [row.title, row.desc];
    }
};

/**
 * 据搜索关键词从完整节列表得到子集；`T` 须为 `{ title?; items: SettingRow[] }`。
 */
export const filterSettingSections = <T extends {title?: string; items: SettingRow[]}>(
    sections: T[],
    searchQuery?: string
): T[] => {
    const queryLower = (searchQuery ?? "").trim().toLowerCase();
    if (!queryLower) {
        return sections;
    }
    const out: T[] = [];
    for (const section of sections) {
        if (textMatchesConfigSearch(section.title ?? "", queryLower)) {
            out.push(section);
            continue;
        }
        const items = section.items.filter((row) => configRowMatchesSearchQuery(row, queryLower));
        if (items.length > 0) {
            out.push({title: section.title, items} as T);
        }
    }
    return out;
};

/** 一级 Tab 侧栏检索用字符串列表：Tab 标签名 + 各节标题 + 各行参与检索字段 */
export const collectSettingTabSearchStrings = <T extends {title?: string; items: SettingRow[]}>(
    tabLabel: string,
    sections: T[]
): string[] => {
    const strings: string[] = [tabLabel];
    for (const section of sections) {
        const st = section.title?.trim();
        if (st) {
            strings.push(st);
        }
        for (const row of section.items) {
            strings.push(...collectRowStringsForSearchIndex(row));
        }
    }
    return strings;
};
