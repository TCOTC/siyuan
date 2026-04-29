import type {App} from "../../index";
import type {TConfigTab} from "../../config/types";
import {mountConfigTab} from "../../config/mountConfigTab";
import {getConfigTabIcon, getConfigTabTitle, isConfigTabMenuHidden} from "../../config/tabs";
import {isMobile} from "../../util/functions";
import {openModel} from "./model";

/** 在移动端底栏模型中打开与桌面一致的设置标签页 */
export const openMobileConfigTab = (type: TConfigTab, app: App) => {
    if (isConfigTabMenuHidden(type)) {
        return;
    }
    const mobileRootClass = isMobile() ? " config--mobile" : "";
    openModel({
        title: getConfigTabTitle(type),
        icon: getConfigTabIcon(type),
        html: `<div class="config${mobileRootClass}"></div>`,
        bindEvent(modelMainElement: HTMLElement) {
            const root = modelMainElement.firstElementChild as HTMLElement;
            mountConfigTab(type, root, app);
        }
    });
};
