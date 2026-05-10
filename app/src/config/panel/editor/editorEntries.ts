import {updateHotkeyTip} from "../../../protyle/util/compatibility";
import {Constants} from "../../../constants";
/// #if !BROWSER
import {ipcRenderer} from "electron";
/// #endif
import type {EditorBindApi} from "./editorBindApi";

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
          /** 方案 A：非标 DOM / 桌面特例在此绑定；工厂项走通用监听与按 `id` 合并（见 editorMergePatch） */
          bind?: (api: EditorBindApi) => void | Promise<void>;
      };

/** 一组设置：标题参与检索；行均在 `items` 内 */
export interface EditorSection {
    title: string;
    items: EditorRow[];
}

const textMatchesConfigSearch = (text: string, queryLower: string): boolean => {
    if (!queryLower) {
        return true;
    }
    const t = (text || "").toLowerCase().trim();
    if (!t) {
        return false;
    }
    return t.indexOf(queryLower) > -1;
};

const editorRowMatchesQuery = (row: EditorRow, queryLower: string): boolean => {
    switch (row.type) {
        case "custom":
            return row.keywords.some((k) => textMatchesConfigSearch(k, queryLower));
        case "select":
            if (
                textMatchesConfigSearch(row.title, queryLower) ||
                textMatchesConfigSearch(row.desc, queryLower)
            ) {
                return true;
            }
            return row.options.some((o) => textMatchesConfigSearch(o.label, queryLower));
        default:
            return (
                textMatchesConfigSearch(row.title, queryLower) ||
                textMatchesConfigSearch(row.desc, queryLower)
            );
    }
};

/** 每次调用时重新构造，避免缓存住随语言/配置变化的文案与闭包。
 * @param searchQuery 设置搜索关键词；不传或仅空白则返回完整列表，否则按节标题 / 行文案过滤（见 docs/settings-refactor.md §11.2）。
 */
export function getEditorSections(searchQuery?: string): EditorSection[] {
    const sections: EditorSection[] = [
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
                bind: async (api: EditorBindApi) => {
                    /// #if !BROWSER
                    const {root, scheduleSave} = api;
                    const languages: string[] = await ipcRenderer.invoke(Constants.SIYUAN_GET, {
                        cmd: "availableSpellCheckerLanguages",
                    });
                    let spellcheckLanguagesHTML = "";
                    languages.forEach((item) => {
                        spellcheckLanguagesHTML += `<div class="fn__pointer b3-chip b3-chip--middle${window.siyuan.config.editor.spellcheckLanguages.includes(item) ? " b3-chip--current" : ""}">${item}</div>`;
                    });
                    const spellcheckLanguagesElement = root.querySelector<HTMLDivElement>("#spellcheckLanguages");
                    if (!spellcheckLanguagesElement) {
                        return;
                    }
                    spellcheckLanguagesElement.innerHTML = spellcheckLanguagesHTML;
                    spellcheckLanguagesElement.addEventListener("click", (event) => {
                        const target = event.target as Element;
                        if (target.classList.contains("b3-chip")) {
                            target.classList.toggle("b3-chip--current");
                            ipcRenderer.send(Constants.SIYUAN_CMD, {
                                cmd: "setSpellCheckerLanguages",
                                languages: Array.from(
                                    spellcheckLanguagesElement.querySelectorAll(".b3-chip--current")
                                ).map((item) => item.textContent),
                            });
                            scheduleSave("spellcheckLanguages");
                        }
                    });
                    if (window.siyuan.config.editor.spellcheck) {
                        spellcheckLanguagesElement.classList.remove("fn__none");
                    }
                    /// #endif
                },
            },
            {
                type: "range",
                id: "codeTabSpaces",
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
                id: "markdown.inlineAsterisk",
                title: window.siyuan.languages.editorMarkdownInlineAsterisk,
                desc: window.siyuan.languages.editorMarkdownInlineAsteriskTip,
            },
            {
                type: "switch",
                id: "markdown.inlineUnderscore",
                title: window.siyuan.languages.editorMarkdownInlineUnderscore,
                desc: window.siyuan.languages.editorMarkdownInlineUnderscoreTip,
            },
            {
                type: "switch",
                id: "markdown.inlineSup",
                title: window.siyuan.languages.editorMarkdownInlineSup,
                desc: window.siyuan.languages.editorMarkdownInlineSupTip,
            },
            {
                type: "switch",
                id: "markdown.inlineSub",
                title: window.siyuan.languages.editorMarkdownInlineSub,
                desc: window.siyuan.languages.editorMarkdownInlineSubTip,
            },
            {
                type: "switch",
                id: "markdown.inlineTag",
                title: window.siyuan.languages.editorMarkdownInlineTag,
                desc: window.siyuan.languages.editorMarkdownInlineTagTip,
            },
            {
                type: "switch",
                id: "markdown.inlineMath",
                title: window.siyuan.languages.editorMarkdownInlineMath,
                desc: window.siyuan.languages.editorMarkdownInlineMathTip,
            },
            {
                type: "switch",
                id: "markdown.inlineStrikethrough",
                title: window.siyuan.languages.editorMarkdownInlineStrikethrough,
                desc: window.siyuan.languages.editorMarkdownInlineStrikethroughTip,
            },
            {
                type: "switch",
                id: "markdown.inlineMark",
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
    const queryLower = (searchQuery ?? "").trim().toLowerCase();
    if (!queryLower) {
        return sections;
    }
    const out: EditorSection[] = [];
    for (const section of sections) {
        if (textMatchesConfigSearch(section.title, queryLower)) {
            out.push(section);
            continue;
        }
        const items = section.items.filter((row) => editorRowMatchesQuery(row, queryLower));
        if (items.length > 0) {
            out.push({title: section.title, items});
        }
    }
    return out;
}

/** 编辑器 Tab 侧栏检索索引文案：「编辑器」标签名 + 注册表节标题、行文案与 `custom.keywords`（见 docs/settings-refactor.md §11）。 */
export function getEditorTabSearchStrings(): string[] {
    const strings: string[] = [window.siyuan.languages.editor];
    for (const section of getEditorSections()) {
        strings.push(section.title);
        for (const row of section.items) {
            switch (row.type) {
                case "custom":
                    strings.push(...row.keywords);
                    break;
                case "select":
                    strings.push(row.title, row.desc);
                    row.options.forEach((opt) => strings.push(opt.label));
                    break;
                default:
                    strings.push(row.title, row.desc);
                    break;
            }
        }
    }
    return strings;
}
