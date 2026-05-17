/// #if !BROWSER
import * as path from "path";
/// #endif
import {Constants} from "../constants";
import {exportLayout, resetLayout} from "../layout/util";
import {readCookieValue} from "../util/cookie";
import {isBrowser, isMobile} from "../util/functions";
import {fetchPost} from "../util/fetch";
import {openSnippets} from "./util/snippets";
import {loadAssets} from "../util/assets";
import {resetFloatDockSize} from "../layout/dock/util";
import {confirmDialog} from "../dialog/confirmDialog";
import {useShell} from "../util/pathName";
import {setStatusBar} from "./util/setStatusBar";
import {updateHotkeyTip} from "../protyle/util/compatibility";
import {Menu} from "../plugin/Menu";
import {escapeAttr} from "../util/escape";
import {
    buttonRow,
    customRow,
    findSettingRowByControlId,
    rangeRow,
    numberRow,
    selectRow,
    stackRow,
    switchRow,
    type SettingBindApi,
    type SettingSection,
} from "./ui/settingRows";
import {filterSettingSections} from "./ui/search";
import {renderSettingTabHtmlFromSections, renderSwitchRow} from "./ui/render";
import {readDomValue} from "./ui/formValue";
import {mergeRecordByDottedPath} from "./ui/dotPath";
import {mountSettingSaveHandlers} from "./ui/save";
import {editor} from "./editor";

/** 外观「明亮 / 暗黑 / 跟随系统」合并控件，对应 DOM id，非配置树单一路径 */
const APPEARANCE_THEME_MODE_ID = "appearanceThemeMode";

export const appearance = {
    mount: async (root: HTMLElement, searchQuery?: string) => {
        const sections = filterSettingSections(buildAppearanceSections(), searchQuery);
        root.innerHTML = renderSettingTabHtmlFromSections(sections);
        await mountSettingSaveHandlers(root, sections);
    },

    set(root: HTMLElement, controlId: string, sections: SettingSection[]) {
        if (controlId === APPEARANCE_THEME_MODE_ID) {
            sendAppearanceModeFromSelect(root);
            return;
        }
        const el = root.querySelector<HTMLElement>(`[id="${CSS.escape(controlId)}"]`);
        if (!el) {
            return;
        }
        const row = findSettingRowByControlId(sections, controlId);
        const value = readDomValue(el, row);
        if (value !== undefined) {
            appearance.send(controlId, value);
        }
    },

    send(controlId: string, value: unknown) {
        if (!controlId.startsWith("appearance.")) {
            return;
        }
        const rel = controlId.slice("appearance.".length);
        if (!rel) {
            return;
        }
        const prev = window.siyuan.config.appearance as unknown as Record<string, unknown>;
        const payload = mergeRecordByDottedPath(prev, rel, value) as unknown as Config.IAppearance;
        fetchPost("/api/setting/setAppearance", payload, () => {
            resetFloatDockSize();
        });
    },

    apply(data: Config.IAppearance) {
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
    },
};

const sendAppearanceModeFromSelect = (root: HTMLElement) => {
    const modeEl = root.querySelector(`[id="${CSS.escape(APPEARANCE_THEME_MODE_ID)}"]`) as HTMLSelectElement | null;
    if (!modeEl) {
        return;
    }
    const modeElementValue = parseInt(modeEl.value, 10);
    const OSTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    fetchPost(
        "/api/setting/setAppearance",
        {
            ...window.siyuan.config.appearance,
            mode: modeElementValue === 2 ? (OSTheme === "light" ? 0 : 1) : modeElementValue,
            modeOS: modeElementValue === 2,
        },
        () => {
            resetFloatDockSize();
        }
    );
};

export function buildAppearanceSections(): SettingSection[] {
    const browser = isBrowser();
    const mobile = isMobile();
    return [
        {
            title: window.siyuan.languages.configGroupContent,
            items: [
                customRow({
                    keywords: [window.siyuan.languages.font, window.siyuan.languages.font1],
                    html: () =>
                        `<div class="fn__flex b3-label config__item">
    <div class="fn__flex-1">
        ${window.siyuan.languages.font}
        <div class="b3-label__text">${window.siyuan.languages.font1}</div>
    </div>
    <span class="fn__space"></span>
    <input
        class="b3-select fn__flex-center fn__size200"
        id="editor.fontFamily"
        data-family="${escapeAttr(window.siyuan.config.editor.fontFamily)}"
        data-weight="${window.siyuan.config.editor.fontWeight}"
        data-display="${escapeAttr(window.siyuan.config.editor.fontFamilyDisplay)}"
        value="${escapeAttr(window.siyuan.config.editor.fontFamilyDisplay || window.siyuan.config.editor.fontFamily || window.siyuan.languages.default)}"
        readonly
        style="font-family: ${ window.siyuan.config.editor.fontFamily ? window.siyuan.config.editor.fontFamily + ", " : ""}var(--b3-font-family);
        ${ window.siyuan.config.editor.fontWeight ? `font-weight: ${window.siyuan.config.editor.fontWeight};` : ""}"
    >
</div>`,
                    bind: (api: SettingBindApi) => {
                        const fontFamilyEl = api.root.querySelector<HTMLInputElement>(`#${CSS.escape("editor.fontFamily")}`);
                        fontFamilyEl?.addEventListener("click", () => {
                            fetchPost("/api/system/getSysFonts", {}, (response) => {
                                const curFamily = fontFamilyEl.dataset.family || "";
                                const curWeight = parseInt(fontFamilyEl.dataset.weight || "0", 10);
                                const fontMenu = new Menu();
                                fontMenu.addItem({
                                    iconHTML: "",
                                    checked: curFamily === "",
                                    label: `<div style='var(--b3-font-family);'>${window.siyuan.languages.default}</div>`,
                                    click: () => {
                                        const family = fontFamilyEl.dataset.family || "";
                                        const weight = parseInt(fontFamilyEl.dataset.weight || "0", 10);
                                        if (family === "" && weight === 0) {
                                            return;
                                        }
                                        fontFamilyEl.value = window.siyuan.languages.default;
                                        fontFamilyEl.dataset.family = "";
                                        fontFamilyEl.dataset.weight = "0";
                                        fontFamilyEl.dataset.display = "";
                                        fontFamilyEl.style.fontFamily = "";
                                        fontFamilyEl.style.fontWeight = "";
                                        persistEditorFont();
                                    },
                                });
                                response.data.forEach((item: {family: string; weight: number; displayName: string}) => {
                                    fontMenu.addItem({
                                        iconHTML: "",
                                        checked: item.family === curFamily && item.weight === curWeight,
                                        label: `<div style='font-family:"${item.family}", var(--b3-font-family);'>${item.displayName}</div>`,
                                        click: () => {
                                            const family = fontFamilyEl.dataset.family || "";
                                            const weight = parseInt(fontFamilyEl.dataset.weight || "0", 10);
                                            if (family === item.family && weight === item.weight) {
                                                return;
                                            }
                                            fontFamilyEl.value = item.displayName;
                                            fontFamilyEl.dataset.family = item.family;
                                            fontFamilyEl.dataset.weight = String(item.weight);
                                            fontFamilyEl.dataset.display = item.displayName;
                                            fontFamilyEl.style.fontFamily = item.family + ", var(--b3-font-family);";
                                            fontFamilyEl.style.fontWeight = item.weight ? String(item.weight) : "";
                                            persistEditorFont();
                                        },
                                    });
                                });
                                const rect = fontFamilyEl.getBoundingClientRect();
                                fontMenu.open({x: rect.left, y: rect.bottom});
                            });
                        });

                        function persistEditorFont() {
                            fetchPost(
                                "/api/setting/setEditor",
                                {
                                    ...window.siyuan.config.editor,
                                    fontFamily: fontFamilyEl.dataset.family || "",
                                    fontWeight: parseInt(fontFamilyEl.dataset.weight || "0", 10),
                                    fontFamilyDisplay: fontFamilyEl.dataset.display || "",
                                },
                                (response) => {
                                    const data = response.data as Config.IEditor;
                                    editor.apply(data);
                                    fontFamilyEl.value = data.fontFamilyDisplay || data.fontFamily || window.siyuan.languages.default;
                                    fontFamilyEl.dataset.family = data.fontFamily;
                                    fontFamilyEl.dataset.weight = String(data.fontWeight);
                                    fontFamilyEl.dataset.display = data.fontFamilyDisplay;
                                    fontFamilyEl.style.fontFamily = `${data.fontFamily ? data.fontFamily + ", " : ""}var(--b3-font-family);`;
                                    fontFamilyEl.style.fontWeight = data.fontWeight ? String(data.fontWeight) : "";
                                }
                            );
                        }
                    },
                }),
                rangeRow({
                    id: "editor.fontSize",
                    title: window.siyuan.languages.editorFontSize,
                    desc: window.siyuan.languages.fontSizeTip,
                    min: 12,
                    max: 48,
                    step: 1,
                    bind: (api: SettingBindApi) => {
                        api.root.querySelector(`#${CSS.escape("editor.fontSize")}`)?.addEventListener("input", (event: InputEvent) => {
                            const target = event.target as HTMLInputElement;
                            target.parentElement.setAttribute("aria-label", target.value);
                        });
                    },
                }),
                switchRow({
                    id: "editor.fontSizeScrollZoom",
                    title: window.siyuan.languages.fontSizeScrollZoom,
                    desc: window.siyuan.languages.fontSizeScrollZoomTip,
                }),
                switchRow({
                    id: "editor.fullWidth",
                    title: window.siyuan.languages.fullWidth,
                    desc: window.siyuan.languages.fullWidthTip,
                }),
                switchRow({
                    id: "editor.justify",
                    title: window.siyuan.languages.justify,
                    desc: window.siyuan.languages.justifyTip,
                }),
                switchRow({
                    id: "editor.rtl",
                    title: window.siyuan.languages.rtl,
                    desc: window.siyuan.languages.rtlTip,
                }),
            ],
        },
        {
            title: window.siyuan.languages.configGroupInterface,
            items: [
                selectRow({
                    id: "appearance.lang",
                    title: window.siyuan.languages.language,
                    desc: window.siyuan.languages.language1,
                    options: window.siyuan.config.langs.map((lang) => ({
                        value: lang.name,
                        label: `${lang.label} (${lang.name})`,
                    })),
                    value: window.siyuan.config.appearance.lang,
                }),
                selectRow({
                    id: APPEARANCE_THEME_MODE_ID,
                    title: window.siyuan.languages.appearance4,
                    desc: window.siyuan.languages.appearance5,
                    options: [
                        {value: 0, label: window.siyuan.languages.themeLight},
                        {value: 1, label: window.siyuan.languages.themeDark},
                        {value: 2, label: window.siyuan.languages.themeOS},
                    ],
                    value: window.siyuan.config.appearance.modeOS ? 2 : window.siyuan.config.appearance.mode,
                }),
                stackRow({
                    lines: [
                        {
                            left: {kind: "title", text: window.siyuan.languages.theme},
                            ...(browser ? {} : {
                                right: {
                                    kind: "button",
                                    id: "appearanceOpenTheme",
                                    label: window.siyuan.languages.appearance9,
                                    icon: "iconFolder",
                                    bind: (api: SettingBindApi) => {
                                        api.root.querySelector("#appearanceOpenTheme")?.addEventListener("click", () => {
                                            useShell("openPath", path.join(window.siyuan.config.system.confDir, "appearance", "themes"));
                                        });
                                    },
                                },
                            }),
                        },
                        {
                            left: {kind: "desc", text: window.siyuan.languages.theme11},
                            right: {
                                kind: "select",
                                id: "appearance.themeLight",
                                options: window.siyuan.config.appearance.lightThemes.map((item) => ({
                                    value: item,
                                    label: item,
                                })),
                                value: window.siyuan.config.appearance.themeLight,
                            },
                        },
                        {
                            left: {kind: "desc", text: window.siyuan.languages.theme12},
                            right: {
                                kind: "select",
                                id: "appearance.themeDark",
                                options: window.siyuan.config.appearance.darkThemes.map((item) => ({
                                    value: item,
                                    label: item,
                                })),
                                value: window.siyuan.config.appearance.themeDark,
                            },
                        },
                    ],
                }),
                stackRow({
                    lines: [
                        {
                            left: {kind: "title", text: window.siyuan.languages.icon},
                            ...(browser ? {} : {
                                right: {
                                    kind: "button",
                                    id: "appearanceOpenIcon",
                                    label: window.siyuan.languages.appearance8,
                                    icon: "iconFolder",
                                    bind: (api: SettingBindApi) => {
                                        api.root.querySelector("#appearanceOpenIcon")?.addEventListener("click", () => {
                                            useShell("openPath", path.join(window.siyuan.config.system.confDir, "appearance", "icons"));
                                        });
                                    },
                                },
                            }),
                        },
                        {
                            left: {kind: "desc", text: window.siyuan.languages.theme2},
                            right: {
                                kind: "select",
                                id: "appearance.icon",
                                options: window.siyuan.config.appearance.icons.map((item) => ({
                                    value: item.name,
                                    label: item.label,
                                })),
                                value: window.siyuan.config.appearance.icon,
                            },
                        },
                    ],
                }),
                stackRow({
                    lines: [
                        {
                            left: {kind: "title", text: window.siyuan.languages.appearance1},
                        },
                        {
                            left: {kind: "desc", text: window.siyuan.languages.appearance2},
                            right: {
                                kind: "select",
                                id: "appearance.codeBlockThemeLight",
                                options: Constants.SIYUAN_CONFIG_APPEARANCE_LIGHT_CODE.map((item) => ({
                                    value: item,
                                    label: item,
                                })),
                                value: window.siyuan.config.appearance.codeBlockThemeLight,
                            },
                        },
                        {
                            left: {kind: "desc", text: window.siyuan.languages.appearance3},
                            right: {
                                kind: "select",
                                id: "appearance.codeBlockThemeDark",
                                options: Constants.SIYUAN_CONFIG_APPEARANCE_DARK_CODE.map((item) => ({
                                    value: item,
                                    label: item,
                                })),
                                value: window.siyuan.config.appearance.codeBlockThemeDark,
                            },
                        },
                    ],
                }),
            ],
        },
        {
            title: window.siyuan.languages.configGroupControls,
            items: [
                selectRow({
                    id: "editor.floatWindowMode",
                    title: window.siyuan.languages.floatWindowMode,
                    desc: window.siyuan.languages.floatWindowModeTip,
                    options: [
                        {value: 0, label: window.siyuan.languages.floatWindowMode0},
                        {value: 1, label: window.siyuan.languages.floatWindowMode1.replace("${hotkey}", updateHotkeyTip("⌘"))},
                        {value: 2, label: window.siyuan.languages.floatWindowMode2},
                    ],
                    value: window.siyuan.config.editor.floatWindowMode,
                    bind: (api: SettingBindApi) => {
                        const fwModeEl = api.root.querySelector<HTMLSelectElement>(`#${CSS.escape("editor.floatWindowMode")}`);
                        const delayRow = api.root.querySelector(`#${CSS.escape("editor.floatWindowDelay")}`)?.closest(".b3-label");
                        if (!fwModeEl || !delayRow) {
                            return;
                        }
                        const handleFloatWindowModeChange = () => {
                            const mode = parseInt(fwModeEl.value, 10);
                            delayRow.classList.toggle("fn__none", mode !== 0);
                        };
                        fwModeEl.addEventListener("change", handleFloatWindowModeChange);
                        handleFloatWindowModeChange();
                    },
                }),
                numberRow({
                    id: "editor.floatWindowDelay",
                    title: window.siyuan.languages.floatWindowDelay,
                    desc: window.siyuan.languages.floatWindowDelayTip,
                    min: 0,
                    max: 2000,
                    unit: "ms",
                }),
                selectRow({
                    id: "appearance.closeButtonBehavior",
                    title: window.siyuan.languages.appearance10,
                    desc: window.siyuan.languages.appearance12,
                    options: [
                        {value: 0, label: window.siyuan.languages._trayMenu.quit},
                        {value: 1, label: window.siyuan.languages.appearance11},
                    ],
                    value: window.siyuan.config.appearance.closeButtonBehavior === 1 ? 1 : 0,
                }),
                stackRow({
                    lines: [
                        {
                            left: {kind: "title", text: window.siyuan.languages.appearance16},
                        },
                        {
                            left: {kind: "desc", text: window.siyuan.languages.appearance17},
                            right: {kind: "switch", id: "appearance.hideStatusBar"},
                        },
                        {
                            left: {kind: "desc", text: window.siyuan.languages.appearance18},
                            right: {
                                kind: "button",
                                id: "statusBarSetting",
                                label: window.siyuan.languages.config,
                                icon: "iconSettings",
                                bind: (api: SettingBindApi) => {
                                    const statusBtn = api.root.querySelector("#statusBarSetting") as HTMLElement | null;
                                    setStatusBar(statusBtn);
                                },
                            },
                        },
                    ],
                }),
                buttonRow({
                    id: "resetLayout",
                    title: window.siyuan.languages.resetLayout,
                    desc: window.siyuan.languages.appearance6,
                    label: window.siyuan.languages.reset,
                    icon: "iconUndo",
                    bind: (api: SettingBindApi) => {
                        api.root.querySelector("#resetLayout")?.addEventListener("click", () => {
                            confirmDialog(
                                "⚠️ " + window.siyuan.languages.reset,
                                window.siyuan.languages.appearance6,
                                resetLayout
                            );
                        });
                    },
                }),
            ],
        },
        {
            title: window.siyuan.languages.configGroupPersonalization,
            items: [
                ...(browser ? [] : [
                    buttonRow({
                        id: "appearanceOpenEmoji",
                        title: window.siyuan.languages.customEmoji,
                        desc: window.siyuan.languages.customEmojiTip,
                        label: window.siyuan.languages.showInFolder,
                        icon: "iconFolder",
                        bind: (api: SettingBindApi) => {
                            api.root.querySelector("#appearanceOpenEmoji")?.addEventListener("click", () => {
                                useShell("openPath", path.join(window.siyuan.config.system.dataDir, "emojis"));
                            });
                        },
                    }),
                ]),
                stackRow({
                    lines: [
                        {
                            left: {kind: "title", text: window.siyuan.languages.codeSnippet},
                            ...("zh_CN" !== window.siyuan.config.lang ? {} : {
                                right: {
                                    kind: "button",
                                    id: "codeSnippetCommunityShare",
                                    label: window.siyuan.languages.visitCommunityShare,
                                    icon: "iconUpload",
                                    bind: (api: SettingBindApi) => {
                                        api.root.querySelector("#codeSnippetCommunityShare")?.addEventListener("click", () => {
                                            window.open("https://ld246.com/tag/code-snippet", "_blank");
                                        });
                                    },
                                },
                            }),
                        },
                        {
                            left: {kind: "desc", text: window.siyuan.languages.codeSnippetTip},
                            right: {
                                kind: "button",
                                id: "codeSnippet",
                                label: window.siyuan.languages.config,
                                icon: "iconSettings",
                                bind: (api: SettingBindApi) => {
                                    api.root.querySelector("#codeSnippet")?.addEventListener("click", () => {
                                        openSnippets();
                                    });
                                },
                            },
                        },
                    ],
                }),
                customRow({
                    keywords: [window.siyuan.languages.desktopMode, window.siyuan.languages.mobileModeTip],
                    html: () => {
                        const raw = readCookieValue("siyuan-desktop-mode");
                        return renderSwitchRow(
                            "desktopMode",
                            window.siyuan.languages.desktopMode,
                            window.siyuan.languages.mobileModeTip,
                            raw === "true" || (raw !== "false" && !mobile)
                        );
                    },
                    bind: (api: SettingBindApi) => {
                        api.root.querySelector("#desktopMode")?.addEventListener("change", (event: Event) => {
                            const checked = (event.target as HTMLInputElement).checked;
                            document.cookie = "siyuan-desktop-mode=" + (checked ? "true" : "false") + ";path=/;max-age=31536000";
                            window.location.href = "/";
                        });
                    },
                }),
            ],
        },
    ];
}
