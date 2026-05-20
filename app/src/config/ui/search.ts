import type {SettingRow, SettingRowStack, SettingRowSwitchQuery} from "./settingRows";

/** `switchQuery` 参与设置搜索的文案：节标题、页脚与各网格项 `label` */
const switchQuerySearchStrings = (row: SettingRowSwitchQuery): string[] => {
    const out = [row.title];
    if (row.footer) {
        out.push(row.footer);
    }
    for (const item of row.items) {
        out.push(item.label);
    }
    return out;
};

/** `stack` 参与设置搜索的文案：各行左列 `text`、`select` 选项（`label` 或回退 `value`）、`button` 的 `label` */
const stackExtraSearchStrings = (row: SettingRowStack): string[] => {
    const out: string[] = [];
    for (const line of row.lines) {
        const {left} = line;
        if (left.kind === "title" || left.kind === "desc") {
            out.push(left.text);
        }
        const right = line.right;
        if (right?.kind === "select") {
            out.push(...right.options.map((o) => o.label ?? String(o.value)));
        } else if (right?.kind === "button") {
            out.push(right.label);
        }
    }
    return out;
};

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

/** 行是否命中设置面板搜索（工厂行看 `title` / `desc`；`custom` 看 `keywords`；`stack` 由各行左列与右侧控件文案推导；`select` 另含选项文案） */
export const configRowMatchesSearchQuery = (row: SettingRow, queryLower: string): boolean => {
    switch (row.type) {
        case "switch":
        case "text":
        case "textPair":
        case "textBlock":
        case "range":
        case "notebookSavePath":
            return (
                textMatchesConfigSearch(row.title, queryLower) ||
                textMatchesConfigSearch(row.desc, queryLower)
            );
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
        case "select":
            if (
                textMatchesConfigSearch(row.title, queryLower) ||
                textMatchesConfigSearch(row.desc, queryLower)
            ) {
                return true;
            }
            return row.options.some((o) => textMatchesConfigSearch(o.label ?? String(o.value), queryLower));
        case "button":
            return (
                textMatchesConfigSearch(row.title, queryLower) ||
                textMatchesConfigSearch(row.label, queryLower) ||
                (row.desc ? textMatchesConfigSearch(row.desc, queryLower) : false)
            );
        case "custom":
            return row.keywords.some((k) => textMatchesConfigSearch(k, queryLower));
        case "switchQuery":
            return switchQuerySearchStrings(row).some((s) => textMatchesConfigSearch(s, queryLower));
        case "stack":
            return stackExtraSearchStrings(row).some((s) => textMatchesConfigSearch(s, queryLower));
    }
};

/** 从一行注册数据取出参与侧栏与内容区检索索引的字符串（`custom` 仅用 `keywords`；`stack` 由各行推导；其余含 `title` / `desc` 的行用二者） */
export const collectRowStringsForSearchIndex = (row: SettingRow): string[] => {
    switch (row.type) {
        case "switch":
        case "text":
        case "textPair":
        case "textBlock":
        case "range":
        case "notebookSavePath":
            return [row.title, row.desc];
        case "number":
            if (row.unit) {
                return [row.title, row.desc, row.unit];
            }
            return [row.title, row.desc];
        case "select":
            return [row.title, row.desc, ...row.options.map((o) => o.label ?? String(o.value))];
        case "button": {
            const out = [row.title, row.label];
            if (row.desc) {
                out.push(row.desc);
            }
            return out;
        }
        case "custom":
            return [...row.keywords];
        case "switchQuery":
            return switchQuerySearchStrings(row);
        case "stack":
            return stackExtraSearchStrings(row);
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
