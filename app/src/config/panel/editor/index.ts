import {getAllEditor} from "../../../layout/getAll";
/// #if !BROWSER
import {ipcRenderer} from "electron";
/// #endif
import {setInlineStyle} from "../../../util/assets";
import {fetchPost} from "../../../util/fetch";
import {reloadProtyle} from "../../../protyle/util/reload";
import {resize} from "../../../protyle/util/resize";
import {setReadOnly} from "../../util/setReadOnly";
import {Constants} from "../../../constants";
import {renderEditorTabHtml} from "./renderEditorHtml";

const byId = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

export const editor = {
    element: undefined as Element,
    genHTML: () => renderEditorTabHtml(),
    bindEvent: async () => {
        /// #if !BROWSER
        const languages: string[] = await ipcRenderer.invoke(Constants.SIYUAN_GET, {
            cmd: "availableSpellCheckerLanguages",
        });
        let spellcheckLanguagesHTML = "";
        languages.forEach(item => {
            spellcheckLanguagesHTML += `<div class="fn__pointer b3-chip b3-chip--middle${window.siyuan.config.editor.spellcheckLanguages.includes(item) ? " b3-chip--current" : ""}">${item}</div>`;
        });
        const spellcheckLanguagesElement = byId<HTMLDivElement>("spellcheckLanguages");
        spellcheckLanguagesElement.innerHTML = spellcheckLanguagesHTML;
        spellcheckLanguagesElement.addEventListener("click", (event) => {
            const target = event.target as Element;
            if (target.classList.contains("b3-chip")) {
                target.classList.toggle("b3-chip--current");
                ipcRenderer.send(Constants.SIYUAN_CMD, {
                    cmd: "setSpellCheckerLanguages",
                    languages: Array.from(spellcheckLanguagesElement.querySelectorAll(".b3-chip--current")).map(item => item.textContent)
                });
                setEditor();
            }
        });
        if (window.siyuan.config.editor.spellcheck) {
            spellcheckLanguagesElement.classList.remove("fn__none");
        }
        /// #endif

        const setEditor = () => {
            let dynamicLoadBlocks = parseInt(byId<HTMLInputElement>("dynamicLoadBlocks").value);
            if (48 > dynamicLoadBlocks) {
                dynamicLoadBlocks = 48;
                byId<HTMLInputElement>("dynamicLoadBlocks").value = "48";
            }

            fetchPost("/api/setting/setEditor", {
                ...window.siyuan.config.editor,
                markdown: {
                    inlineAsterisk: byId<HTMLInputElement>("editorMarkdownInlineAsterisk").checked,
                    inlineUnderscore: byId<HTMLInputElement>("editorMarkdownInlineUnderscore").checked,
                    inlineSup: byId<HTMLInputElement>("editorMarkdownInlineSup").checked,
                    inlineSub: byId<HTMLInputElement>("editorMarkdownInlineSub").checked,
                    inlineTag: byId<HTMLInputElement>("editorMarkdownInlineTag").checked,
                    inlineMath: byId<HTMLInputElement>("editorMarkdownInlineMath").checked,
                    inlineStrikethrough: byId<HTMLInputElement>("editorMarkdownInlineStrikethrough").checked,
                    inlineMark: byId<HTMLInputElement>("editorMarkdownInlineMark").checked
                },
                allowSVGScript: byId<HTMLInputElement>("allowSVGScript").checked,
                allowHTMLBLockScript: byId<HTMLInputElement>("allowHTMLBLockScript").checked,
                readOnly: byId<HTMLInputElement>("readOnly").checked,
                displayBookmarkIcon: byId<HTMLInputElement>("displayBookmarkIcon").checked,
                displayNetImgMark: byId<HTMLInputElement>("displayNetImgMark").checked,
                codeSyntaxHighlightLineNum: byId<HTMLInputElement>("codeSyntaxHighlightLineNum").checked,
                embedBlockBreadcrumb: byId<HTMLInputElement>("embedBlockBreadcrumb").checked,
                headingEmbedMode: parseInt(byId<HTMLSelectElement>("headingEmbedMode").value),
                listLogicalOutdent: byId<HTMLInputElement>("listLogicalOutdent").checked,
                listItemDotNumberClickFocus: byId<HTMLInputElement>("listItemDotNumberClickFocus").checked,
                spellcheck: byId<HTMLInputElement>("spellcheck").checked,
                /// #if !BROWSER
                spellcheckLanguages: Array.from(spellcheckLanguagesElement.querySelectorAll(".b3-chip--current")).map(item => item.textContent),
                /// #endif
                onlySearchForDoc: byId<HTMLInputElement>("onlySearchForDoc").checked,
                pasteURLAutoConvert: byId<HTMLInputElement>("pasteURLAutoConvert").checked,
                plantUMLServePath: byId<HTMLInputElement>("plantUMLServePath").value,
                katexMacros: byId<HTMLTextAreaElement>("katexMacros").value,
                codeLineWrap: byId<HTMLInputElement>("codeLineWrap").checked,
                virtualBlockRef: byId<HTMLInputElement>("virtualBlockRef").checked,
                virtualBlockRefInclude: byId<HTMLTextAreaElement>("virtualBlockRefInclude").value,
                virtualBlockRefExclude: byId<HTMLTextAreaElement>("virtualBlockRefExclude").value,
                blockRefDynamicAnchorTextMaxLen: parseInt(byId<HTMLInputElement>("blockRefDynamicAnchorTextMaxLen").value),
                backlinkExpandCount: parseInt(byId<HTMLInputElement>("backlinkExpandCount").value),
                backmentionExpandCount: parseInt(byId<HTMLInputElement>("backmentionExpandCount").value),
                backlinkContainChildren: byId<HTMLInputElement>("backlinkContainChildren").checked,
                dynamicLoadBlocks: dynamicLoadBlocks,
                codeLigatures: byId<HTMLInputElement>("codeLigatures").checked,
                codeTabSpaces: parseInt(byId<HTMLInputElement>("codeTabSpaces").value),
            }, response => {
                editor._onSetEditor(response.data);
            });
        };
        editor.element.querySelectorAll("input.b3-switch, select.b3-select, input.b3-slider").forEach((item) => {
            item.addEventListener("change", () => {
                setEditor();
                /// #if !BROWSER
                if (item.id === "spellcheck") {
                    spellcheckLanguagesElement.classList.toggle("fn__none");
                }
                /// #endif
            });
        });
        editor.element.querySelectorAll("textarea.b3-text-field, input.b3-text-field, input.b3-slider").forEach((item) => {
            if (!item.getAttribute("readonly")) {
                item.addEventListener("blur", () => {
                    setEditor();
                });
            }
        });
        editor.element.querySelectorAll("input.b3-slider").forEach((item) => {
            item.addEventListener("input", (event) => {
                const target = event.target as HTMLInputElement;
                target.parentElement.setAttribute("aria-label", target.value);
            });
        });
    },
    _onSetEditor: (editorData: Config.IEditor) => {
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

        setInlineStyle();
    }
};
