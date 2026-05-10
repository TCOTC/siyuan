import {buildEditorSections} from "./editorEntries";
import {filterSettingSections} from "../common/settingPanelSearch";
import {renderSettingTabHtmlFromSections} from "../common/renderSettingHtml";
import {readDomValueFromEl} from "../readDomControlValue";
import {mergeRecordByDottedPath} from "../../registry/mergeRecordByDottedPath";
import {fetchPost} from "../../../util/fetch";
import {getAllEditor} from "../../../layout/getAll";
import {setInlineStyle} from "../../../util/assets";
import {reloadProtyle} from "../../../protyle/util/reload";
import {resize} from "../../../protyle/util/resize";
import {setReadOnly} from "../../util/setReadOnly";
import {Constants} from "../../../constants";
import {mountScheduleSettingSave} from "../common/scheduleSettingSave";

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
