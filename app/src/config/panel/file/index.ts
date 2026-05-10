import {buildFileSections} from "./fileEntries";
import {filterSettingSections} from "../common/settingPanelSearch";
import {renderSettingTabHtmlFromSections} from "../common/renderSettingHtml";
import {scheduleSettingSave} from "../../registry/scheduleSettingSave";
import {sendFiletreeSettingFromControl} from "./sendFiletreeSetting";
import {SettingBindApi} from "../common/settingBindApi";

export const file = {
    /**
     * 挂载文档设置
     * @param root 容器
     * @param searchQuery 搜索关键词
     */
    mount: async (root: HTMLElement, searchQuery?: string) => {
        const sections = filterSettingSections(buildFileSections(), searchQuery);
        root.innerHTML = renderSettingTabHtmlFromSections(sections);

        const scheduleSave = (controlId: string) => scheduleSettingSave(root, controlId);

        for (const section of sections) {
            for (const row of section.items) {
                if (row.type === "custom" && row.bind) {
                    await row.bind({root, scheduleSave} satisfies SettingBindApi);
                }
            }
        }

        root.querySelectorAll("input, select").forEach((item) => {
            item.addEventListener("change", () => {
                console.log("change", item.id);
                scheduleSave(item.id);
            });
        });
    },
    send: sendFiletreeSettingFromControl,
};
