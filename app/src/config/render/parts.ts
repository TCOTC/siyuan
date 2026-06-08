import type {ConfigValue} from "../ui/configValue";

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
        value?: ConfigValue<boolean>;
    }
    | {
        kind: "number";
        id: string;
        /** 省略时渲染按 id 从 config 读取；binding 项可不传 */
        value?: ConfigValue<number>;
        min?: number;
        max?: number;
        step?: string;
        unit?: string;
    }
    | {
        kind: "range";
        id: string;
        value?: ConfigValue<number>;
        min: number;
        max: number;
        step: number;
    }
    | {
        kind: "select";
        id: string;
        /** binding 项选项由自定义 HTML 生成，可省略 options 和 value */
        options?: {
            value: number | string;
            label?: string;
        }[];
        value?: ConfigValue<number | string>;
    }
    | {
        kind: "text";
        id: string;
        value?: ConfigValue<string>;
    }
    | {
        kind: "textBlock";
        id: string;
        mode: "input-text" | "input-password" | "textarea";
        value?: ConfigValue<string>;
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
    | {kind: "textBlock"; id: string; mode: "input-text" | "input-password" | "textarea"; value?: ConfigValue<string>};

/** stack 右列控件 */
export type StackRight =
    | {kind: "button"; id: string; label: string; icon: string}
    | {kind: "select"; id: string; options?: {value: number | string; label?: string}[]; value?: ConfigValue<number | string>}
    | {kind: "number"; id: string; value?: ConfigValue<number>; min?: number; max?: number}
    | {kind: "switch"; id: string; value?: ConfigValue<boolean>};

export type StackLine = {
    left: StackLeft;
    right?: StackRight;
};
