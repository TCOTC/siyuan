import {getAllEditor} from "../../../layout/getAll";
import {setInlineStyle} from "../../../util/assets";
import {reloadProtyle} from "../../../protyle/util/reload";
import {resize} from "../../../protyle/util/resize";
import {setReadOnly} from "../../util/setReadOnly";
import {Constants} from "../../../constants";

/** 将服务端返回的 `IEditor` 写回全局配置并刷新各编辑器实例（外观页等也会调用） */
export const applyEditorServerConfig = (editorData: Config.IEditor) => {
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
};
