/** 开关 */
export interface SettingRowSwitch {
    type: "switch";
    id: string;
    title: string;
    desc: string;
    bind?: (root: HTMLElement) => void | Promise<void>;
}

/** 单行文本 */
export interface SettingRowText {
    type: "text";
    id: string;
    title: string;
    desc: string;
}

/** 大块文本编辑 */
export interface SettingRowTextBlock {
    type: "textBlock";
    id: string;
    title: string;
    desc: string;
    mode: "input-text" | "input-password" | "textarea";
    value: string;
}

/** 数字输入 */
export interface SettingRowNumber {
    type: "number";
    id: string;
    title: string;
    desc: string;
    min?: number;
    max?: number;
    /** 含小数或 `any` 时 `readDomValue` 按浮点数解析，否则按整数解析 */
    step?: string;
    /** 显示在数字框右侧的单位文案 */
    unit?: string;
}

/** 滑块 */
export interface SettingRowRange {
    type: "range";
    id: string;
    title: string;
    desc: string;
    min: number;
    max: number;
    step: number;
    bind?: (root: HTMLElement) => void | Promise<void>;
}

/** 下拉选择 */
export interface SettingRowSelect {
    type: "select";
    id: string;
    title: string;
    desc: string;
    /** 省略 `label` 时回退为 `value` 的字符串形式 */
    options: {value: number | string; label?: string}[];
    value: number | string;
    bind?: (root: HTMLElement) => void | Promise<void>;
}

/** 按钮 */
export interface SettingRowButton {
    type: "button";
    id: string;
    title: string;
    desc: string;
    label: string;
    icon: string;
    bind: (root: HTMLElement) => void | Promise<void>;
}

/** 自定义 HTML / 绑定 */
export interface SettingRowCustom {
    type: "custom";
    /** 参与检索的文案片段（源码中写 window.siyuan.languages.xxx 表达式求值结果） */
    keywords: string[];
    html: () => string;
    /** 非标 DOM / 桌面特例在此绑定；工厂项走通用监听与按 `id` 合并 */
    bind?: (root: HTMLElement) => void | Promise<void>;
}

/** `stack` 行内右侧控件（整行仅左列时可省略 `right`） */
export type StackRight =
    | {
          kind: "button";
          id: string;
          label: string;
          icon: string;
          bind: (root: HTMLElement) => void | Promise<void>;
      }
    | {
          kind: "select";
          id: string;
          options: {value: number | string; label?: string}[];
          value: number | string;
      }
    | {
          kind: "number";
          id: string;
          value: number;
          min?: number;
          max?: number;
      }
    | {
          kind: "switch";
          id: string;
      };

/** `stack` 行内左列：主标题或次级说明（对应原 `b3-label` 主文案与 `ft__on-surface` 说明） */
export type StackLeft =
    | {kind: "title"; text: string}
    | {kind: "desc"; text: string};

/**
 * 一节内纵向堆叠：横幅行 / 分栏行等。
 * 用于「左列为标题或描述、右列可选为按钮 / 下拉 / 输入」的重复版式；最外层固定为 `b3-label`，相邻 `lines` 之间由渲染层自动插入 `fn__hr`。
 * 有 `right` 时行容器为 `fn__flex config__item`，仅左列时为 `fn__flex`。
 * 设置搜索侧栏索引由 `lines` 中左列与右侧控件可见文案自动汇总。
 */
export interface SettingRowStack {
    type: "stack";
    lines: {
        left: StackLeft;
        /** 仅左列（如大标题行）时可省略 */
        right?: StackRight;
    }[];
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

export type SettingRow =
    | SettingRowSwitch
    | SettingRowText
    | SettingRowTextBlock
    | SettingRowNumber
    | SettingRowRange
    | SettingRowSelect
    | SettingRowButton
    | SettingRowCustom
    | SettingRowStack
    | SettingRowNotebookSavePath;

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

/** 注册 `text` 行 */
export const textRow = (row: Omit<SettingRowText, "type">): SettingRowText => ({
    type: "text",
    ...row,
});

/** 注册 `textBlock` 行 */
export const textBlockRow = (row: Omit<SettingRowTextBlock, "type">): SettingRowTextBlock => ({
    type: "textBlock",
    ...row,
});

/** 注册 `number` 行 */
export const numberRow = (row: Omit<SettingRowNumber, "type">): SettingRowNumber => ({
    type: "number",
    ...row,
});

/** 注册 `range` 行 */
export const rangeRow = (row: Omit<SettingRowRange, "type">): SettingRowRange => ({
    type: "range",
    ...row,
});

/** 注册 `select` 行 */
export const selectRow = (row: Omit<SettingRowSelect, "type">): SettingRowSelect => ({
    type: "select",
    ...row,
});

/** 注册 `button` 行 */
export const buttonRow = (row: Omit<SettingRowButton, "type">): SettingRowButton => ({
    type: "button",
    ...row,
});

/** 注册 `custom` 行 */
export const customRow = (row: Omit<SettingRowCustom, "type">): SettingRowCustom => ({
    type: "custom",
    ...row,
});

/** 注册 `stack` 节（多行分栏堆叠） */
export const stackRow = (row: Omit<SettingRowStack, "type">): SettingRowStack => ({
    type: "stack",
    ...row,
});

/** 注册 `notebookSavePath` 行 */
export const notebookSavePathRow = (
    row: Omit<SettingRowNotebookSavePath, "type">
): SettingRowNotebookSavePath => ({
    type: "notebookSavePath",
    ...row,
});

// --- 行数据工具（`controlId` 匹配、DOM 读值） ---

/** 在 `stack` 行内查找与 `controlId` 匹配的右侧控件定义 */
export function findStackRightByControlId(row: SettingRowStack, controlId: string): StackRight | undefined {
    for (const line of row.lines) {
        const r = line.right;
        if (!r || !("id" in r) || r.id !== controlId) {
            continue;
        }
        return r;
    }
    return undefined;
}

/** 在节列表中查找 `controlId` 对应的行定义 */
export function findSettingRowByControlId(
    sections: SettingSection[],
    controlId: string
): SettingRow | undefined {
    for (const section of sections) {
        for (const row of section.items) {
            if (row.type === "custom") {
                /* empty */
            } else if (row.type === "stack") {
                if (findStackRightByControlId(row, controlId)) {
                    return row;
                }
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
