import {updateHotkeyTip} from "../protyle/util/compatibility";
import {Constants} from "../constants";
import {
    type SettingSection,
    switchRow,
    textRow,
    textBlockRow,
    numberRow,
    rangeRow,
    selectRow,
    customRow,
    findSettingRowByControlId,
} from "./ui/settingRows";
import {filterSettingSections} from "./ui/search";
import {renderSettingTabHtmlFromSections} from "./ui/render";
import {readDomValue} from "./ui/formValue";
import {mergeRecordByDottedPath} from "./ui/dotPath";
import {fetchPost} from "../util/fetch";
import {getAllEditor} from "../layout/getAll";
import {setInlineStyle} from "../util/assets";
import {reloadProtyle} from "../protyle/util/reload";
import {resize} from "../protyle/util/resize";
import {mountSettingSaveHandlers} from "./ui/save";
import {isBrowser} from "../util/functions";
/// #if !BROWSER
import {ipcRenderer} from "electron";
/// #endif

export const editorSettings = {
    mount: async (root: HTMLElement, searchQuery?: string) => {
        const sections = filterSettingSections(buildEditorSections(), searchQuery);
        root.innerHTML = renderSettingTabHtmlFromSections(sections);
        await mountSettingSaveHandlers(root, sections);
    },

    set(el: HTMLElement, controlId: string) {
        if (!controlId.startsWith("editor.")) {
            return;
        }
        const row = findSettingRowByControlId(buildEditorSections(), controlId);
        const value = readDomValue(el, row);
        if (value !== undefined) {
            editorSettings.send(controlId, value);
        }
    },

    send(controlId: string, value: unknown) {
        if (!controlId.startsWith("editor.")) {
            return;
        }
        const rel = controlId.slice("editor.".length);
        if (!rel) {
            return;
        }
        const prev = window.siyuan.config.editor as unknown as Record<string, unknown>;
        const payload = mergeRecordByDottedPath(prev, rel, value) as unknown as Config.IEditor;
        fetchPost("/api/setting/setEditor", payload, (response) => {
            // 当前修改编辑器设置之后内核不推送到所有前端实例，需要手动 apply
            editorSettings.apply(response.data);
        });
    },

    apply(data: Config.IEditor) {
        window.siyuan.config.editor = data;
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
    const browser = isBrowser();
    return [
        {
            title: window.siyuan.languages.configGroupBehavior,
            items: [
                switchRow({
                    id: "editor.readOnly",
                    title: (() => {
                        const keymap = window.siyuan.config.keymap.general.editReadonly.custom;
                        return `${window.siyuan.languages.editReadonly} <code class="fn__code${keymap ? "" : " fn__none"}">${updateHotkeyTip(keymap)}</code>`;
                    })(),
                    desc: window.siyuan.languages.editReadonlyTip,
                }),
                switchRow({
                    id: "editor.spellcheck",
                    title: window.siyuan.languages.spellcheck,
                    desc: browser ? window.siyuan.languages.spellcheckTip : window.siyuan.languages.spellcheckTip2,
                    bind: async (root) => {
                        /// #if !BROWSER
                        const spellcheckSwitch = root.querySelector<HTMLInputElement>(`#${CSS.escape("editor.spellcheck")}`);
                        if (!spellcheckSwitch) {
                            return;
                        }
                        const toggleSpellcheckLanguagesWrap = () => {
                            root.querySelector(`#${CSS.escape("editor.spellcheckLanguages")}`)?.closest(".b3-label")?.classList.toggle("fn__none", !spellcheckSwitch.checked);
                        };
                        spellcheckSwitch.addEventListener("change", toggleSpellcheckLanguagesWrap);
                        toggleSpellcheckLanguagesWrap();
                        /// #endif
                    },
                }),
                customRow({
                    keywords: [
                        // 使用跟前面一样的关键词，搜索时就能同时匹配到
                        window.siyuan.languages.spellcheck,
                        browser ? window.siyuan.languages.spellcheckTip : window.siyuan.languages.spellcheckTip2,
                    ],
                    html: () => `<div class="fn__flex b3-label fn__none">
    <div class="b3-chips" id="editor.spellcheckLanguages"></div>
</div>`,
                    bind: async (root) => {
                        /// #if !BROWSER
                        const spellcheckLanguagesEl = root.querySelector<HTMLDivElement>(`#${CSS.escape("editor.spellcheckLanguages")}`);
                        if (!spellcheckLanguagesEl) {
                            return;
                        }
                        const languages: string[] = await ipcRenderer.invoke(Constants.SIYUAN_GET, {
                            cmd: "availableSpellCheckerLanguages",
                        });
                        const spellcheckLanguagesHTMLArr: string[] = [];
                        for (const item of languages) {
                            spellcheckLanguagesHTMLArr.push(
                                `<div class="fn__pointer b3-chip b3-chip--middle${window.siyuan.config.editor.spellcheckLanguages.includes(item) ? " b3-chip--current" : ""}">${item}</div>`
                            );
                        }
                        spellcheckLanguagesEl.innerHTML = spellcheckLanguagesHTMLArr.join("");
                        spellcheckLanguagesEl.addEventListener("click", (event) => {
                            const target = event.target as Element;
                            if (target.classList.contains("b3-chip")) {
                                target.classList.toggle("b3-chip--current");
                                const selectedLanguages = Array.from(spellcheckLanguagesEl.querySelectorAll(".b3-chip--current")).map((el) => el.textContent || "");
                                ipcRenderer.send(Constants.SIYUAN_CMD, {
                                    cmd: "setSpellCheckerLanguages",
                                    languages: selectedLanguages,
                                });
                                editorSettings.send("editor.spellcheckLanguages", selectedLanguages);
                            }
                        });
                        /// #endif
                    },
                }),
                rangeRow({
                    id: "editor.codeTabSpaces",
                    title: window.siyuan.languages.md29,
                    desc: window.siyuan.languages.md30,
                    min: 0,
                    max: 8,
                    step: 2,
                }),
                switchRow({
                    id: "editor.listLogicalOutdent",
                    title: window.siyuan.languages.outlineOutdent,
                    desc: window.siyuan.languages.outlineOutdentTip,
                }),
                switchRow({
                    id: "editor.listItemDotNumberClickFocus",
                    title: window.siyuan.languages.listItemDotNumberClickFocus,
                    desc: window.siyuan.languages.listItemDotNumberClickFocusTip,
                }),
                switchRow({
                    id: "editor.pasteURLAutoConvert",
                    title: window.siyuan.languages.pasteURLAutoConvert,
                    desc: window.siyuan.languages.pasteURLAutoConvertTip,
                }),
                numberRow({
                    id: "editor.dynamicLoadBlocks",
                    title: window.siyuan.languages.dynamicLoadBlocks,
                    desc: window.siyuan.languages.dynamicLoadBlocksTip,
                    min: 48,
                }),
            ],
        },
        {
            title: window.siyuan.languages.configGroupBlockFeatures,
            items: [
                switchRow({
                    id: "editor.displayNetImgMark",
                    title: window.siyuan.languages.md7,
                    desc: window.siyuan.languages.md8,
                }),
                switchRow({
                    id: "editor.displayBookmarkIcon",
                    title: window.siyuan.languages.md12,
                    desc: window.siyuan.languages.md16,
                }),
                switchRow({
                    id: "editor.embedBlockBreadcrumb",
                    title: window.siyuan.languages.embedBlockBreadcrumb,
                    desc: window.siyuan.languages.embedBlockBreadcrumbTip,
                }),
                selectRow({
                    id: "editor.headingEmbedMode",
                    options: [
                        {value: 0, label: window.siyuan.languages.showHeadingWithBlocks},
                        {value: 1, label: window.siyuan.languages.showHeadingOnlyTitle},
                        {value: 2, label: window.siyuan.languages.showHeadingOnlyBlocks},
                    ],
                    value: window.siyuan.config.editor.headingEmbedMode,
                    title: window.siyuan.languages.headingEmbedMode,
                    desc: window.siyuan.languages.headingEmbedModeTip,
                }),
                switchRow({
                    id: "editor.codeLineWrap",
                    title: window.siyuan.languages.md31,
                    desc: window.siyuan.languages.md32,
                }),
                switchRow({
                    id: "editor.codeLigatures",
                    title: window.siyuan.languages.md2,
                    desc: window.siyuan.languages.md3,
                }),
                switchRow({
                    id: "editor.codeSyntaxHighlightLineNum",
                    title: window.siyuan.languages.md27,
                    desc: window.siyuan.languages.md28,
                }),
            ],
        },
        {
            title: window.siyuan.languages.configGroupBidirectionalLinks,
            items: [
                switchRow({
                    id: "editor.onlySearchForDoc",
                    title: window.siyuan.languages.onlySearchForDoc,
                    desc: window.siyuan.languages.onlySearchForDocTip,
                }),
                numberRow({
                    id: "editor.blockRefDynamicAnchorTextMaxLen",
                    title: window.siyuan.languages.md37,
                    desc: window.siyuan.languages.md38,
                    min: 1,
                    max: 5120,
                }),
                switchRow({
                    id: "editor.virtualBlockRef",
                    title: window.siyuan.languages.md33,
                    desc: window.siyuan.languages.md34,
                }),
                textBlockRow({
                    id: "editor.virtualBlockRefInclude",
                    title: window.siyuan.languages.md9,
                    desc: window.siyuan.languages.md36,
                    mode: "textarea",
                    value: window.siyuan.config.editor.virtualBlockRefInclude,
                }),
                textBlockRow({
                    id: "editor.virtualBlockRefExclude",
                    title: window.siyuan.languages.md35,
                    desc: window.siyuan.languages.md41,
                    mode: "textarea",
                    value: window.siyuan.config.editor.virtualBlockRefExclude,
                }),
                switchRow({
                    id: "editor.backlinkContainChildren",
                    title: window.siyuan.languages.backlinkContainChildren,
                    desc: window.siyuan.languages.backlinkContainChildrenTip,
                }),
                numberRow({
                    id: "editor.backlinkExpandCount",
                    title: window.siyuan.languages.backlinkExpand,
                    desc: window.siyuan.languages.backlinkExpandTip,
                    min: 0,
                    max: 512,
                }),
                numberRow({
                    id: "editor.backmentionExpandCount",
                    title: window.siyuan.languages.backmentionExpand,
                    desc: window.siyuan.languages.backmentionExpandTip,
                    min: -1,
                    max: 512,
                }),
            ],
        },
        {
            title: window.siyuan.languages.configGroupMarkdownInlineSyntax,
            items: [
                switchRow({
                    id: "editor.markdown.inlineAsterisk",
                    title: window.siyuan.languages.editorMarkdownInlineAsterisk,
                    desc: window.siyuan.languages.editorMarkdownInlineAsteriskTip,
                }),
                switchRow({
                    id: "editor.markdown.inlineUnderscore",
                    title: window.siyuan.languages.editorMarkdownInlineUnderscore,
                    desc: window.siyuan.languages.editorMarkdownInlineUnderscoreTip,
                }),
                switchRow({
                    id: "editor.markdown.inlineSup",
                    title: window.siyuan.languages.editorMarkdownInlineSup,
                    desc: window.siyuan.languages.editorMarkdownInlineSupTip,
                }),
                switchRow({
                    id: "editor.markdown.inlineSub",
                    title: window.siyuan.languages.editorMarkdownInlineSub,
                    desc: window.siyuan.languages.editorMarkdownInlineSubTip,
                }),
                switchRow({
                    id: "editor.markdown.inlineTag",
                    title: window.siyuan.languages.editorMarkdownInlineTag,
                    desc: window.siyuan.languages.editorMarkdownInlineTagTip,
                }),
                switchRow({
                    id: "editor.markdown.inlineMath",
                    title: window.siyuan.languages.editorMarkdownInlineMath,
                    desc: window.siyuan.languages.editorMarkdownInlineMathTip,
                }),
                switchRow({
                    id: "editor.markdown.inlineStrikethrough",
                    title: window.siyuan.languages.editorMarkdownInlineStrikethrough,
                    desc: window.siyuan.languages.editorMarkdownInlineStrikethroughTip,
                }),
                switchRow({
                    id: "editor.markdown.inlineMark",
                    title: window.siyuan.languages.editorMarkdownInlineMark,
                    desc: window.siyuan.languages.editorMarkdownInlineMarkTip,
                }),
            ],
        },
        {
            title: window.siyuan.languages.configGroupAdvanced,
            items: [
                textRow({
                    id: "editor.plantUMLServePath",
                    title: window.siyuan.languages.md39,
                    desc: window.siyuan.languages.md40,
                }),
                textBlockRow({
                    id: "editor.katexMacros",
                    title: window.siyuan.languages.katexMacros,
                    desc: window.siyuan.languages.katexMacrosTip,
                    mode: "textarea",
                    value: window.siyuan.config.editor.katexMacros,
                }),
                switchRow({
                    id: "editor.allowSVGScript",
                    title: window.siyuan.languages.allowSVGScript,
                    desc: window.siyuan.languages.allowSVGScriptTip,
                }),
                switchRow({
                    id: "editor.allowHTMLBLockScript",
                    title: window.siyuan.languages.allowHTMLBLockScript,
                    desc: window.siyuan.languages.allowHTMLBLockScriptTip,
                }),
            ],
        },
    ];
}
