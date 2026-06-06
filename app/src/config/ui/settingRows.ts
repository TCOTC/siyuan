/** 开关 */
export interface SettingRowSwitch {
    type: "switch";
    id: string;
    title: string;
    desc?: string;
    bind?: (root: HTMLElement) => void | Promise<void>;
}

/** 单行文本 */
export interface SettingRowText {
    type: "text";
    id: string;
    title: string;
    desc: string;
}

/** 同一行左右双文本框 */
export interface SettingRowTextPair {
    type: "textPair";
    title: string;
    desc: string;
    leftId: string;
    rightId: string;
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
    desc?: string;
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

/** `stack` 行内左侧文本和控件 */
export type StackLeft =
    | {kind: "title"; text: string}
    | {kind: "desc"; text: string}
    | {kind: "textBlock"; id: string; mode: SettingRowTextBlock["mode"]; value: string};

/** `stack` 行内右侧控件 */
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

/** `stack` 行内可绑 `controlId` 的控件 */
export type StackControl = Extract<StackLeft, {kind: "textBlock"}> | StackRight;

/**
 * 一节内纵向堆叠：横幅行 / 分栏行等。
 * 用于「左列为标题或描述、右列可选为按钮 / 下拉 / 输入」的重复版式；最外层固定为 `b3-label`，相邻 `lines` 之间由渲染层自动插入 `fn__hr`（仅左列 desc 除外，与 title 连续排版）。
 * stack 外层为 `b3-label config-item`；仅左列时 title 用 `config-name`、desc 用 `b3-label__text`、输入用 `fn__block`；有右列时为 `fn__flex config-wrap`（横排）或 `fn__flex`（switch，无 config-wrap）。
 * 独立横排行为 `config-item config-wrap`；独立 switch 为 `config-item`。
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

/** `config-query` 网格内单条开关 */
export type SwitchQuerySwitchItem = {
    kind: "switch";
    id: string;
    /** 左侧文案，可含简单 HTML（如 `<sup>[1]</sup>`） */
    label: string;
    icon?: string;
};

/** `config-query` 网格内单条数字框 */
export type SwitchQueryNumberItem = {
    kind: "number";
    id: string;
    label: string;
    min?: number;
    max?: number;
};

export type SwitchQueryItem = SwitchQuerySwitchItem | SwitchQueryNumberItem;

/**
 * 一节标题下 `config-query` 内纵向/网格排列的多组开关（及可选数字框）。
 * 对应「设置 → 搜索」中块类型、块属性等成组开关版式。
 */
export interface SettingRowSwitchQuery {
    type: "switchQuery";
    title: string;
    footer?: string;
    items: SwitchQueryItem[];
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
    | SettingRowTextPair
    | SettingRowTextBlock
    | SettingRowNumber
    | SettingRowRange
    | SettingRowSelect
    | SettingRowButton
    | SettingRowCustom
    | SettingRowStack
    | SettingRowSwitchQuery
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

/** 注册 `textPair` 行（左右双文本框） */
export const textPairRow = (row: Omit<SettingRowTextPair, "type">): SettingRowTextPair => ({
    type: "textPair",
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

/** 注册 `switchQuery` 行 */
export const switchQueryRow = (row: Omit<SettingRowSwitchQuery, "type">): SettingRowSwitchQuery => ({
    type: "switchQuery",
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

/** 在 `stack` 行内查找与 `controlId` 匹配的控件 */
export function findStackControlByControlId(
    row: SettingRowStack,
    controlId: string,
): StackControl | undefined {
    for (const line of row.lines) {
        const {left, right} = line;
        if (left.kind === "textBlock" && left.id === controlId) {
            return left;
        }
        if (right && "id" in right && right.id === controlId) {
            return right;
        }
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
            switch (row.type) {
                case "textPair":
                    if (row.leftId === controlId || row.rightId === controlId) {
                        return row;
                    }
                    break;
                case "notebookSavePath":
                    if (row.selectId === controlId || row.pathId === controlId) {
                        return row;
                    }
                    break;
                case "stack":
                    if (findStackControlByControlId(row, controlId)) {
                        return row;
                    }
                    break;
                case "switchQuery":
                    if (row.items.some((item) => item.id === controlId)) {
                        return row;
                    }
                    break;
                case "custom":
                    break;
                default:
                    if (row.id === controlId) {
                        return row;
                    }
                    break;
            }
        }
    }
    return undefined;
}
