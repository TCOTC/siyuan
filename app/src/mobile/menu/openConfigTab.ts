import type {App} from "../../index";
import {getConfigPage} from "../../config/registry/pages";
import {bindSettingSaveDelegation} from "../../config/ui/save";
import type {IConfigTabShell, TConfigTab} from "../../config/registry/pages";
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
            const page = getConfigPage(def.id);
            if (page) {
                void page.mount(root, undefined, app);
            }
        }
    });
};
