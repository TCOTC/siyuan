import {buildFileSections} from "./fileEntries";
import {filterSettingSections} from "../common/settingPanelSearch";
import {renderSettingTabHtmlFromSections} from "../common/renderSettingHtml";
import {mountScheduleSettingSave} from "../common/scheduleSettingSave";
import {readDomValueFromEl} from "../readDomControlValue";
import {mergeRecordByDottedPath} from "../../registry/mergeRecordByDottedPath";
import {fetchPost} from "../../../util/fetch";

export const file = {
    /**
     * 挂载文档设置
     * @param root 容器
     * @param searchQuery 搜索关键词
     */
    mount: async (root: HTMLElement, searchQuery?: string) => {
        const sections = filterSettingSections(buildFileSections(), searchQuery);
        root.innerHTML = renderSettingTabHtmlFromSections(sections);
        await mountScheduleSettingSave(root, sections);
    },

    /** 从 DOM 合并本次控件 → `setFiletree` → 用响应写回 `window.siyuan.config.fileTree` */
    send(root: HTMLElement, controlId: string) {
        const prev = window.siyuan.config.fileTree;
        let payload: Config.IFileTree = prev;
        if (controlId.startsWith("fileTree.")) {
            const rel = controlId.slice("fileTree.".length);
            const el = root.querySelector<HTMLElement>(`[id="${CSS.escape(controlId)}"]`);
            let value: unknown = undefined;
            if (el) {
                if (el instanceof HTMLSelectElement && /SaveBox$/.test(rel)) {
                    value = el.value;
                } else {
                    value = readDomValueFromEl(el);
                }
            }
            if (value !== undefined) {
                payload = mergeRecordByDottedPath(
                    {...prev} as unknown as Record<string, unknown>,
                    rel,
                    value
                ) as unknown as Config.IFileTree;
            }
        }
        fetchPost("/api/setting/setFiletree", payload, (response) => {
            file.apply(response.data);
        });
    },

    /** 将服务端返回的 `IFileTree` 写回全局配置 */
    apply(fileTreeData: Config.IFileTree) {
        window.siyuan.config.fileTree = fileTreeData;
    },
};
