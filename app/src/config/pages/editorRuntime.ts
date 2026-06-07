import {fetchPost} from "../../util/fetch";
import {mergeRecordByDottedPath} from "../ui/dotPath";
import {Constants} from "../../constants";
import {getAllEditor} from "../../layout/getAll";
import {setInlineStyle} from "../../util/assets";
import {reloadProtyle} from "../../protyle/util/reload";
import {resize} from "../../protyle/util/resize";

/** 将内核返回的编辑器配置应用到当前前端实例 */
export const applyEditorConfig = (data: Config.IEditor) => {
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
};

const postEditorConfig = (payload: Config.IEditor) => {
    fetchPost("/api/setting/setEditor", payload, (response) => {
        // 当前修改编辑器设置之后内核不推送到所有前端实例，需要手动 apply
        applyEditorConfig(response.data);
    });
};

const mergeAndPost = (rel: string, value: unknown) => {
    if (!rel) {
        return;
    }
    const prev = window.siyuan.config.editor as unknown as Record<string, unknown>;
    const payload = mergeRecordByDottedPath(prev, rel, value) as unknown as Config.IEditor;
    postEditorConfig(payload);
};

/** 编辑器命名空间：设置面板注册项 save、设置面板外入口共用 */
export const editorConfigApi = {
    patch(relOrFullId: string, value: unknown) {
        const rel = relOrFullId.startsWith("editor.")
            ? relOrFullId.slice("editor.".length)
            : relOrFullId;
        mergeAndPost(rel, value);
    },

    /** 完整控件 id（`editor.xxx`），供快捷键等设置面板外入口使用 */
    send(controlId: string, value: unknown) {
        if (!controlId.startsWith("editor.")) {
            return;
        }
        mergeAndPost(controlId.slice("editor.".length), value);
    },

    apply: applyEditorConfig,
};
