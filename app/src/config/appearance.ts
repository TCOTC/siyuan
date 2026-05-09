/// #if !BROWSER
import * as path from "path";
/// #endif
import {Constants} from "../constants";
import {exportLayout, resetLayout} from "../layout/util";
import {readCookieValue} from "../util/cookie";
import {isBrowser, isMobile} from "../util/functions";
import {fetchPost} from "../util/fetch";
import {genLangOptions, genOptions} from "../util/genOptions";
import {openSnippets} from "./util/snippets";
import {loadAssets} from "../util/assets";
import {resetFloatDockSize} from "../layout/dock/util";
import {confirmDialog} from "../dialog/confirmDialog";
import {useShell} from "../util/pathName";
import {setStatusBar} from "./util/setStatusBar";
import {updateHotkeyTip} from "../protyle/util/compatibility";
import {Menu} from "../plugin/Menu";
import {escapeAttr} from "../util/escape";
import {editor} from "./editor";

export const appearance = {
    element: undefined as Element,
    genHTML: () => {
        return `<b class="config-group__title">${window.siyuan.languages.configGroupContent}</b>
<div class="config-group">
    <div class="fn__flex b3-label config__item">
        <div class="fn__flex-1">
            ${window.siyuan.languages.font}
            <div class="b3-label__text">${window.siyuan.languages.font1}</div>
        </div>
        <span class="fn__space"></span>
        <input class="b3-text-field fn__flex-center fn__size200" id="fontFamily" data-family="${escapeAttr(window.siyuan.config.editor.fontFamily || "")}" data-weight="${window.siyuan.config.editor.fontWeight ?? 0}" data-display="${escapeAttr(window.siyuan.config.editor.fontFamilyDisplay || "")}" value="${escapeAttr(window.siyuan.config.editor.fontFamilyDisplay || window.siyuan.config.editor.fontFamily || "")}" placeholder="${window.siyuan.languages.default}" readonly${window.siyuan.config.editor.fontFamily ? ` style="font-family:${window.siyuan.config.editor.fontFamily},var(--b3-font-family)"` : ""}>
    </div>
    <div class="fn__flex b3-label config__item">
        <div class="fn__flex-1">
            ${window.siyuan.languages.editorFontSize}
            <div class="b3-label__text">${window.siyuan.languages.fontSizeTip}</div>
        </div>
        <span class="fn__space"></span>
        <div class="b3-tooltips b3-tooltips__n fn__size200 fn__flex-center" aria-label="${window.siyuan.config.editor.fontSize}">
            <input class="b3-slider fn__size200" id="fontSize" max="48" min="12" step="1" type="range" value="${window.siyuan.config.editor.fontSize}">
        </div>
    </div>
    <label class="fn__flex b3-label">
        <div class="fn__flex-1">
            ${window.siyuan.languages.fontSizeScrollZoom}
            <div class="b3-label__text">${window.siyuan.languages.fontSizeScrollZoomTip}</div>
        </div>
        <span class="fn__space"></span>
        <input class="b3-switch fn__flex-center" id="fontSizeScrollZoom" type="checkbox"${window.siyuan.config.editor.fontSizeScrollZoom ? " checked" : ""}>
    </label>
    <label class="fn__flex b3-label">
        <div class="fn__flex-1">
            ${window.siyuan.languages.fullWidth}
            <div class="b3-label__text">${window.siyuan.languages.fullWidthTip}</div>
        </div>
        <span class="fn__space"></span>
        <input class="b3-switch fn__flex-center" id="fullWidth" type="checkbox"${window.siyuan.config.editor.fullWidth ? " checked" : ""}>
    </label>
    <label class="fn__flex b3-label">
        <div class="fn__flex-1">
            ${window.siyuan.languages.justify}
            <div class="b3-label__text">${window.siyuan.languages.justifyTip}</div>
        </div>
        <span class="fn__space"></span>
        <input class="b3-switch fn__flex-center" id="justify" type="checkbox"${window.siyuan.config.editor.justify ? " checked" : ""}>
    </label>
    <label class="fn__flex b3-label">
        <div class="fn__flex-1">
            ${window.siyuan.languages.rtl}
            <div class="b3-label__text">${window.siyuan.languages.rtlTip}</div>
        </div>
        <span class="fn__space"></span>
        <input class="b3-switch fn__flex-center" id="rtl" type="checkbox"${window.siyuan.config.editor.rtl ? " checked" : ""}>
    </label>
</div>
<b class="config-group__title">${window.siyuan.languages.configGroupInterface}</b>
<div class="config-group">
    <div class="fn__flex b3-label config__item">
        <div class="fn__flex-1">
            ${window.siyuan.languages.language}
            <div class="b3-label__text">${window.siyuan.languages.language1}</div>
        </div>
        <span class="fn__space"></span>
        <select id="lang" class="b3-select fn__flex-center fn__size200">${genLangOptions(window.siyuan.config.langs, window.siyuan.config.appearance.lang)}</select>
    </div>
    <div class="fn__flex b3-label config__item">
        <div class="fn__flex-1">
            ${window.siyuan.languages.appearance4}
            <div class="b3-label__text">${window.siyuan.languages.appearance5}</div>
        </div>
        <span class="fn__space"></span>
        <select class="b3-select fn__flex-center fn__size200" id="mode">
          <option value="0" ${(window.siyuan.config.appearance.mode === 0 && !window.siyuan.config.appearance.modeOS) ? "selected" : ""}>${window.siyuan.languages.themeLight}</option>
          <option value="1" ${(window.siyuan.config.appearance.mode === 1 && !window.siyuan.config.appearance.modeOS) ? "selected" : ""}>${window.siyuan.languages.themeDark}</option>
          <option value="2" ${window.siyuan.config.appearance.modeOS ? "selected" : ""}>${window.siyuan.languages.themeOS}</option>
        </select>
    </div>
    <div class="b3-label">
        <div class="fn__flex">
            <div class="fn__flex-center fn__flex-1">${window.siyuan.languages.theme}</div>
            <span class="fn__space"></span>
            <button class="b3-button b3-button--outline fn__flex-center fn__size200${isBrowser() ? " fn__none" : ""}" id="appearanceOpenTheme">
                <svg><use xlink:href="#iconFolder"></use></svg>
                ${window.siyuan.languages.appearance9}
            </button>
        </div>
        <div class="fn__hr"></div>
        <div class="fn__flex config__item">
            <div class="fn__flex-center fn__flex-1 ft__on-surface">
                ${window.siyuan.languages.theme11}
            </div>
            <span class="fn__space"></span>
            <select class="b3-select fn__flex-center fn__size200" id="themeLight">
              ${genOptions(window.siyuan.config.appearance.lightThemes, window.siyuan.config.appearance.themeLight)}
            </select>
        </div>
        <div class="fn__hr"></div>
        <div class="fn__flex config__item">
            <div class="fn__flex-center fn__flex-1 ft__on-surface">
                ${window.siyuan.languages.theme12}
            </div>
            <span class="fn__space"></span>
            <select class="b3-select fn__flex-center fn__size200" id="themeDark">
               ${genOptions(window.siyuan.config.appearance.darkThemes, window.siyuan.config.appearance.themeDark)}
            </select>
        </div>
    </div>
    <div class="b3-label">
        <div class="fn__flex config__item">
            <div class="fn__flex-center fn__flex-1">
                ${window.siyuan.languages.icon}
            </div>
            <span class="fn__space"></span>
            <button class="b3-button b3-button--outline fn__flex-center fn__size200${isBrowser() ? " fn__none" : ""}" id="appearanceOpenIcon">
                <svg><use xlink:href="#iconFolder"></use></svg>
                ${window.siyuan.languages.appearance8}
            </button>
        </div>
        <div class="fn__hr"></div>
        <div class="fn__flex config__item">
            <div class="fn__flex-center fn__flex-1 ft__on-surface">${window.siyuan.languages.theme2}</div>
            <span class="fn__space"></span>
            <select class="b3-select fn__flex-center fn__size200" id="icon">
                ${genOptions(window.siyuan.config.appearance.icons, window.siyuan.config.appearance.icon)}
            </select>
        </div>
    </div>
    <div class="b3-label fn__flex">
        <div class="fn__block">
            <div>
                ${window.siyuan.languages.appearance1}
            </div>
            <div class="fn__hr"></div>
            <div class="fn__flex config__item">
                <div class="fn__flex-center fn__flex-1 ft__on-surface">${window.siyuan.languages.appearance2}</div>
                <span class="fn__space"></span>
                <select id="codeBlockThemeLight" class="b3-select fn__size200">
                    ${genOptions(Constants.SIYUAN_CONFIG_APPEARANCE_LIGHT_CODE, window.siyuan.config.appearance.codeBlockThemeLight)}
                </select>
            </div>
            <div class="fn__hr"></div>
            <div class="fn__flex config__item">
                <div class="fn__flex-center fn__flex-1 ft__on-surface">${window.siyuan.languages.appearance3}</div>
                <span class="fn__space"></span>
                <select id="codeBlockThemeDark" class="b3-select fn__size200">
                    ${genOptions(Constants.SIYUAN_CONFIG_APPEARANCE_DARK_CODE, window.siyuan.config.appearance.codeBlockThemeDark)}
                </select>
            </div>
        </div>
    </div>
</div>
<b class="config-group__title">${window.siyuan.languages.configGroupControls}</b>
<div class="config-group">
    <div class="fn__flex b3-label config__item">
        <div class="fn__flex-1">
            ${window.siyuan.languages.floatWindowMode}
            <div class="b3-label__text">${window.siyuan.languages.floatWindowModeTip}</div>
        </div>
        <span class="fn__space"></span>
        <select class="b3-select fn__flex-center fn__size200" id="floatWindowMode">
          <option value="0" ${window.siyuan.config.editor.floatWindowMode === 0 ? "selected" : ""}>${window.siyuan.languages.floatWindowMode0}</option>
          <option value="1" ${window.siyuan.config.editor.floatWindowMode === 1 ? "selected" : ""}>${window.siyuan.languages.floatWindowMode1.replace("${hotkey}", updateHotkeyTip("⌘"))}</option>
          <option value="2" ${window.siyuan.config.editor.floatWindowMode === 2 ? "selected" : ""}>${window.siyuan.languages.floatWindowMode2}</option>
        </select>
    </div>
    <div class="fn__flex b3-label config__item${window.siyuan.config.editor.floatWindowMode !== 0 ? " fn__none" : ""}" id="floatWindowDelayWrap">
        <div class="fn__flex-1">
            ${window.siyuan.languages.floatWindowDelay}
            <div class="b3-label__text">${window.siyuan.languages.floatWindowDelayTip}</div>
        </div>
        <span class="fn__space"></span>
        <div class="fn__size200 fn__flex-center fn__flex">
            <input class="b3-text-field fn__flex-1" id="floatWindowDelay" type="number" min="0" max="2000" value="${window.siyuan.config.editor.floatWindowDelay}"/>
            <span class="fn__space"></span>
            <span class="ft__on-surface fn__flex-center">ms</span>
        </div>
    </div>
    <label class="fn__flex b3-label">
        <div class="fn__flex-1">
            ${window.siyuan.languages.appearance10}
            <div class="b3-label__text">${window.siyuan.languages.appearance11}</div>
        </div>
        <span class="fn__space"></span>
        <input class="b3-switch fn__flex-center" id="closeButtonBehavior" type="checkbox"${window.siyuan.config.appearance.closeButtonBehavior === 0 ? "" : " checked"}>
    </label>
    <div class="b3-label">
        ${window.siyuan.languages.appearance16}
        <div class="fn__hr"></div>
        <label class="fn__flex">
            <div class="fn__flex-center fn__flex-1 ft__on-surface">
               ${window.siyuan.languages.appearance17}
            </div>
            <span class="fn__space"></span>
            <input class="b3-switch fn__flex-center" id="hideStatusBar" type="checkbox"${window.siyuan.config.appearance.hideStatusBar ? " checked" : ""}>
        </label>
        <div class="fn__hr"></div>
        <div class="fn__flex config__item">
            <div class="fn__flex-center fn__flex-1 ft__on-surface">
                ${window.siyuan.languages.appearance18}
            </div>
            <span class="fn__space"></span>
            <button class="b3-button b3-button--outline fn__flex-center fn__size200" id="statusBarSetting">
                <svg><use xlink:href="#iconSettings"></use></svg>${window.siyuan.languages.config}
            </button>
        </div>
    </div>
    <div class="b3-label fn__flex config__item">
       <div class="fn__flex-1">
            ${window.siyuan.languages.resetLayout}
            <div class="b3-label__text">${window.siyuan.languages.appearance6}</div>
        </div>
        <span class="fn__space"></span>
        <button class="b3-button b3-button--outline fn__flex-center fn__size200" id="resetLayout">
            <svg><use xlink:href="#iconUndo"></use></svg>${window.siyuan.languages.reset}
        </button>
    </div>
</div>
<b class="config-group__title">${window.siyuan.languages.configGroupPersonalization}</b>
<div class="config-group">
    <div class="b3-label config__item${isBrowser() ? " fn__none" : " fn__flex"}">
        <div class="fn__flex-1">
            ${window.siyuan.languages.customEmoji}
            <div class="b3-label__text">${window.siyuan.languages.customEmojiTip}</div>
        </div>
        <span class="fn__space"></span>
        <button class="b3-button b3-button--outline fn__flex-center fn__size200" id="appearanceOpenEmoji">
            <svg><use xlink:href="#iconFolder"></use></svg>
            ${window.siyuan.languages.showInFolder}
        </button>
    </div>
    <div class="b3-label">
        <div class="fn__flex config__item">
            <div class="fn__flex-1 fn__flex-center">
                ${window.siyuan.languages.codeSnippet}
            </div>
            <span class="fn__space"></span>
            <a class="b3-button b3-button--outline fn__flex-center fn__size200${"zh_CN" !== window.siyuan.config.lang ? " fn__none" : ""}" target="_blank" href="https://ld246.com/tag/code-snippet">
                <svg><use xlink:href="#iconUpload"></use></svg>${window.siyuan.languages.visitCommunityShare}
            </a>
        </div>
        <div class="fn__hr"></div>
        <div class="fn__flex config__item">
            <div class="fn__flex-center fn__flex-1 ft__on-surface">
                ${window.siyuan.languages.codeSnippetTip}
            </div>
            <span class="fn__space"></span>
            <button class="b3-button b3-button--outline fn__flex-center fn__size200" id="codeSnippet">
                <svg><use xlink:href="#iconSettings"></use></svg>${window.siyuan.languages.config}
            </button>
        </div>
    </div>
    <div class="b3-label">
        <label class="fn__flex">
            <div class="fn__flex-1">
                ${window.siyuan.languages.desktopMode}
                <div class="b3-label__text">${window.siyuan.languages.mobileModeTip}</div>
            </div>
            <div class="fn__space"></div>
            ${(() => {
                const raw = readCookieValue("siyuan-desktop-mode");
                const desktopModeChecked = raw === "true" || (raw !== "false" && !isMobile());
                return `<input class="b3-switch fn__flex-center" id="desktopMode" type="checkbox"${desktopModeChecked ? " checked" : ""}>`;
            })()}
        </label>
    </div>
</div>`;
    },
    _send: () => {
        const themeLight = (appearance.element.querySelector("#themeLight") as HTMLSelectElement).value;
        const themeDark = (appearance.element.querySelector("#themeDark") as HTMLSelectElement).value;
        const modeElementValue = parseInt((appearance.element.querySelector("#mode") as HTMLSelectElement).value);
        const OSTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        fetchPost("/api/setting/setAppearance", {
            ...window.siyuan.config.appearance,
            icon: (appearance.element.querySelector("#icon") as HTMLSelectElement).value,
            mode: modeElementValue === 2 ? (OSTheme === "light" ? 0 : 1) : modeElementValue,
            modeOS: modeElementValue === 2,
            codeBlockThemeDark: (appearance.element.querySelector("#codeBlockThemeDark") as HTMLSelectElement).value,
            codeBlockThemeLight: (appearance.element.querySelector("#codeBlockThemeLight") as HTMLSelectElement).value,
            themeDark,
            themeLight,
            darkThemes: window.siyuan.config.appearance.darkThemes,
            lightThemes: window.siyuan.config.appearance.lightThemes,
            icons: window.siyuan.config.appearance.icons,
            lang: (appearance.element.querySelector("#lang") as HTMLSelectElement).value,
            closeButtonBehavior: (appearance.element.querySelector("#closeButtonBehavior") as HTMLInputElement).checked ? 1 : 0,
            hideToolbar: window.siyuan.config.appearance.hideToolbar,
            hideStatusBar: (appearance.element.querySelector("#hideStatusBar") as HTMLInputElement).checked,
            statusBar: {
                msgTaskDatabaseIndexCommitDisabled: window.siyuan.config.appearance.statusBar.msgTaskDatabaseIndexCommitDisabled,
                msgTaskHistoryDatabaseIndexCommitDisabled: window.siyuan.config.appearance.statusBar.msgTaskHistoryDatabaseIndexCommitDisabled,
                msgTaskAssetDatabaseIndexCommitDisabled: window.siyuan.config.appearance.statusBar.msgTaskAssetDatabaseIndexCommitDisabled,
                msgTaskHistoryGenerateFileDisabled: window.siyuan.config.appearance.statusBar.msgTaskHistoryGenerateFileDisabled,
            }
        }, () => {
            resetFloatDockSize();
        });
    },
    _sendEditor: () => {
        const floatWindowDelayElement = appearance.element.querySelector("#floatWindowDelay") as HTMLInputElement;
        const floatWindowMode = parseInt((appearance.element.querySelector("#floatWindowMode") as HTMLSelectElement).value);
        let floatWindowDelay = parseInt(floatWindowDelayElement.value);
        if (isNaN(floatWindowDelay)) {
            floatWindowDelay = 620;
        } else if (floatWindowDelay < 0) {
            floatWindowDelay = 0;
        } else if (floatWindowDelay > 2000) {
            floatWindowDelay = 2000;
        }
        floatWindowDelayElement.value = floatWindowDelay.toString();
        const fontFamilyElement = appearance.element.querySelector("#fontFamily") as HTMLInputElement;
        fetchPost("/api/setting/setEditor", {
            ...window.siyuan.config.editor,
            fontFamily: fontFamilyElement.dataset.family ?? "",
            fontWeight: parseInt(fontFamilyElement.dataset.weight || "0", 10),
            fontFamilyDisplay: fontFamilyElement.dataset.display ?? "",
            fontSize: parseInt((appearance.element.querySelector("#fontSize") as HTMLInputElement).value),
            fontSizeScrollZoom: (appearance.element.querySelector("#fontSizeScrollZoom") as HTMLInputElement).checked,
            fullWidth: (appearance.element.querySelector("#fullWidth") as HTMLInputElement).checked,
            justify: (appearance.element.querySelector("#justify") as HTMLInputElement).checked,
            rtl: (appearance.element.querySelector("#rtl") as HTMLInputElement).checked,
            floatWindowMode,
            floatWindowDelay,
        }, response => {
            window.siyuan.config.editor = response.data;
            editor._onSetEditor(response.data);
            if (fontFamilyElement) {
                fontFamilyElement.dataset.family = response.data.fontFamily || "";
                fontFamilyElement.dataset.weight = String(response.data.fontWeight ?? 0);
                fontFamilyElement.dataset.display = response.data.fontFamilyDisplay || "";
                fontFamilyElement.value = response.data.fontFamilyDisplay || response.data.fontFamily || "";
                if (response.data.fontFamily) {
                    fontFamilyElement.style.fontFamily = `${response.data.fontFamily},var(--b3-font-family)`;
                    fontFamilyElement.style.fontWeight = response.data.fontWeight ? String(response.data.fontWeight) : "";
                } else {
                    fontFamilyElement.style.fontFamily = "";
                    fontFamilyElement.style.fontWeight = "";
                }
            }
        });
    },
    bindEvent: () => {
        const fontFamilyElement = appearance.element.querySelector("#fontFamily") as HTMLInputElement;

        // Font family menu
        fontFamilyElement.addEventListener("click", () => {
            fetchPost("/api/system/getSysFonts", {}, (response) => {
                const curFamily = fontFamilyElement.dataset.family ?? "";
                const curWeight = parseInt(fontFamilyElement.dataset.weight || "0", 10);
                const fontMenu = new Menu();
                fontMenu.addItem({
                    iconHTML: "",
                    checked: curFamily === "",
                    label: `<div style='var(--b3-font-family);'>${window.siyuan.languages.default}</div>`,
                    click: () => {
                        const fam = fontFamilyElement.dataset.family ?? "";
                        const w = parseInt(fontFamilyElement.dataset.weight || "0", 10);
                        if (fam === "" && w === 0) return;
                        fontFamilyElement.value = "";
                        fontFamilyElement.style.fontFamily = "";
                        fontFamilyElement.style.fontWeight = "";
                        fontFamilyElement.dataset.family = "";
                        fontFamilyElement.dataset.weight = "0";
                        fontFamilyElement.dataset.display = "";
                        appearance._sendEditor();
                    }
                });
                response.data.forEach((item: {family: string; weight: number; displayName: string}) => {
                    fontMenu.addItem({
                        iconHTML: "",
                        checked: item.family === curFamily && item.weight === curWeight,
                        label: `<div style='font-family:"${item.family}",var(--b3-font-family);'>${item.displayName}</div>`,
                        click: () => {
                            if (item.family === (fontFamilyElement.dataset.family ?? "") && item.weight === parseInt(fontFamilyElement.dataset.weight || "0", 10)) {
                                return;
                            }
                            fontFamilyElement.dataset.family = item.family;
                            fontFamilyElement.dataset.weight = String(item.weight);
                            fontFamilyElement.dataset.display = item.displayName;
                            fontFamilyElement.value = item.displayName;
                            fontFamilyElement.style.fontFamily = item.family + ",var(--b3-font-family)";
                            fontFamilyElement.style.fontWeight = item.weight ? String(item.weight) : "";
                            appearance._sendEditor();
                        }
                    });
                });
                const rect = fontFamilyElement.getBoundingClientRect();
                fontMenu.open({ x: rect.left, y: rect.bottom });
            });
        });

        // Float window mode toggle
        const fwModeEl = appearance.element.querySelector("#floatWindowMode") as HTMLSelectElement;
        fwModeEl.addEventListener("change", () => {
            const mode = parseInt(fwModeEl.value);
            appearance.element.querySelector("#floatWindowDelayWrap").classList.toggle("fn__none", mode !== 0);
            appearance._sendEditor();
        });

        setStatusBar(appearance.element.querySelector("#statusBarSetting"));
        appearance.element.querySelector("#desktopMode")?.addEventListener("change", (event) => {
            event.stopImmediatePropagation();
            const checked = (event.target as HTMLInputElement).checked;
            document.cookie = "siyuan-desktop-mode=" + (checked ? "true" : "false") + ";path=/;max-age=31536000";
            window.location.href = "/";
        });
        appearance.element.querySelector("#codeSnippet").addEventListener("click", () => {
            openSnippets();
        });
        appearance.element.querySelector("#resetLayout").addEventListener("click", () => {
            confirmDialog("⚠️ " + window.siyuan.languages.reset, window.siyuan.languages.appearance6, () => {
                resetLayout();
            });
        });
        /// #if !BROWSER
        appearance.element.querySelector("#appearanceOpenIcon").addEventListener("click", () => {
            useShell("openPath", path.join(window.siyuan.config.system.confDir, "appearance", "icons"));
        });
        appearance.element.querySelector("#appearanceOpenTheme").addEventListener("click", () => {
            useShell("openPath", path.join(window.siyuan.config.system.confDir, "appearance", "themes"));
        });
        appearance.element.querySelector("#appearanceOpenEmoji").addEventListener("click", () => {
            useShell("openPath", path.join(window.siyuan.config.system.dataDir, "emojis"));
        });
        /// #endif
        appearance.element.querySelectorAll("select").forEach(item => {
            item.addEventListener("change", () => {
                appearance._send();
            });
        });
        appearance.element.querySelectorAll(".b3-switch").forEach((item) => {
            item.addEventListener("change", () => {
                const id = (item as HTMLInputElement).id;
                if (id === "fullWidth" || id === "justify" || id === "rtl" || id === "fontSizeScrollZoom") {
                    appearance._sendEditor();
                } else {
                    appearance._send();
                }
            });
        });
        // Font size slider: _sendEditor on change
        const fontSizeSlider = appearance.element.querySelector("#fontSize") as HTMLInputElement;
        if (fontSizeSlider) {
            fontSizeSlider.addEventListener("input", (event) => {
                const target = event.target as HTMLInputElement;
                target.parentElement?.setAttribute("aria-label", target.value);
            });
            fontSizeSlider.addEventListener("change", () => appearance._sendEditor());
        }
        // Float window delay: _sendEditor on blur
        const fwDelayEl = appearance.element.querySelector("#floatWindowDelay");
        if (fwDelayEl) {
            fwDelayEl.addEventListener("blur", () => appearance._sendEditor());
        }
    },
    onSetAppearance(data: Config.IAppearance) {
        if (data.lang !== window.siyuan.config.appearance.lang) {
            exportLayout({
                cb() {
                    window.location.reload();
                },
                errorExit: false,
            });
            return;
        }

        window.siyuan.config.appearance = data;
        if (appearance.element) {
            const modeElement = appearance.element.querySelector("#mode") as HTMLSelectElement;
            if (modeElement) {
                if (data.modeOS) {
                    modeElement.value = "2";
                } else {
                    modeElement.value = data.mode === 0 ? "0" : "1";
                }
            }
            const themeLightElement = appearance.element.querySelector("#themeLight") as HTMLSelectElement;
            if (themeLightElement) {
                themeLightElement.innerHTML = genOptions(window.siyuan.config.appearance.lightThemes, window.siyuan.config.appearance.themeLight);
            }
            const themeDarkElement = appearance.element.querySelector("#themeDark") as HTMLSelectElement;
            if (themeDarkElement) {
                themeDarkElement.innerHTML = genOptions(window.siyuan.config.appearance.darkThemes, window.siyuan.config.appearance.themeDark);
            }
            const iconElement = appearance.element.querySelector("#icon") as HTMLSelectElement;
            if (iconElement) {
                iconElement.innerHTML = genOptions(window.siyuan.config.appearance.icons, window.siyuan.config.appearance.icon);
            }
        }
        loadAssets(data);
        document.querySelector("#barMode use")?.setAttribute("xlink:href", `#icon${window.siyuan.config.appearance.modeOS ? "Mode" : (window.siyuan.config.appearance.mode === 0 ? "Light" : "Dark")}`);
    }
};