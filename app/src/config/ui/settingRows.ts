export type SettingBindApi = {
    root: HTMLElement;
    routeSave: (controlId: string) => void;
};

/** 开关 */
export interface SettingRowSwitch {
    type: "switch";
    id: string;
    title: string;
    desc: string;
}

/** 滑块 */
export interface SettingRowRange {
    type: "range";
    id: string;
    min: number;
    max: number;
    step: number;
    title: string;
    desc: string;
}

/** 数字输入 */
export interface SettingRowNumber {
    type: "number";
    id: string;
    min?: number;
    max?: number;
    /** 显示在数字框右侧的单位文案（可选） */
    unit?: string;
    title: string;
    desc: string;
}

/** 下拉选择 */
export interface SettingRowSelect {
    type: "select";
    id: string;
    options: { value: number | string; label: string }[];
    title: string;
    desc: string;
}

/** 单行文本 */
export interface SettingRowText {
    type: "text";
    id: string;
    title: string;
    desc: string;
}

/** 自定义 HTML / 绑定 */
export interface SettingRowCustom {
    type: "custom";
    /** 参与检索的文案片段（源码中写 window.siyuan.languages.xxx 表达式求值结果） */
    keywords: string[];
    html: () => string;
    /** 非标 DOM / 桌面特例在此绑定；工厂项走通用监听与按 `id` 合并 */
    bind?: (api: SettingBindApi) => void | Promise<void>;
}

/** 笔记本 + 路径 */
export interface SettingRowNotebookSavePath {
    type: "notebookSavePath";
    title: string;
    desc: string;
    selectId: string;
    pathId: string;
    getOptionsHtml: () => string;
    getPathValue: () => string;
}

/** 大块文本编辑 */
export interface SettingRowBlockTextarea {
    type: "blockTextarea";
    title: string;
    desc: string;
    id: string;
    getTextValue: () => string;
}

export type SettingRow =
    | SettingRowSwitch
    | SettingRowRange
    | SettingRowNumber
    | SettingRowSelect
    | SettingRowText
    | SettingRowCustom
    | SettingRowNotebookSavePath
    | SettingRowBlockTextarea;

export interface SettingSection {
    title?: string;
    items: SettingRow[];
}

// --- 设置行注册工厂（由工厂补全 `type`，便于 IDE 处理类型判断） ---

/** 注册 `switch` 行 */
export const switchRow = (row: Omit<SettingRowSwitch, "type">): SettingRowSwitch => ({
    type: "switch",
    ...row,
});

/** 注册 `range` 行 */
export const rangeRow = (row: Omit<SettingRowRange, "type">): SettingRowRange => ({
    type: "range",
    ...row,
});

/** 注册 `number` 行 */
export const numberRow = (row: Omit<SettingRowNumber, "type">): SettingRowNumber => ({
    type: "number",
    ...row,
});

/** 注册 `select` 行 */
export const selectRow = (row: Omit<SettingRowSelect, "type">): SettingRowSelect => ({
    type: "select",
    ...row,
});

/** 注册 `text` 行 */
export const textRow = (row: Omit<SettingRowText, "type">): SettingRowText => ({
    type: "text",
    ...row,
});

/** 注册 `custom` 行 */
export const customRow = (row: Omit<SettingRowCustom, "type">): SettingRowCustom => ({
    type: "custom",
    ...row,
});

/** 注册 `notebookSavePath` 行 */
export const notebookSavePathRow = (
    row: Omit<SettingRowNotebookSavePath, "type">
): SettingRowNotebookSavePath => ({
    type: "notebookSavePath",
    ...row,
});

/** 注册 `blockTextarea` 行 */
export const blockTextareaRow = (row: Omit<SettingRowBlockTextarea, "type">): SettingRowBlockTextarea => ({
    type: "blockTextarea",
    ...row,
});

// --- 行数据工具（`controlId` 匹配、DOM 读值） ---

/** 在节列表中查找 `controlId` 对应的行定义 */
export function findSettingRowByControlId(
    sections: SettingSection[],
    controlId: string
): SettingRow | undefined {
    for (const section of sections) {
        for (const row of section.items) {
            if (row.type === "custom") {
                continue;
            } else if (row.type === "notebookSavePath") {
                if (row.selectId === controlId || row.pathId === controlId) {
                    return row;
                }
            } else if (row.id === controlId) {
                return row;
            }
        }
    }
    return undefined;
}
