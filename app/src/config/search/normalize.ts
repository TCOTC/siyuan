import type {RowPart} from "../render/parts";

/** 检索文案：去 HTML、trim、toLowerCase */
export const normalizeSearchText = (text: string): string => {
    let plain = text || "";
    if (plain.includes("<")) {
        const el = document.createElement("div");
        el.innerHTML = plain;
        plain = el.textContent || "";
    }
    return plain.trim().toLowerCase();
};

const collectPartSearchStrings = (part: RowPart): string[] => {
    switch (part.kind) {
        case "title":
        case "desc":
            return [normalizeSearchText(part.text)];
        case "select":
            return (part.options ?? []).map((o) => normalizeSearchText(o.label ?? String(o.value)));
        case "number":
            return part.unit ? [normalizeSearchText(part.unit)] : [];
        default:
            return [];
    }
};

/** 注册时构建条目检索索引（已 normalize） */
export const buildItemSearchIndex = (item: {
    kind: string;
    parts?: RowPart[];
    searchTexts?: () => string[];
}): readonly string[] => {
    const strings: string[] = [];
    if (item.kind === "full" && item.parts) {
        for (const part of item.parts) {
            strings.push(...collectPartSearchStrings(part));
        }
    }
    if (item.searchTexts) {
        for (const text of item.searchTexts()) {
            strings.push(normalizeSearchText(text));
        }
    }
    return [...new Set(strings.filter((s) => s.length > 0))];
};
