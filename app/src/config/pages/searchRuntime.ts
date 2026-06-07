import {fetchPost} from "../../util/fetch";
import {mergeRecordByDottedPath} from "../ui/dotPath";

/** 将内核返回的搜索配置写回当前实例 */
export const applySearchConfig = (data: Config.ISearch) => {
    window.siyuan.config.search = data;
};

const postSearchConfig = (payload: Config.ISearch) => {
    fetchPost("/api/setting/setSearch", payload, (response) => {
        // 当前修改搜索设置之后内核不推送到所有前端实例，需要手动 apply
        applySearchConfig(response.data);
    });
};

const mergeAndPost = (rel: string, value: unknown) => {
    if (!rel) {
        return;
    }
    const prev = window.siyuan.config.search as unknown as Record<string, unknown>;
    const payload = mergeRecordByDottedPath(prev, rel, value) as unknown as Config.ISearch;
    postSearchConfig(payload);
};

/** 搜索 Tab 命名空间：设置面板注册项 save */
export const searchConfigApi = {
    patch(relOrFullId: string, value: unknown) {
        const rel = relOrFullId.startsWith("search.")
            ? relOrFullId.slice("search.".length)
            : relOrFullId;
        mergeAndPost(rel, value);
    },

    apply: applySearchConfig,
};
