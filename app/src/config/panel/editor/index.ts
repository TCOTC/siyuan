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
import {renderEditorTabHtmlFromSections} from "./renderEditorHtml";

export const editor = {
    /**
     * 挂载编辑器设置
     * @param root 容器
     * @param searchQuery 搜索关键词
     */
    mount: async (root: HTMLElement, searchQuery?: string) => {
        root.innerHTML = renderEditorTabHtmlFromSections(getEditorSections(searchQuery));

        const scheduleSave = (controlId: string) => {
            if (!controlId) {
                return;
            }
            fetchPost("/api/setting/setEditor", mergeEditorFromControlId(root, controlId), (response) => {
                editor.onSetEditor(response.data);
            });
        };
        for (const section of getEditorSections()) {
            for (const row of section.items) {
                if (row.type === "custom" && row.bind) {
                    await row.bind({
                        root,
                        scheduleSave
                    } as EditorBindApi);
                }
            }
        }

        root.querySelectorAll("input.b3-switch, input.b3-slider, select.b3-select").forEach((item) => {
            item.addEventListener("change", () => {
                scheduleSave(item.id);
                /// #if !BROWSER
                if (item.id === "spellcheck") {
                    root.querySelector("#spellcheckLanguages")?.classList.toggle("fn__none", !(item as HTMLInputElement).checked);
                }
                /// #endif
            });
        });
        root.querySelectorAll("textarea.b3-text-field, input.b3-text-field").forEach((item) => {
            item.addEventListener("blur", () => {
                scheduleSave(item.id);
            });
        });
    },
    onSetEditor: (editorData: Config.IEditor) => {
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
