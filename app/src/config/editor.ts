import {updateHotkeyTip} from "../protyle/util/compatibility";
import {Constants} from "../constants";
import type {SettingBindApi, SettingSection} from "./ui/types";
import {filterSettingSections} from "./ui/search";
import {renderSettingTabHtmlFromSections} from "./ui/render";
import {readDomValueFromEl} from "./ui/formValue";
import {mergeRecordByDottedPath} from "./ui/dotPath";
import {fetchPost} from "../util/fetch";
import {getAllEditor} from "../layout/getAll";
import {setInlineStyle} from "../util/assets";
import {reloadProtyle} from "../protyle/util/reload";
import {resize} from "../protyle/util/resize";
import {setReadOnly} from "./util/setReadOnly";
import {mountScheduleSettingSave} from "./ui/save";
/// #if !BROWSER
import {ipcRenderer} from "electron";
/// #endif


export const editor = {
    /**
     * 挂载编辑器设置
     * @param root 容器
     * @param searchQuery 搜索关键词
     */
    mount: async (root: HTMLElement, searchQuery?: string) => {
        const sections = filterSettingSections(buildEditorSections(), searchQuery);
        root.innerHTML = renderSettingTabHtmlFromSections(sections);
        await mountScheduleSettingSave(root, sections);
    },

    /** 从 DOM 合并本次控件 → `setEditor` → 用响应写回 `window.siyuan.config.editor` 并刷新界面 */
    send(root: HTMLElement, controlId: string) {
        const prev = window.siyuan.config.editor;
        let payload: Config.IEditor = prev;
        if (controlId.startsWith("editor.")) {
            let spellcheckLanguagesBranchDone = false;
            /// #if !BROWSER
            if (controlId === "editor.spellcheckLanguages") {
                const spellcheckLanguagesElement = root.querySelector<HTMLElement>(
                    `[id="${CSS.escape("editor.spellcheckLanguages")}"]`
                );
                payload = {
                    ...prev,
                    spellcheckLanguages: spellcheckLanguagesElement
                        ? Array.from(spellcheckLanguagesElement.querySelectorAll(".b3-chip--current")).map(
                              (item) => item.textContent || ""
                          )
                        : window.siyuan.config.editor.spellcheckLanguages,
                };
                spellcheckLanguagesBranchDone = true;
            }
            /// #endif
            if (!spellcheckLanguagesBranchDone) {
                const el = root.querySelector<HTMLElement>(`[id="${CSS.escape(controlId)}"]`);
                if (el) {
                    const value = readDomValueFromEl(el);
                    if (value !== undefined) {
                        const rel = controlId.slice("editor.".length);
                        payload = mergeRecordByDottedPath(
                            prev as unknown as Record<string, unknown>,
                            rel,
                            value
                        ) as unknown as Config.IEditor;
                    }
                }
            }
        }
        fetchPost("/api/setting/setEditor", payload, (response) => {
            editor.apply(response.data);
        });
    },

    /** 将服务端返回的 `IEditor` 写回全局配置并刷新各编辑器实例（外观页等也会调用） */
    apply(editorData: Config.IEditor) {
        const changeReadonly = editorData.readOnly !== window.siyuan.config.editor.readOnly;
        if (changeReadonly) {
            setReadOnly(editorData.readOnly);
        }
        window.siyuan.config.editor = editorData;
        getAllEditor().forEach((editorItem) => {
            const protyle = editorItem.protyle;
            reloadProtyle(protyle, false);
            let isFullWidth = protyle.wysiwyg.element.getAttribute(Constants.CUSTOM_SY_FULLWIDTH);
            if (!isFullWidth) {
                isFullWidth = window.siyuan.config.editor.fullWidth ? "true" : "false";
            }
            if (isFullWidth === "true" && protyle.contentElement.getAttribute("data-fullwidth") === "true") {
                return;
            }
            resize(protyle);
            if (isFullWidth === "true") {
                protyle.contentElement.setAttribute("data-fullwidth", "true");
            } else {
                protyle.contentElement.removeAttribute("data-fullwidth");
            }
        });

        void setInlineStyle();
    },
};

/** 每次调用时重新构造，避免缓存住随语言/配置变化的文案与闭包。全量列表供 `filterSettingSections(..., searchQuery)` 使用。 */
export function buildEditorSections(): SettingSection[] {
    return [
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
    <input class="b3-switch fn__flex-center" id="editor.readOnly" type="checkbox"${cfg.editor.readOnly ? " checked" : ""}/>
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
        <input class="b3-switch fn__flex-center" id="editor.spellcheck" type="checkbox"${window.siyuan.config.editor.spellcheck ? " checked" : ""}/>
    </label>
    <div class="b3-chips fn__none" id="editor.spellcheckLanguages"></div>
</div>`;
                    },
                    bind: async (api: SettingBindApi) => {
                        /// #if !BROWSER
                        const {root, scheduleSave} = api;
                        const spellcheckSwitch = root.querySelector<HTMLInputElement>(`[id="${CSS.escape("editor.spellcheck")}"]`);
                        const spellcheckLanguagesElement = root.querySelector<HTMLDivElement>(`[id="${CSS.escape("editor.spellcheckLanguages")}"]`);
                        if (!spellcheckSwitch || !spellcheckLanguagesElement) {
                            return;
                        }

                        const syncSpellcheckLanguagesVisibility = () => {
                            spellcheckLanguagesElement.classList.toggle("fn__none", !spellcheckSwitch.checked);
                        };
                        spellcheckSwitch.addEventListener("change", syncSpellcheckLanguagesVisibility);
                        syncSpellcheckLanguagesVisibility();

                        const languages: string[] = await ipcRenderer.invoke(Constants.SIYUAN_GET, {
                            cmd: "availableSpellCheckerLanguages",
                        });
                        let spellcheckLanguagesHTML = "";
                        languages.forEach((item) => {
                            spellcheckLanguagesHTML += `<div class="fn__pointer b3-chip b3-chip--middle${window.siyuan.config.editor.spellcheckLanguages.includes(item) ? " b3-chip--current" : ""}">${item}</div>`;
                        });
                        spellcheckLanguagesElement.innerHTML = spellcheckLanguagesHTML;
                        spellcheckLanguagesElement.addEventListener("click", (event) => {
                            const target = event.target as Element;
                            if (target.classList.contains("b3-chip")) {
                                target.classList.toggle("b3-chip--current");
                                ipcRenderer.send(Constants.SIYUAN_CMD, {
                                    cmd: "setSpellCheckerLanguages",
                                    languages: Array.from(spellcheckLanguagesElement.querySelectorAll(".b3-chip--current")).map((item) => item.textContent),
                                });
                                scheduleSave("editor.spellcheckLanguages");
                            }
                        });
                        /// #endif
                    },
                },
                {
                    type: "range",
                    id: "editor.codeTabSpaces",
                    min: 0,
                    max: 8,
                    step: 2,
                    title: window.siyuan.languages.md29,
                    desc: window.siyuan.languages.md30,
                },
                {
                    type: "switch",
                    id: "editor.listLogicalOutdent",
                    title: window.siyuan.languages.outlineOutdent,
                    desc: window.siyuan.languages.outlineOutdentTip,
                },
                {
                    type: "switch",
                    id: "editor.listItemDotNumberClickFocus",
                    title: window.siyuan.languages.listItemDotNumberClickFocus,
                    desc: window.siyuan.languages.listItemDotNumberClickFocusTip,
                },
                {
                    type: "switch",
                    id: "editor.pasteURLAutoConvert",
                    title: window.siyuan.languages.pasteURLAutoConvert,
                    desc: window.siyuan.languages.pasteURLAutoConvertTip,
                },
                {
                    type: "number",
                    id: "editor.dynamicLoadBlocks",
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
                    id: "editor.displayNetImgMark",
                    title: window.siyuan.languages.md7,
                    desc: window.siyuan.languages.md8,
                },
                {
                    type: "switch",
                    id: "editor.displayBookmarkIcon",
                    title: window.siyuan.languages.md12,
                    desc: window.siyuan.languages.md16,
                },
                {
                    type: "switch",
                    id: "editor.embedBlockBreadcrumb",
                    title: window.siyuan.languages.embedBlockBreadcrumb,
                    desc: window.siyuan.languages.embedBlockBreadcrumbTip,
                },
                {
                    type: "select",
                    id: "editor.headingEmbedMode",
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
                    id: "editor.codeLineWrap",
                    title: window.siyuan.languages.md31,
                    desc: window.siyuan.languages.md32,
                },
                {
                    type: "switch",
                    id: "editor.codeLigatures",
                    title: window.siyuan.languages.md2,
                    desc: window.siyuan.languages.md3,
                },
                {
                    type: "switch",
                    id: "editor.codeSyntaxHighlightLineNum",
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
                    id: "editor.onlySearchForDoc",
                    title: window.siyuan.languages.onlySearchForDoc,
                    desc: window.siyuan.languages.onlySearchForDocTip,
                },
                {
                    type: "number",
                    id: "editor.blockRefDynamicAnchorTextMaxLen",
                    min: 1,
                    max: 5120,
                    title: window.siyuan.languages.md37,
                    desc: window.siyuan.languages.md38,
                },
                {
                    type: "switch",
                    id: "editor.virtualBlockRef",
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
        <textarea class="b3-text-field fn__block" id="editor.virtualBlockRefInclude">${window.siyuan.config.editor.virtualBlockRefInclude}</textarea>
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
        <textarea class="b3-text-field fn__block" id="editor.virtualBlockRefExclude">${window.siyuan.config.editor.virtualBlockRefExclude}</textarea>
    </div>
</div>`,
                },
                {
                    type: "switch",
                    id: "editor.backlinkContainChildren",
                    title: window.siyuan.languages.backlinkContainChildren,
                    desc: window.siyuan.languages.backlinkContainChildrenTip,
                },
                {
                    type: "number",
                    id: "editor.backlinkExpandCount",
                    min: 0,
                    max: 512,
                    title: window.siyuan.languages.backlinkExpand,
                    desc: window.siyuan.languages.backlinkExpandTip,
                },
                {
                    type: "number",
                    id: "editor.backmentionExpandCount",
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
                    id: "editor.markdown.inlineAsterisk",
                    title: window.siyuan.languages.editorMarkdownInlineAsterisk,
                    desc: window.siyuan.languages.editorMarkdownInlineAsteriskTip,
                },
                {
                    type: "switch",
                    id: "editor.markdown.inlineUnderscore",
                    title: window.siyuan.languages.editorMarkdownInlineUnderscore,
                    desc: window.siyuan.languages.editorMarkdownInlineUnderscoreTip,
                },
                {
                    type: "switch",
                    id: "editor.markdown.inlineSup",
                    title: window.siyuan.languages.editorMarkdownInlineSup,
                    desc: window.siyuan.languages.editorMarkdownInlineSupTip,
                },
                {
                    type: "switch",
                    id: "editor.markdown.inlineSub",
                    title: window.siyuan.languages.editorMarkdownInlineSub,
                    desc: window.siyuan.languages.editorMarkdownInlineSubTip,
                },
                {
                    type: "switch",
                    id: "editor.markdown.inlineTag",
                    title: window.siyuan.languages.editorMarkdownInlineTag,
                    desc: window.siyuan.languages.editorMarkdownInlineTagTip,
                },
                {
                    type: "switch",
                    id: "editor.markdown.inlineMath",
                    title: window.siyuan.languages.editorMarkdownInlineMath,
                    desc: window.siyuan.languages.editorMarkdownInlineMathTip,
                },
                {
                    type: "switch",
                    id: "editor.markdown.inlineStrikethrough",
                    title: window.siyuan.languages.editorMarkdownInlineStrikethrough,
                    desc: window.siyuan.languages.editorMarkdownInlineStrikethroughTip,
                },
                {
                    type: "switch",
                    id: "editor.markdown.inlineMark",
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
                    id: "editor.plantUMLServePath",
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
        <textarea class="b3-text-field fn__block" id="editor.katexMacros" spellcheck="false">${window.siyuan.config.editor.katexMacros}</textarea>
    </div>
</div>`,
                },
                {
                    type: "switch",
                    id: "editor.allowSVGScript",
                    title: window.siyuan.languages.allowSVGScript,
                    desc: window.siyuan.languages.allowSVGScriptTip,
                },
                {
                    type: "switch",
                    id: "editor.allowHTMLBLockScript",
                    title: window.siyuan.languages.allowHTMLBLockScript,
                    desc: window.siyuan.languages.allowHTMLBLockScriptTip,
                },
            ],
        },
    ];
}
