import {fetchPost} from "../../../util/fetch";
import {mergeFiletreeFromControlId} from "./fileMergePatch";

/** `mergeFiletreeFromControlId` → `setFiletree` → 用响应写回 `window.siyuan.config.fileTree` */
export const sendFiletreeSettingFromControl = (root: HTMLElement, controlId: string) => {
    fetchPost("/api/setting/setFiletree", mergeFiletreeFromControlId(root, controlId), (response) => {
        window.siyuan.config.fileTree = response.data;
    });
};
