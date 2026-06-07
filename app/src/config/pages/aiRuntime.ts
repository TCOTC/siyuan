import {fetchPost} from "../../util/fetch";
import {mergeRecordByDottedPath} from "../ui/dotPath";

/** 将内核返回的 AI 配置写回当前实例 */
export const applyAiConfig = (data: Config.IAI) => {
    window.siyuan.config.ai = data;
};

const postAiConfig = (payload: Config.IAI) => {
    fetchPost("/api/setting/setAI", payload, (response) => {
        // 当前修改 AI 设置之后内核不推送到所有前端实例，需要手动 apply
        applyAiConfig(response.data);
    });
};

const mergeAndPost = (rel: string, value: unknown) => {
    if (!rel) {
        return;
    }
    const prev = window.siyuan.config.ai as unknown as Record<string, unknown>;
    const payload = mergeRecordByDottedPath(prev, rel, value) as unknown as Config.IAI;
    postAiConfig(payload);
};

/** AI Tab 命名空间：设置面板注册项 save */
export const aiConfigApi = {
    patch(relOrFullId: string, value: unknown) {
        const rel = relOrFullId.startsWith("ai.")
            ? relOrFullId.slice("ai.".length)
            : relOrFullId;
        mergeAndPost(rel, value);
    },

    apply: applyAiConfig,
};
