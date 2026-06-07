import {fetchPost} from "../../util/fetch";
import {mergeRecordByDottedPath} from "../ui/dotPath";

/** 将内核返回的文档树配置写回当前实例 */
export const applyFileConfig = (data: Config.IFileTree) => {
    window.siyuan.config.fileTree = data;
};

const postFileConfig = (payload: Config.IFileTree) => {
    fetchPost("/api/setting/setFiletree", payload, (response) => {
        // 当前修改文档设置之后内核不推送到所有前端实例，需要手动 apply
        applyFileConfig(response.data);
    });
};

const mergeAndPost = (rel: string, value: unknown) => {
    if (!rel) {
        return;
    }
    const prev = window.siyuan.config.fileTree as unknown as Record<string, unknown>;
    const payload = mergeRecordByDottedPath(prev, rel, value) as unknown as Config.IFileTree;
    postFileConfig(payload);
};

/** 文档 Tab 命名空间：设置面板注册项 save */
export const fileConfigApi = {
    patch(relOrFullId: string, value: unknown) {
        const rel = relOrFullId.startsWith("fileTree.")
            ? relOrFullId.slice("fileTree.".length)
            : relOrFullId;
        mergeAndPost(rel, value);
    },

    apply: applyFileConfig,
};
