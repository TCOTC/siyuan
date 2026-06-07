import {exportLayout} from "../../layout/util";
import {fetchPost} from "../../util/fetch";
import {loadAssets} from "../../util/assets";
import {mergeRecordByDottedPath} from "../ui/dotPath";

/** mode 和 modeOS 两项配置的合并控件 ID */
export const APPEARANCE_THEME_MODE_ID = "appearance.ThemeMode";

/** 将内核返回的外观配置应用到当前前端实例 */
export const applyAppearanceConfig = (data: Config.IAppearance) => {
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
        `#icon${window.siyuan.config.appearance.modeOS ? "Mode" : window.siyuan.config.appearance.mode === 0 ? "Light" : "Dark"}`
    );
};

const postAppearanceConfig = (payload: Config.IAppearance) => {
    // 当前修改外观设置之后内核会推送到所有前端实例，无需手动 apply
    fetchPost("/api/setting/setAppearance", payload);
};

const mergeAndPost = (rel: string, value: unknown) => {
    if (!rel) {
        return;
    }
    const prev = window.siyuan.config.appearance as unknown as Record<string, unknown>;
    const payload = mergeRecordByDottedPath(prev, rel, value) as unknown as Config.IAppearance;
    postAppearanceConfig(payload);
};

/** 外观 Tab 命名空间：设置面板注册项 save */
export const appearanceConfigApi = {
    patch(relOrFullId: string, value: unknown) {
        const rel = relOrFullId.startsWith("appearance.")
            ? relOrFullId.slice("appearance.".length)
            : relOrFullId;
        mergeAndPost(rel, value);
    },

    /** 主题模式选择：合并 mode / modeOS 后提交 */
    saveThemeMode(value: number) {
        const OSThemeMode = window.matchMedia("(prefers-color-scheme: dark)").matches ? 1 : 0;
        postAppearanceConfig({
            ...window.siyuan.config.appearance,
            mode: value === 2 ? OSThemeMode : value,
            modeOS: value === 2,
        });
    },

    apply: applyAppearanceConfig,
};
