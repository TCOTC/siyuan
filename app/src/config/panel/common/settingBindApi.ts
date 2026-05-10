/** 设置面板内 `custom.bind` 与保存共用上下文（各 Tab 一致） */
export type SettingBindApi = {
    root: HTMLElement;
    /** 传入本次变动的控件 `id`（完整配置路径，如 `editor.spellcheckLanguages` 或 `fileTree.maxOpenTabCount`） */
    scheduleSave: (controlId: string) => void;
};
