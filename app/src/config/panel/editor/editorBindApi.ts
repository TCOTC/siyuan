/** 编辑器设置 Tab：`custom.bind` 与保存共用的上下文 */
export type EditorBindApi = {
    root: HTMLElement;
    /** 传入本次变动的控件 `id`（与配置路径一致）；拼写语言 chips 使用 `spellcheckLanguages` */
    scheduleSave: (controlId: string) => void;
};
