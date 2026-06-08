import type {ConfigControl} from "../registry/control";

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
    | ConfigControl;

export const isConfigControl = (part: RowPart): part is ConfigControl =>
    "read" in part && "readDom" in part;

/** `config-query` 网格内单条开关 */
type SwitchQuerySwitchItem = Extract<ConfigControl, {kind: "switch"}> & {
    label: string;
    icon?: string;
};

/** `config-query` 网格内单条数字框 */
type SwitchQueryNumberItem = Extract<ConfigControl, {kind: "number"}> & {
    label: string;
};

export type SwitchQueryItem = SwitchQuerySwitchItem | SwitchQueryNumberItem;

/** stack 左列 */
export type StackLeft =
    | {kind: "title"; text: string}
    | {kind: "desc"; text: string}
    | Extract<ConfigControl, {kind: "textBlock"}>;

/** stack 右列控件 */
export type StackRight =
    | {kind: "button"; id: string; label: string; icon: string}
    | Extract<ConfigControl, {kind: "switch" | "number" | "select"}>;

export type StackLine = {
    left: StackLeft;
    right?: StackRight;
};
