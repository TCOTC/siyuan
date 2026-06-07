/** 设置面板内搜索：单条文案是否包含查询串（已 `trim` + `toLowerCase` 的 `queryLower`） */
export const textMatchesSearch = (text: string, queryLower: string): boolean => {
    if (!queryLower) {
        return true;
    }
    const t = (text || "").toLowerCase().trim();
    if (!t) {
        return false;
    }
    return t.indexOf(queryLower) > -1;
};
