/// #if !BROWSER
import {ipcRenderer} from "electron";
import {sendUnregisterGlobalShortcut} from "../boot/globalEvent/keydown";
/// #endif
import {isMac, updateHotkeyTip} from "../protyle/util/compatibility";
import {Constants} from "../constants";
import {hideMessage, showMessage} from "../dialog/message";
import {fetchPost} from "../util/fetch";
import {exportLayout} from "../layout/util";
import {confirmDialog} from "../dialog/confirmDialog";
import {sendGlobalShortcut} from "../boot/globalEvent/keydown";
import {
    type SettingSection,
    buttonRow,
    customRow,
} from "./ui/settingRows";
import {filterSettingSections, textMatchesConfigSearch} from "./ui/search";
import {renderSettingTabHtmlFromSections} from "./ui/render";
import {mountSettingSaveHandlers} from "./ui/save";
import type {Plugin} from "../plugin";

export const keymapSettings = {
    mount: async (root: HTMLElement, searchQuery?: string) => {
        const sections = filterKeymapSections(buildKeymapSections(), searchQuery);
        root.innerHTML = renderSettingTabHtmlFromSections(sections);
        await mountSettingSaveHandlers(root, sections);
        const query = searchQuery?.trim();
        if (query) {
            applyGlobalKeymapSearch(root, query);
        }
    },
};

/** 有搜索词且下方快捷键列表节仍展示时，上方刷新/重置节完整展示（两个按钮均保留） */
const filterKeymapSections = (sections: SettingSection[], searchQuery?: string): SettingSection[] => {
    const filtered = filterSettingSections(sections, searchQuery);
    const query = searchQuery?.trim();
    if (!query || filtered.length === 0) {
        return filtered;
    }
    const hasListSection = filtered.some((section) => section.items.some((row) => row.type === "custom"));
    if (!hasListSection) {
        return filtered;
    }
    const buttonSection = sections[0];
    const rest = filtered.filter((section) => !section.items.some((row) => row.type === "button"));
    return [buttonSection, ...rest];
};

export function buildKeymapSections(): SettingSection[] {
    return [
        {
            items: [
                buttonRow({
                    id: "keymapRefreshBtn",
                    title: window.siyuan.languages.keymapTip,
                    label: window.siyuan.languages.refresh,
                    icon: "iconRefresh",
                    bind: (root) => {
                        root.querySelector("#keymapRefreshBtn")?.addEventListener("click", () => {
                            exportLayout({
                                cb() {
                                    window.location.reload();
                                },
                                errorExit: false,
                            });
                        });
                    },
                }),
                buttonRow({
                    id: "keymapResetBtn",
                    title: window.siyuan.languages.keymapTip2,
                    label: window.siyuan.languages.reset,
                    icon: "iconUndo",
                    bind: (root) => {
                        root.querySelector("#keymapResetBtn")?.addEventListener("click", () => {
                            confirmDialog("⚠️ " + window.siyuan.languages.reset, window.siyuan.languages.confirmReset, () => {
                                fetchPost("/api/setting/setKeymap", {
                                    data: Constants.SIYUAN_KEYMAP,
                                }, () => {
                                    /// #if !BROWSER
                                    ipcRenderer.send(Constants.SIYUAN_CMD, {
                                        cmd: "writeLog",
                                        msg: "user reset keymap",
                                    });
                                    if (window.siyuan.config.keymap.general.toggleWin.default !== window.siyuan.config.keymap.general.toggleWin.custom) {
                                        ipcRenderer.send(Constants.SIYUAN_CMD, {
                                            cmd: "unregisterGlobalShortcut",
                                            accelerator: window.siyuan.config.keymap.general.toggleWin.custom,
                                        });
                                    }
                                    sendGlobalShortcut(window.siyuan.ws.app);
                                    /// #endif
                                    window.location.reload();
                                });
                            });
                        });
                    },
                }),
            ],
        },
        {
            items: [
                customRow({
                    keywords: buildKeymapKeywords(),
                    html: () => genKeymapListHtml(),
                    bind: (root) => bindKeymapList(root),
                }),
            ],
        },
    ];
}

const buildKeymapKeywords = (): string[] => [
    // 输入框占位符和按钮文案
    window.siyuan.languages.search,
    window.siyuan.languages.keymap,
    window.siyuan.languages.clear,
    // 命令分组标题
    window.siyuan.languages.general,
    window.siyuan.languages.editor,
    window.siyuan.languages.element,
    window.siyuan.languages.headings,
    window.siyuan.languages.list1,
    window.siyuan.languages.table,
    window.siyuan.languages.plugin,
    // 命令名
    ...buildKeymapCommandTexts(),
    // 有命令的插件名
    ...buildKeymapPluginDisplayNames(),
].filter((text): text is string => !!text);

const buildKeymapCommandTexts = (): string[] => {
    const out: string[] = [];
    const pushKey = (key: string) => {
        const text = window.siyuan.languages[key];
        if (text) {
            out.push(text);
        }
    };
    Object.keys(Constants.SIYUAN_KEYMAP.general).forEach(pushKey);
    Object.keys(Constants.SIYUAN_KEYMAP.editor.general).forEach((key) => {
        // TODO 把 window.siyuan.languages.duplicate 直接换成 "创建副本 / 创建镜像副本"，
        // 原先使用 window.siyuan.languages.duplicate 的其他地方换成用新的键
        if (key === "duplicate") {
            const duplicate = window.siyuan.languages.duplicate;
            const duplicateMirror = window.siyuan.languages.duplicateMirror;
            if (duplicate && duplicateMirror) {
                out.push(`${duplicate} / ${duplicateMirror}`);
            }
        } else {
            pushKey(key);
        }
    });
    Object.keys(Constants.SIYUAN_KEYMAP.editor.heading).forEach(pushKey);
    Object.keys(Constants.SIYUAN_KEYMAP.editor.insert).forEach(pushKey);
    Object.keys(Constants.SIYUAN_KEYMAP.editor.list).forEach(pushKey);
    Object.keys(Constants.SIYUAN_KEYMAP.editor.table).forEach(pushKey);
    return out;
};

const buildKeymapPluginDisplayNames = (): string[] => {
    const names: string[] = [];
    window.siyuan.ws.app.plugins.forEach((item) => {
        if (pluginHasKeymapItems(item) && item.displayName) {
            names.push(item.displayName);
        }
    });
    return names;
};

const pluginHasKeymapItems = (item: Plugin): boolean => {
    if (item.commands.length > 0) {
        return true;
    }
    for (const toolbarItem of item.updateProtyleToolbar([])) {
        if (typeof toolbarItem === "string" || Constants.INLINE_TYPE.concat("|").includes(toolbarItem.name)) {
            continue;
        }
        return true;
    }
    return Object.keys(item.docks).length > 0;
};

const genKeymapListHtml = () => {
    const generalHtml = genKeymapItem(window.siyuan.config.keymap.general, "general");

    const editorHtml = ([
        [window.siyuan.languages.general, window.siyuan.config.keymap.editor.general, "general"],
        [window.siyuan.languages.element, window.siyuan.config.keymap.editor.insert, "insert"],
        [window.siyuan.languages.headings, window.siyuan.config.keymap.editor.heading, "heading"],
        [window.siyuan.languages.list1, window.siyuan.config.keymap.editor.list, "list"],
        [window.siyuan.languages.table, window.siyuan.config.keymap.editor.table, "table"],
    ] as const).map(([title, keymap, segment]) =>
        genKeymapToggle(title) + `<div class="b3-list__panel fn__none">${genKeymapItem(keymap, "editor" + Constants.ZWSP + segment)}</div>`
    ).join("");

    const pluginHtmlParts: string[] = [];
    for (const item of window.siyuan.ws.app.plugins) {
        if (!pluginHasKeymapItems(item)) {
            continue;
        }
        pluginHtmlParts.push(genKeymapToggle(item.displayName) + `<div class="b3-list__panel fn__none">${buildKeymapPluginCommandHtml(item)}</div>`);
    }
    const pluginHtml = pluginHtmlParts.join("");

    return `<div class="b3-label file-tree config-keymap" id="keymapList">
    <div class="fn__flex config__item">
        <label class="b3-form__icon fn__block">
            <svg class="b3-form__icon-icon"><use xlink:href="#iconSearch"></use></svg>
            <input id="keymapInput" class="b3-form__icon-input b3-text-field fn__block" placeholder="${window.siyuan.languages.search}">
        </label>
        <div class="fn__space"></div>
        <label class="b3-form__icon fn__block searchByKeyLabel">
            <svg class="b3-form__icon-icon"><use xlink:href="#iconKeymap"></use></svg>
            <input id="searchByKey" style="font-family: var(--b3-font-family-kbd);" data-keymap="" class="b3-form__icon-input b3-text-field fn__block" spellcheck="false" placeholder="${window.siyuan.languages.keymap}">
        </label>
        <div class="fn__space"></div>
        <button id="clearSearchBtn" class="b3-button b3-button--outline fn__flex-center fn__size200">
            <svg><use xlink:href="#iconClose"></use></svg>
            ${window.siyuan.languages.clear}
        </button>
    </div>
    <div class="fn__hr"></div>
    ${genKeymapListBlock(window.siyuan.languages.general, generalHtml)}
    ${genKeymapListBlock(window.siyuan.languages.editor, editorHtml, true)}
    ${genKeymapListBlock(window.siyuan.languages.plugin, pluginHtml, true)}
</div>`;
};

const genKeymapRowHtml = (label: string, dataKey: string, custom: string, defaultValue: string) => {
    const keyValue = updateHotkeyTip(custom);
    return `<label class="b3-list-item b3-list-item--narrow b3-list-item--hide-action">
    <span class="b3-list-item__text">${label}</span>
    <span data-type="reset" class="b3-list-item__action b3-tooltips b3-tooltips__w" aria-label="${window.siyuan.languages.reset}">
        <svg><use xlink:href="#iconUndo"></use></svg>
    </span>
    <span data-type="clear" class="b3-list-item__action b3-tooltips b3-tooltips__w" aria-label="${window.siyuan.languages.remove}">
        <svg><use xlink:href="#iconTrashcan"></use></svg>
    </span>
    <span data-type="update" class="config-keymap__key">${keyValue}</span>
    <input data-key="${dataKey}" data-value="${custom}" data-default="${defaultValue}" class="b3-text-field fn__none" value="${keyValue}" spellcheck="false">
</label>`;
};

const genKeymapItem = (keymap: Record<string, Config.IKey>, keys: string) => {
    const html: string[] = [];
    for (const key of Object.keys(keymap)) {
        if (!window.siyuan.languages[key]) {
            continue;
        }
        let keymapName = window.siyuan.languages[key];
        if ("editor" + Constants.ZWSP + "general" === keys && key === "duplicate") {
            keymapName = `${window.siyuan.languages.duplicate} / ${window.siyuan.languages.duplicateMirror}`;
        }
        html.push(genKeymapRowHtml(keymapName, keys + Constants.ZWSP + key, keymap[key].custom, keymap[key].default));
    }
    return html.join("");
};

const genKeymapListBlock = (title: string, html: string, open = false) => {
    if (!html) {
        return "";
    }
    return `<div class="b3-list b3-list--border b3-list--background">
    ${genKeymapToggle(title, open)}
    <div class="b3-list__panel${open ? "" : " fn__none"}">${html}</div>
</div>`;
};

const genKeymapToggle = (title: string, open?: boolean) =>
    `<div class="b3-list-item b3-list-item--narrow toggle">
    <span class="b3-list-item__toggle b3-list-item__toggle--hl">
        <svg class="b3-list-item__arrow${open ? " b3-list-item__arrow--open" : ""}"><use xlink:href="#iconRight"></use></svg>
    </span>
    <span class="b3-list-item__text ft__on-surface">${title}</span>
</div>`;

const buildKeymapPluginCommandHtml = (item: Plugin) => {
    const pluginKeyPrefix = `plugin${Constants.ZWSP}${item.name}${Constants.ZWSP}`;
    const html: string[] = [];
    for (const command of item.commands) {
        html.push(genKeymapRowHtml(
            command.langText || (item.i18n ? item.i18n[command.langKey] : "") || command.langKey,
            pluginKeyPrefix + command.langKey,
            command.customHotkey,
            command.hotkey,
        ));
    }

    for (const toolbarItem of item.updateProtyleToolbar([])) {
        if (typeof toolbarItem === "string" || Constants.INLINE_TYPE.concat("|").includes(toolbarItem.name)) {
            continue;
        }
        const toolbarKeymap = window.siyuan.config.keymap.plugin[item.name][toolbarItem.name];
        html.push(genKeymapRowHtml(
            toolbarItem.tip || window.siyuan.languages[toolbarItem.lang],
            pluginKeyPrefix + toolbarItem.name,
            toolbarKeymap.custom,
            toolbarKeymap.default,
        ));
    }

    for (const key of Object.keys(item.docks)) {
        const dockKeymap = window.siyuan.config.keymap.plugin[item.name][key];
        html.push(genKeymapRowHtml(
            item.docks[key].config.title,
            pluginKeyPrefix + key,
            dockKeymap.custom,
            dockKeymap.default,
        ));
    }
    return html.join("");
};

// TODO 后面的代码还没看过，待重构

const keymapLabelsMatchQuery = (texts: string[], query: string): boolean => {
    const q = query.trim().toLowerCase();
    if (!q) {
        return false;
    }
    return texts.some((text) => textMatchesConfigSearch(text, q));
};

const setKeymapFromDom = (root: HTMLElement) => {
    const data: Config.IKeymap = JSON.parse(JSON.stringify(Constants.SIYUAN_KEYMAP));
    const oldToggleWin = window.siyuan.config.keymap.general.toggleWin.custom;
    root.querySelectorAll("label.b3-list-item input").forEach((item) => {
        const keys = item.getAttribute("data-key").split(Constants.ZWSP);
        const newHotkey = item.getAttribute("data-value");
        if (keys[0] === "plugin") {
            window.siyuan.config.keymap.plugin[keys[1]][keys[2]].custom = newHotkey;
            data.plugin = window.siyuan.config.keymap.plugin;
            window.siyuan.ws.app.plugins.forEach((plugin) => {
                if (plugin.name === keys[1]) {
                    plugin.commands.forEach((command) => {
                        if (command.langKey === keys[2]) {
                            /// #if !BROWSER
                            if (command.globalCallback && command.customHotkey && command.customHotkey !== newHotkey) {
                                ipcRenderer.send(Constants.SIYUAN_CMD, {
                                    cmd: "unregisterGlobalShortcut",
                                    accelerator: command.customHotkey,
                                });
                            }
                            /// #endif
                            command.customHotkey = newHotkey;
                        }
                    });
                }
            });
        } else if (keys[0] === "general") {
            data[keys[0]][keys[1]].custom = newHotkey;
        } else if (keys[0] === "editor" && (keys[1] === "general" || keys[1] === "insert" || keys[1] === "heading" || keys[1] === "list" || keys[1] === "table")) {
            data[keys[0]][keys[1]][keys[2]].custom = newHotkey;
        }
    });
    window.siyuan.config.keymap = data;
    fetchPost("/api/setting/setKeymap", {
        data,
    }, () => {
        /// #if !BROWSER
        ipcRenderer.send(Constants.SIYUAN_CMD, {
            cmd: "writeLog",
            msg: "user update keymap:" + JSON.stringify(window.siyuan.config.keymap),
        });
        if (oldToggleWin !== window.siyuan.config.keymap.general.toggleWin.custom) {
            ipcRenderer.send(Constants.SIYUAN_CMD, {
                cmd: "unregisterGlobalShortcut",
                accelerator: oldToggleWin,
            });
        }
        sendGlobalShortcut(window.siyuan.ws.app);
        /// #endif
    });
};

const toggleKeymapSearchItem = (editorKeymapElement: HTMLElement, value: string, keymapString: string) => {
    if (value === "" && keymapString === "") {
        if (editorKeymapElement.querySelector(".b3-list-item__arrow").classList.contains("b3-list-item__arrow--open")) {
            editorKeymapElement.lastElementChild.classList.remove("fn__none");
        } else {
            editorKeymapElement.lastElementChild.classList.add("fn__none");
        }
    }
    if (editorKeymapElement.querySelectorAll(".b3-list-item--hide-action.fn__none").length === editorKeymapElement.querySelectorAll(".b3-list-item--hide-action").length) {
        editorKeymapElement.firstElementChild.classList.add("fn__none");
    } else {
        editorKeymapElement.firstElementChild.classList.remove("fn__none");
    }
};

const searchKeymapList = (root: HTMLElement, value: string, keymapString: string) => {
    const keymapListElement = root.querySelector("#keymapList");
    if (!keymapListElement) {
        return;
    }
    const valueLower = value.trim().toLowerCase();
    const keymapLower = keymapString.trim().toLowerCase();
    keymapListElement.querySelectorAll(".b3-list-item--hide-action > .b3-list-item__text").forEach((item) => {
        const liElement = item.parentElement;
        let matchedKeymap = false;
        const dataValue = liElement.querySelector(".b3-text-field").getAttribute("data-value") || "";
        if (!keymapLower || dataValue.toLowerCase().indexOf(keymapLower) > -1) {
            matchedKeymap = true;
        }
        if ((!valueLower || textMatchesConfigSearch(item.textContent || "", valueLower)) && matchedKeymap) {
            liElement.classList.remove("fn__none");
            liElement.parentElement.classList.remove("fn__none");
            liElement.parentElement.parentElement.classList.remove("fn__none");
        } else {
            liElement.classList.add("fn__none");
        }
        if (!liElement.nextElementSibling) {
            const toggleElement = liElement.parentElement.previousElementSibling;
            if (!valueLower && !keymapLower) {
                if (toggleElement.querySelector(".b3-list-item__arrow").classList.contains("b3-list-item__arrow--open")) {
                    liElement.parentElement.classList.remove("fn__none");
                } else {
                    liElement.parentElement.classList.add("fn__none");
                }
            }
            if (liElement.parentElement.childElementCount === liElement.parentElement.querySelectorAll(".b3-list-item.fn__none").length) {
                toggleElement.classList.add("fn__none");
            } else {
                toggleElement.classList.remove("fn__none");
            }
        }
    });
    toggleKeymapSearchItem(keymapListElement.lastElementChild as HTMLElement, value, keymapString);
    if (keymapListElement.childElementCount === 5) {
        toggleKeymapSearchItem(keymapListElement.lastElementChild.previousElementSibling as HTMLElement, value, keymapString);
    }
};

/** 设置窗口全局搜索进入快捷键 Tab：仅当命中具体命令名时才写入 `#keymapInput` 并筛选列表 */
const applyGlobalKeymapSearch = (root: HTMLElement, query: string) => {
    const searchElement = root.querySelector("#keymapInput") as HTMLInputElement | null;
    const searchKeymapElement = root.querySelector("#searchByKey") as HTMLInputElement | null;
    if (!searchElement || !searchKeymapElement) {
        return;
    }

    searchKeymapElement.value = "";
    searchKeymapElement.dataset.keymap = "";

    if (keymapLabelsMatchQuery(buildKeymapCommandTexts(), query)) {
        searchElement.value = query;
        searchKeymapList(root, query, "");
        return;
    }

    searchElement.value = "";
    searchKeymapList(root, "", "");
};

const getKeymapConflictTip = (element: HTMLElement) => {
    const thirdElement = element.parentElement;
    let tip = thirdElement.querySelector(".b3-list-item__text").textContent.trim();
    const secondElement = thirdElement.parentElement.previousElementSibling;
    tip = secondElement.textContent.trim() + "-" + tip;
    const firstElement = secondElement.parentElement.previousElementSibling;
    if (firstElement.classList.contains("b3-list-item")) {
        tip = firstElement.textContent.trim() + "-" + tip;
    }
    return tip;
};

const getKeymapString = (event: KeyboardEvent) => {
    let keymapStr = "";
    if (event.ctrlKey && isMac()) {
        keymapStr += "⌃";
    }
    if (event.altKey) {
        keymapStr += "⌥";
    }
    if (event.shiftKey) {
        keymapStr += "⇧";
    }
    if (event.metaKey || (!isMac() && event.ctrlKey)) {
        keymapStr += "⌘";
    }
    if (event.key !== "Shift" && event.key !== "Alt" && event.key !== "Meta" && event.key !== "Control" && event.key !== "Unidentified") {
        if (event.keyCode === 229) {
            if (event.code === "Minus") {
                keymapStr += "-";
            } else if (event.code === "Semicolon") {
                keymapStr += ";";
            } else if (event.code === "Quote") {
                keymapStr += "'";
            } else if (event.code === "Comma") {
                keymapStr += ",";
            } else if (event.code === "Period") {
                keymapStr += ".";
            } else if (event.code === "Slash") {
                keymapStr += "/";
            }
        } else {
            keymapStr += Constants.KEYCODELIST[event.keyCode] || (event.key.length > 1 ? event.key : event.key.toUpperCase());
        }
    }
    return keymapStr;
};

const bindKeymapList = (root: HTMLElement) => {
    const searchElement = root.querySelector("#keymapInput") as HTMLInputElement;
    const searchKeymapElement = root.querySelector("#searchByKey") as HTMLInputElement;
    searchElement.addEventListener("compositionend", () => {
        searchKeymapList(root, searchElement.value, searchKeymapElement.dataset.keymap);
    });
    searchElement.addEventListener("input", (event: InputEvent) => {
        if (event.isComposing) {
            return;
        }
        searchKeymapList(root, searchElement.value, searchKeymapElement.dataset.keymap);
    });
    /// #if !BROWSER
    searchKeymapElement.addEventListener("focus", () => {
        sendUnregisterGlobalShortcut(window.siyuan.ws.app);
    });
    /// #endif
    searchKeymapElement.addEventListener("blur", () => {
        sendGlobalShortcut(window.siyuan.ws.app);
    });
    searchKeymapElement.addEventListener("keydown", function (event: KeyboardEvent) {
        event.stopPropagation();
        event.preventDefault();
        const keymapStr = getKeymapString(event);
        setTimeout(() => {
            this.value = updateHotkeyTip(keymapStr);
        });
        this.dataset.keymap = keymapStr;
        searchKeymapList(root, searchElement.value, keymapStr);
    });
    root.querySelector("#clearSearchBtn")?.addEventListener("click", () => {
        searchElement.value = "";
        searchKeymapElement.value = "";
        searchKeymapElement.dataset.keymap = "";
        searchKeymapList(root, "", "");
    });
    const keymapListElement = root.querySelector("#keymapList");
    keymapListElement.addEventListener("click", (event) => {
        let target = event.target as HTMLElement;
        while (target && !target.isEqualNode(keymapListElement)) {
            const type = target.getAttribute("data-type");
            if (type === "reset") {
                const inputElement = target.parentElement.querySelector(".b3-text-field") as HTMLInputElement;
                inputElement.value = updateHotkeyTip(inputElement.getAttribute("data-default"));
                inputElement.setAttribute("data-value", inputElement.getAttribute("data-default"));
                inputElement.previousElementSibling.textContent = inputElement.value;
                setKeymapFromDom(root);
                event.preventDefault();
                event.stopPropagation();
                break;
            } else if (type === "clear") {
                const inputElement = target.parentElement.querySelector(".b3-text-field") as HTMLInputElement;
                inputElement.value = "";
                inputElement.previousElementSibling.textContent = "";
                inputElement.setAttribute("data-value", "");
                setKeymapFromDom(root);
                event.preventDefault();
                event.stopPropagation();
                break;
            } else if (type === "update") {
                target.classList.add("fn__none");
                const inputElement = target.nextElementSibling as HTMLInputElement;
                inputElement.classList.remove("fn__none");
                inputElement.focus();
                event.preventDefault();
                event.stopPropagation();
                break;
            } else if (target.classList.contains("b3-list-item--hide-action")) {
                const inputElement = target.querySelector(".b3-text-field") as HTMLInputElement;
                inputElement.classList.remove("fn__none");
                inputElement.focus();
                inputElement.previousElementSibling.classList.add("fn__none");
                event.preventDefault();
                event.stopPropagation();
                break;
            } else if (target.classList.contains("toggle")) {
                if (target.nextElementSibling.classList.contains("fn__none")) {
                    target.firstElementChild.firstElementChild.classList.add("b3-list-item__arrow--open");
                    target.nextElementSibling.classList.remove("fn__none");
                } else {
                    target.firstElementChild.firstElementChild.classList.remove("b3-list-item__arrow--open");
                    target.nextElementSibling.classList.add("fn__none");
                }
                event.preventDefault();
                event.stopPropagation();
                break;
            }
            target = target.parentElement;
        }
    });
    let timeout: number;
    keymapListElement.querySelectorAll("label.b3-list-item input").forEach((item: HTMLInputElement) => {
        item.addEventListener("keydown", function (event: KeyboardEvent) {
            event.stopPropagation();
            event.preventDefault();
            const keymapStr = getKeymapString(event);
            const adoptKeymapStr = updateHotkeyTip(keymapStr);
            clearTimeout(timeout);
            timeout = window.setTimeout(() => {
                const keys = this.getAttribute("data-key").split(Constants.ZWSP);
                if (keys[1] === "list") {
                    keys[1] = "list1";
                }
                if (keys[1] === "heading") {
                    keys[1] = "headings";
                }
                let hasConflict = false;
                const isAssistKey = ["⌘", "⇧", "⌥", "⌃"].includes(keymapStr.substr(keymapStr.length - 1, 1));
                if (isAssistKey ||
                    ["⌘A", "⌘X", "⌘C", "⌘V", "⌘-", "⌘=", "⌘0", "⇧⌘V", "⌘/", "⇧↑", "⇧↓", "⇧→", "⇧←", "⇧⇥", "⌃D", "⇧⌘→",
                        "⇧⌘←", "⌘Home", "⌘End", "⇧↩", "↩", "PageUp", "PageDown", "⌫", "⌦", "Escape"].includes(keymapStr) ||
                    (isMac() && keys[0] === "general" && ["goToEditTabNext", "goToEditTabPrev"].includes(keys[1]) && keymapStr.includes("⌘"))
                ) {
                    if (!isAssistKey) {
                        showMessage(`${window.siyuan.languages.invalid} [${adoptKeymapStr}]`);
                    }
                    hasConflict = true;
                }
                Array.from(root.querySelectorAll("label.b3-list-item input")).find((inputItem: HTMLElement) => {
                    if ((inputItem !== this) && inputItem.getAttribute("data-value") === keymapStr) {
                        const inputValueList = inputItem.getAttribute("data-key").split(Constants.ZWSP);
                        if (inputValueList[1] === "list") {
                            inputValueList[1] = "list1";
                        }
                        if (inputValueList[1] === "heading") {
                            inputValueList[1] = "headings";
                        }
                        showMessage(`${window.siyuan.languages.conflict} [${getKeymapConflictTip(inputItem)} ${adoptKeymapStr}]`);
                        hasConflict = true;
                        return true;
                    }
                });
                if (hasConflict) {
                    this.value = updateHotkeyTip(this.getAttribute("data-value"));
                    return;
                }
                hideMessage();
                this.setAttribute("data-value", keymapStr);
                this.value = adoptKeymapStr;
                setKeymapFromDom(root);
            }, Constants.TIMEOUT_TRANSITION);
        });
        item.addEventListener("blur", function () {
            sendGlobalShortcut(window.siyuan.ws.app);
            setTimeout(() => {
                this.classList.add("fn__none");
                this.previousElementSibling.textContent = this.value;
                this.previousElementSibling.classList.remove("fn__none");
            }, Constants.TIMEOUT_INPUT);
        });
        /// #if !BROWSER
        item.addEventListener("focus", () => {
            sendUnregisterGlobalShortcut(window.siyuan.ws.app);
        });
        /// #endif
    });
};
