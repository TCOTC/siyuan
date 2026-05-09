import {updateHotkeyTip} from "../../../protyle/util/compatibility";

/**
 * 编辑器设置「行」：`id` 为表单控件 id（与 DefineSettingBase.type 同名时用 type 区分）。
 * 分组由外层 EditorSection 承载，不再使用 type: "groupTitle"。
 */
export type EditorRow =
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
          ariaField: "codeTabSpaces";
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
      };

/** 一组设置：标题参与检索；行均在 `items` 内 */
export interface EditorSection {
    title: string;
    items: EditorRow[];
}

/** 顺序与原版 settings 编辑器标签页一致。文案在模块加载时求值（方案 A）。 */
export const EDITOR_SECTIONS: EditorSection[] = [
    {
        title: window.siyuan.languages.configGroupBehavior,
        items: [
            {
                type: "custom",
                keywords: [window.siyuan.languages.editReadonly, window.siyuan.languages.editReadonlyTip],
                html: () => {
                    const cfg = window.siyuan.config;
                    return `<label class="fn__flex b3-label">
    <div class="fn__flex-1">
        ${window.siyuan.languages.editReadonly} 
        <code class="fn__code${cfg.keymap.general.editReadonly.custom ? "" : " fn__none"}">${updateHotkeyTip(cfg.keymap.general.editReadonly.custom)}</code>
        <div class="b3-label__text">${window.siyuan.languages.editReadonlyTip}</div>
    </div>
    <span class="fn__space"></span>
    <input class="b3-switch fn__flex-center" id="readOnly" type="checkbox"${cfg.editor.readOnly ? " checked" : ""}/>
</label>`;
                },
            },
            {
                type: "custom",
                keywords: [
                    window.siyuan.languages.spellcheck,
                    window.siyuan.languages.spellcheckTip,
                    window.siyuan.languages.spellcheckTip2,
                ],
                html: () => {
                    let spellcheckTip = "";
                    /// #if !BROWSER
                    spellcheckTip = window.siyuan.languages.spellcheckTip2;
                    /// #else
                    spellcheckTip = window.siyuan.languages.spellcheckTip;
                    /// #endif
                    return `<div class="b3-label">
    <label class="fn__flex">
        <div class="fn__flex-1">
            ${window.siyuan.languages.spellcheck}
            <div class="b3-label__text">${spellcheckTip}</div>
        </div>
        <span class="fn__space"></span>
        <input class="b3-switch fn__flex-center" id="spellcheck" type="checkbox"${window.siyuan.config.editor.spellcheck ? " checked" : ""}/>
    </label>
    <div class="b3-chips fn__none" id="spellcheckLanguages"></div>
</div>`;
                },
            },
            {
                type: "range",
                id: "codeTabSpaces",
                ariaField: "codeTabSpaces",
                min: 0,
                max: 8,
                step: 2,
                title: window.siyuan.languages.md29,
                desc: window.siyuan.languages.md30,
            },
            {
                type: "switch",
                id: "listLogicalOutdent",
                title: window.siyuan.languages.outlineOutdent,
                desc: window.siyuan.languages.outlineOutdentTip,
            },
            {
                type: "switch",
                id: "listItemDotNumberClickFocus",
                title: window.siyuan.languages.listItemDotNumberClickFocus,
                desc: window.siyuan.languages.listItemDotNumberClickFocusTip,
            },
            {
                type: "switch",
                id: "pasteURLAutoConvert",
                title: window.siyuan.languages.pasteURLAutoConvert,
                desc: window.siyuan.languages.pasteURLAutoConvertTip,
            },
            {
                type: "number",
                id: "dynamicLoadBlocks",
                min: 48,
                title: window.siyuan.languages.dynamicLoadBlocks,
                desc: window.siyuan.languages.dynamicLoadBlocksTip,
            },
        ],
    },
    {
        title: window.siyuan.languages.configGroupBlockFeatures,
        items: [
            {
                type: "switch",
                id: "displayNetImgMark",
                title: window.siyuan.languages.md7,
                desc: window.siyuan.languages.md8,
            },
            {
                type: "switch",
                id: "displayBookmarkIcon",
                title: window.siyuan.languages.md12,
                desc: window.siyuan.languages.md16,
            },
            {
                type: "switch",
                id: "embedBlockBreadcrumb",
                title: window.siyuan.languages.embedBlockBreadcrumb,
                desc: window.siyuan.languages.embedBlockBreadcrumbTip,
            },
            {
                type: "select",
                id: "headingEmbedMode",
                options: [
                    {value: 0, label: window.siyuan.languages.showHeadingWithBlocks},
                    {value: 1, label: window.siyuan.languages.showHeadingOnlyTitle},
                    {value: 2, label: window.siyuan.languages.showHeadingOnlyBlocks},
                ],
                title: window.siyuan.languages.headingEmbedMode,
                desc: window.siyuan.languages.headingEmbedModeTip,
            },
            {
                type: "switch",
                id: "codeLineWrap",
                title: window.siyuan.languages.md31,
                desc: window.siyuan.languages.md32,
            },
            {
                type: "switch",
                id: "codeLigatures",
                title: window.siyuan.languages.md2,
                desc: window.siyuan.languages.md3,
            },
            {
                type: "switch",
                id: "codeSyntaxHighlightLineNum",
                title: window.siyuan.languages.md27,
                desc: window.siyuan.languages.md28,
            },
        ],
    },
    {
        title: window.siyuan.languages.configGroupBidirectionalLinks,
        items: [
            {
                type: "switch",
                id: "onlySearchForDoc",
                title: window.siyuan.languages.onlySearchForDoc,
                desc: window.siyuan.languages.onlySearchForDocTip,
            },
            {
                type: "number",
                id: "blockRefDynamicAnchorTextMaxLen",
                min: 1,
                max: 5120,
                title: window.siyuan.languages.md37,
                desc: window.siyuan.languages.md38,
            },
            {
                type: "switch",
                id: "virtualBlockRef",
                title: window.siyuan.languages.md33,
                desc: window.siyuan.languages.md34,
            },
            {
                type: "custom",
                keywords: [window.siyuan.languages.md9, window.siyuan.languages.md36],
                html: () => `<div class="b3-label">
    <div class="fn__block">
        ${window.siyuan.languages.md9}
        <div class="b3-label__text">${window.siyuan.languages.md36}</div>
        <div class="fn__hr"></div>
        <textarea class="b3-text-field fn__block" id="virtualBlockRefInclude">${window.siyuan.config.editor.virtualBlockRefInclude}</textarea>
    </div>
</div>`,
            },
            {
                type: "custom",
                keywords: [window.siyuan.languages.md35, window.siyuan.languages.md36, window.siyuan.languages.md41],
                html: () => `<div class="b3-label">
    <div class="fn__block">
        ${window.siyuan.languages.md35}
        <div class="b3-label__text">${window.siyuan.languages.md36}</div>
        <div class="b3-label__text">${window.siyuan.languages.md41}</div>
        <div class="fn__hr"></div>
        <textarea class="b3-text-field fn__block" id="virtualBlockRefExclude">${window.siyuan.config.editor.virtualBlockRefExclude}</textarea>
    </div>
</div>`,
            },
            {
                type: "switch",
                id: "backlinkContainChildren",
                title: window.siyuan.languages.backlinkContainChildren,
                desc: window.siyuan.languages.backlinkContainChildrenTip,
            },
            {
                type: "number",
                id: "backlinkExpandCount",
                min: 0,
                max: 512,
                title: window.siyuan.languages.backlinkExpand,
                desc: window.siyuan.languages.backlinkExpandTip,
            },
            {
                type: "number",
                id: "backmentionExpandCount",
                min: -1,
                max: 512,
                title: window.siyuan.languages.backmentionExpand,
                desc: window.siyuan.languages.backmentionExpandTip,
            },
        ],
    },
    {
        title: window.siyuan.languages.configGroupMarkdownInlineSyntax,
        items: [
            {
                type: "switch",
                id: "editorMarkdownInlineAsterisk",
                title: window.siyuan.languages.editorMarkdownInlineAsterisk,
                desc: window.siyuan.languages.editorMarkdownInlineAsteriskTip,
            },
            {
                type: "switch",
                id: "editorMarkdownInlineUnderscore",
                title: window.siyuan.languages.editorMarkdownInlineUnderscore,
                desc: window.siyuan.languages.editorMarkdownInlineUnderscoreTip,
            },
            {
                type: "switch",
                id: "editorMarkdownInlineSup",
                title: window.siyuan.languages.editorMarkdownInlineSup,
                desc: window.siyuan.languages.editorMarkdownInlineSupTip,
            },
            {
                type: "switch",
                id: "editorMarkdownInlineSub",
                title: window.siyuan.languages.editorMarkdownInlineSub,
                desc: window.siyuan.languages.editorMarkdownInlineSubTip,
            },
            {
                type: "switch",
                id: "editorMarkdownInlineTag",
                title: window.siyuan.languages.editorMarkdownInlineTag,
                desc: window.siyuan.languages.editorMarkdownInlineTagTip,
            },
            {
                type: "switch",
                id: "editorMarkdownInlineMath",
                title: window.siyuan.languages.editorMarkdownInlineMath,
                desc: window.siyuan.languages.editorMarkdownInlineMathTip,
            },
            {
                type: "switch",
                id: "editorMarkdownInlineStrikethrough",
                title: window.siyuan.languages.editorMarkdownInlineStrikethrough,
                desc: window.siyuan.languages.editorMarkdownInlineStrikethroughTip,
            },
            {
                type: "switch",
                id: "editorMarkdownInlineMark",
                title: window.siyuan.languages.editorMarkdownInlineMark,
                desc: window.siyuan.languages.editorMarkdownInlineMarkTip,
            },
        ],
    },
    {
        title: window.siyuan.languages.configGroupAdvanced,
        items: [
            {
                type: "text",
                id: "plantUMLServePath",
                title: window.siyuan.languages.md39,
                desc: window.siyuan.languages.md40,
            },
            {
                type: "custom",
                keywords: [window.siyuan.languages.katexMacros, window.siyuan.languages.katexMacrosTip],
                html: () => `<div class="b3-label">
    <div class="fn__block">
        ${window.siyuan.languages.katexMacros}
        <div class="b3-label__text">${window.siyuan.languages.katexMacrosTip}</div>
        <div class="fn__hr"></div>
        <textarea class="b3-text-field fn__block" id="katexMacros" spellcheck="false">${window.siyuan.config.editor.katexMacros}</textarea>
    </div>
</div>`,
            },
            {
                type: "switch",
                id: "allowSVGScript",
                title: window.siyuan.languages.allowSVGScript,
                desc: window.siyuan.languages.allowSVGScriptTip,
            },
            {
                type: "switch",
                id: "allowHTMLBLockScript",
                title: window.siyuan.languages.allowHTMLBLockScript,
                desc: window.siyuan.languages.allowHTMLBLockScriptTip,
            },
        ],
    },
];

/** 设置搜索「一级标签」索引：`getLang` 所用的 languages 键（过渡期，迁移至注册表驱动后可删） */
export const EDITOR_TAB_SEARCH_LANG_KEYS: string[] = [
    "editor",
    "configGroupBehavior",
    "configGroupBlockFeatures",
    "configGroupBidirectionalLinks",
    "configGroupMarkdownInlineSyntax",
    "configGroupAdvanced",
    "editReadonly",
    "editReadonlyTip",
    "spellcheck",
    "spellcheckTip",
    "spellcheckTip2",
    "md29",
    "md30",
    "outlineOutdent",
    "outlineOutdentTip",
    "listItemDotNumberClickFocus",
    "listItemDotNumberClickFocusTip",
    "pasteURLAutoConvert",
    "pasteURLAutoConvertTip",
    "dynamicLoadBlocks",
    "dynamicLoadBlocksTip",
    "md7",
    "md8",
    "md12",
    "md16",
    "embedBlockBreadcrumb",
    "embedBlockBreadcrumbTip",
    "headingEmbedMode",
    "headingEmbedModeTip",
    "showHeadingWithBlocks",
    "showHeadingOnlyTitle",
    "showHeadingOnlyBlocks",
    "md31",
    "md32",
    "md2",
    "md3",
    "md27",
    "md28",
    "onlySearchForDoc",
    "onlySearchForDocTip",
    "md37",
    "md38",
    "md33",
    "md34",
    "md9",
    "md35",
    "md36",
    "md41",
    "backlinkContainChildren",
    "backlinkContainChildrenTip",
    "backlinkExpand",
    "backlinkExpandTip",
    "backmentionExpand",
    "backmentionExpandTip",
    "editorMarkdownInlineAsterisk",
    "editorMarkdownInlineAsteriskTip",
    "editorMarkdownInlineUnderscore",
    "editorMarkdownInlineUnderscoreTip",
    "editorMarkdownInlineSup",
    "editorMarkdownInlineSupTip",
    "editorMarkdownInlineSub",
    "editorMarkdownInlineSubTip",
    "editorMarkdownInlineTag",
    "editorMarkdownInlineTagTip",
    "editorMarkdownInlineMath",
    "editorMarkdownInlineMathTip",
    "editorMarkdownInlineStrikethrough",
    "editorMarkdownInlineStrikethroughTip",
    "editorMarkdownInlineMark",
    "editorMarkdownInlineMarkTip",
    "md39",
    "md40",
    "katexMacros",
    "katexMacrosTip",
    "allowSVGScript",
    "allowSVGScriptTip",
    "allowHTMLBLockScript",
    "allowHTMLBLockScriptTip",
];
