import {exportLayout} from "../../layout/util";
import {fetchPost} from "../../util/fetch";
import {loadAssets} from "../../util/assets";
import {createConfigNamespaceApi} from "../util/namespaceApi";

/** 主题模式下拉框初值：合并 mode / modeOS */
export const appearanceThemeModeValue = (): number =>
    window.siyuan.config.appearance.modeOS ? 2 : window.siyuan.config.appearance.mode;

/** 主题模式选择：合并 mode / modeOS 后提交 */
export const saveThemeMode = (value: number) => {
    const OSThemeMode = window.matchMedia("(prefers-color-scheme: dark)").matches ? 1 : 0;
    fetchPost("/api/setting/setAppearance", {
        ...window.siyuan.config.appearance,
        mode: (value === 2 ? OSThemeMode : value) as Config.IAppearance["mode"],
        modeOS: value === 2,
    });
};

const applyAppearanceConfig = (data: Config.IAppearance) => {
    if (data.lang !== window.siyuan.config.appearance.lang) {
        void exportLayout({
            cb() {
                window.location.reload();
            },
            errorExit: false,
        });
        return;
    }

    window.siyuan.config.appearance = data;
    loadAssets(data);
    document.querySelector("#barMode use")?.setAttribute(
        "xlink:href",
        `${window.siyuan.config.appearance.modeOS ? "#iconMode" : window.siyuan.config.appearance.mode === 0 ? "#iconLight" : "#iconDark"}`
    );
};

/** 外观 Tab 命名空间：设置面板注册项 save */
export const appearanceConfigApi = createConfigNamespaceApi<Config.IAppearance>({
    namespace: "appearance",
    getConfig: () => window.siyuan.config.appearance,
    setConfig: applyAppearanceConfig,
    apiPath: "/api/setting/setAppearance",
    applyFromResponse: false,
});
