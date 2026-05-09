/**
 * 设置项注册（第一版最小字段集）：稳定逻辑 id + 控件类型。
 */

export type SettingType =
    | "switch"
    | "range"
    | "number"
    | "select"
    | "text"
    | "textarea"
    | "custom";

export interface DefineSettingBase {
    id: string;
    type: SettingType;
}

/** 轻量包装，便于在定义处集中书写且保持字面量类型 */
export const defineSetting = <T extends DefineSettingBase>(def: T): T => def;
