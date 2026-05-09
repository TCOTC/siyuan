import {getAllEditor} from "../../../layout/getAll";
import {setInlineStyle} from "../../../util/assets";
import {fetchPost} from "../../../util/fetch";
import {reloadProtyle} from "../../../protyle/util/reload";
import {resize} from "../../../protyle/util/resize";
import {setReadOnly} from "../../util/setReadOnly";
import {Constants} from "../../../constants";
import {getEditorSections} from "./editorEntries";
import type {EditorBindApi} from "./editorBindApi";
import {mergeEditorFromControlId} from "./editorMergePatch";
import {renderEditorTabHtml} from "./renderEditorHtml";

export const editor = {
    element: undefined as Element,
    genHTML: () => renderEditorTabHtml(),
    bindEvent: async () => {
        const root = editor.element as HTMLElement;
        const scheduleSave = (controlId: string) => {
            fetchPost("/api/setting/setEditor", mergeEditorFromControlId(root, controlId), (response) => {
                editor._onSetEditor(response.data);
            });
        };
        const api: EditorBindApi = {root, scheduleSave};

        for (const section of getEditorSections()) {
            for (const row of section.items) {
                if (row.type === "custom" && row.bind) {
                    await row.bind(api);
                }
            }
        }

        root.querySelectorAll("input.b3-switch, select.b3-select, input.b3-slider").forEach((item) => {
            item.addEventListener("change", () => {
                const id = item.id;
                if (!id) {
                    return;
                }
                scheduleSave(id);
                /// #if !BROWSER
                if (id === "spellcheck") {
                    root.querySelector("#spellcheckLanguages")?.classList.toggle("fn__none");
                }
                /// #endif
            });
        });
        root.querySelectorAll("textarea.b3-text-field, input.b3-text-field, input.b3-slider").forEach((item) => {
            if (!item.getAttribute("readonly")) {
                item.addEventListener("blur", () => {
                    const id = item.id;
                    if (!id) {
                        return;
                    }
                    scheduleSave(id);
                });
            }
        });
        root.querySelectorAll("input.b3-slider").forEach((item) => {
            item.addEventListener("input", (event) => {
                const target = event.target as HTMLInputElement;
                target.parentElement?.setAttribute("aria-label", target.value);
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
    },
};
