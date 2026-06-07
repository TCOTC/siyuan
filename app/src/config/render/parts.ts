/** 组合式行：文案与控件部件（引擎统一渲染 / 检索） */
export type RowPart =
    | {
        kind: "title";
        text: string;
    }
    | {
        kind: "desc";
        text: string;
    }
    | {
        kind: "switch";
        id: string;
    }
    | {
        kind: "number";
        id: string;
        min?: number;
        max?: number;
        step?: string;
        unit?: string;
    }
    | {
        kind: "range";
        id: string;
        min: number;
        max: number;
        step: number;
    }
    | {
        kind: "select";
        id: string;
        options: {
            value: number | string;
            label?: string;
        }[];
        value: number | string;
    }
    | {
        kind: "text";
        id: string;
    }
    | {
        kind: "textBlock";
        id: string;
        mode: "input-text" | "input-password" | "textarea";
        value: string;
    };

export type WidgetKind = RowPart["kind"] extends infer K
    ? K extends "title" | "desc"
        ? never
        : K
    : never;

/** `config-query` 网格内单条开关 */
export type SwitchQuerySwitchItem = {
    kind: "switch";
    id: string;
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

/** stack 左列 */
export type StackLeft =
    | {kind: "title"; text: string}
    | {kind: "desc"; text: string}
    | {kind: "textBlock"; id: string; mode: "input-text" | "input-password" | "textarea"; value: string};

/** stack 右列控件 */
export type StackRight =
    | {kind: "button"; id: string; label: string; icon: string}
    | {kind: "select"; id: string; options: {value: number | string; label?: string}[]; value: number | string}
    | {kind: "number"; id: string; value: number; min?: number; max?: number}
    | {kind: "switch"; id: string};

export type StackLine = {
    left: StackLeft;
    right?: StackRight;
};
