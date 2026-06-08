import type {App} from "../../index";
import {getConfigTab, type IConfigTabShell, type TConfigTab} from "../../config/registry/tabs";
import {bindSettingSaveDelegation} from "../../config/ui/save";
import {isMobile} from "../../util/functions";
import {openModel} from "./model";

/** 在移动端底栏模型中打开与桌面一致的设置标签页 */
export const openMobileConfigTab = (def: IConfigTabShell<TConfigTab>, app: App) => {
    if (def.hidden) {
        return;
    }
    openModel({
        title: def.title,
        icon: def.icon,
        html: `<div class="config${isMobile() ? " config--mobile" : ""}"></div>`,
        bindEvent(modelMainElement: HTMLElement) {
            const root = modelMainElement.firstElementChild as HTMLElement;
            bindSettingSaveDelegation(root);
            const tab = getConfigTab(def.id);
            if (tab) {
                void tab.mount(root, undefined, app);
            }
        }
    });
};
