/** 设置面板内 `custom.bind` 与保存共用上下文（各 Tab 一致） */
export type SettingBindApi = {
    root: HTMLElement;
    /** 传入本次变动的控件 `id`（完整配置路径，如 `editor.spellcheckLanguages` 或 `fileTree.maxOpenTabCount`） */
    scheduleSave: (controlId: string) => void;
};

/**
 * 设置面板注册「行」：`id` 为控件 DOM id，且等于 **`window.siyuan.config` 上的点分路径**（不含字面量 `window.siyuan.config.` 前缀）。
 */
export type SettingRow =
    | {
          type: "switch";
          id: string;
          title: string;
          desc: string;
      }
    | {
          type: "range";
          id: string;
          min: number;
          max: number;
          step: number;
          title: string;
          desc: string;
      }
    | {
          type: "number";
          id: string;
          min?: number;
          max?: number;
          title: string;
          desc: string;
      }
    | {
          type: "select";
          id: string;
          options: {value: number; label: string}[];
          title: string;
          desc: string;
      }
    | {
          type: "text";
          id: string;
          title: string;
          desc: string;
      }
    | {
          type: "custom";
          /** 参与检索的文案片段（源码中写 window.siyuan.languages.xxx 表达式求值结果） */
          keywords: string[];
          html: () => string;
          /** 非标 DOM / 桌面特例在此绑定；工厂项走通用监听与按 `id` 合并 */
          bind?: (api: SettingBindApi) => void | Promise<void>;
      };

/** 一组设置：行均在 `items` 内；`title` 可选，无标题时不渲染分组标题行、不参与侧栏检索文案（无标题时若某行命中，仍可展示该节全部行） */
export interface SettingSection {
    title?: string;
    items: SettingRow[];
}
