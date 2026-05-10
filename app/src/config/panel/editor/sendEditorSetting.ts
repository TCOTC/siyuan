import {fetchPost} from "../../../util/fetch";
import {mergeEditorFromControlId} from "./editorMergePatch";
import {applyEditorServerConfig} from "./applyEditorServerConfig";

/** `mergeEditorFromControlId` → `setEditor` → 用响应写回 `window.siyuan.config.editor` 并刷新界面 */
export const sendEditorSettingFromControl = (root: HTMLElement, controlId: string) => {
    fetchPost("/api/setting/setEditor", mergeEditorFromControlId(root, controlId), (response) => {
        applyEditorServerConfig(response.data);
    });
};
