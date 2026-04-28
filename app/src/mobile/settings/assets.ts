import {openModel} from "../menu/model";
import {assets} from "../../config/assets";
import {App} from "../../index";

export const initConfigAssets = (app: App) => {
    openModel({
        title: window.siyuan.languages.assets,
        icon: "iconImage",
        html: assets.genHTML(),
        bindEvent(modelMainElement: HTMLElement) {
            assets.element = modelMainElement.firstElementChild;
            assets.bindEvent(app);
        }
    });
};
