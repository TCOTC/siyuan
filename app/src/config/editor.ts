import {updateHotkeyTip} from "../protyle/util/compatibility";
import {Constants} from "../constants";
import {
    blockTextareaRow,
    customRow,
    findSettingRowByControlId,
    numberRow,
    rangeRow,
    selectRow,
    switchRow,
    textRow,
    type SettingBindApi,
    type SettingSection,
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
/// #if !BROWSER
import {ipcRenderer} from "electron";
/// #endif

export const editor = {
    mount: async (root: HTMLElement, searchQuery?: string) => {
        const sections = filterSettingSections(buildEditorSections(), searchQuery);
        root.innerHTML = renderSettingTabHtmlFromSections(sections);
        await mountSettingSaveHandlers(root, sections);
    },

    set(root: HTMLElement, controlId: string, sections: SettingSection[]) {
        if (!controlId.startsWith("editor.")) {
            return;
        }
        const el = root.querySelector<HTMLElement>(`[id="${CSS.escape(controlId)}"]`);
        if (!el) {
            return;
        }
        const row = findSettingRowByControlId(sections, controlId);
        const value = readDomValue(el, row);
        if (value !== undefined) {
            editor.send(controlId, value);
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
        const prev = window.siyuan.config.editor;
        const payload = mergeRecordByDottedPath(
            prev as unknown as Record<string, unknown>,
            rel,
            value
        ) as unknown as Config.IEditor;
        fetchPost("/api/setting/setEditor", payload, (response) => {
            editor.apply(response.data);
        });
    },

    apply(editorData: Config.IEditor) {
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
                customRow({
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
                }),
                customRow({
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
                        const {root} = api;
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
                                const selectedLanguages = Array.from(
                                    spellcheckLanguagesElement.querySelectorAll(".b3-chip--current")
                                ).map((item) => item.textContent || "");
                                ipcRenderer.send(Constants.SIYUAN_CMD, {
                                    cmd: "setSpellCheckerLanguages",
                                    languages: selectedLanguages,
                                });
                                editor.send("editor.spellcheckLanguages", selectedLanguages);
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
                blockTextareaRow({
                    id: "editor.virtualBlockRefInclude",
                    title: window.siyuan.languages.md9,
                    desc: window.siyuan.languages.md36,
                    getTextValue: () => window.siyuan.config.editor.virtualBlockRefInclude,
                }),
                blockTextareaRow({
                    id: "editor.virtualBlockRefExclude",
                    title: window.siyuan.languages.md35,
                    desc: window.siyuan.languages.md41,
                    getTextValue: () => window.siyuan.config.editor.virtualBlockRefExclude,
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
                blockTextareaRow({
                    id: "editor.katexMacros",
                    title: window.siyuan.languages.katexMacros,
                    desc: window.siyuan.languages.katexMacrosTip,
                    getTextValue: () => window.siyuan.config.editor.katexMacros,
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
