import {fetchPost} from "../../util/fetch";
import {mergeRecordByDottedPath} from "../ui/dotPath";

/** 将内核返回的导出配置写回当前实例 */
export const applyExportConfig = (data: Config.IExport) => {
    window.siyuan.config.export = data;
    const pathDisplay = document.getElementById("pandocBinPathDisplay");
    if (pathDisplay) {
        pathDisplay.textContent = data.pandocBin;
    }
};

const postExportConfig = (payload: Config.IExport) => {
    fetchPost("/api/setting/setExport", payload, (response) => {
        // 当前修改导出设置之后内核不推送到所有前端实例，需要手动 apply
        applyExportConfig(response.data);
    });
};

const mergeAndPost = (rel: string, value: unknown) => {
    if (!rel) {
        return;
    }
    const prev = window.siyuan.config.export as unknown as Record<string, unknown>;
    const payload = mergeRecordByDottedPath(prev, rel, value) as unknown as Config.IExport;
    postExportConfig(payload);
};

/** 导出 Tab 命名空间：设置面板注册项 save、stack 内按钮 bind */
export const exportConfigApi = {
    patch(relOrFullId: string, value: unknown) {
        const rel = relOrFullId.startsWith("export.")
            ? relOrFullId.slice("export.".length)
            : relOrFullId;
        mergeAndPost(rel, value);
    },

    apply: applyExportConfig,
};
