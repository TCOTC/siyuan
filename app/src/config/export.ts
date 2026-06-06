/// #if !BROWSER
import {ipcRenderer} from "electron";
/// #endif
import {fetchPost} from "../util/fetch";
import {Constants} from "../constants";
import {isBrowser} from "../util/functions";
import {useShell} from "../util/pathName";
import {
    type SettingSection,
    switchRow,
    textRow,
    textBlockRow,
    textPairRow,
    selectRow,
    stackRow,
    findSettingRowByControlId,
} from "./ui/settingRows";
import {filterSettingSections} from "./ui/search";
import {genSettingTabHtmlFromSections} from "./ui/render";
import {readDomValue} from "./ui/formValue";
import {mergeRecordByDottedPath} from "./ui/dotPath";
import {mountSettingSaveHandlers} from "./ui/save";

export const exportSettings = {
    mount: async (root: HTMLElement, searchQuery?: string) => {
        const sections = filterSettingSections(buildExportSections(), searchQuery);
        root.innerHTML = genSettingTabHtmlFromSections(sections);
        await mountSettingSaveHandlers(root, sections);
    },

    set(el: HTMLElement, controlId: string) {
        if (!controlId.startsWith("export.")) {
            return;
        }
        const row = findSettingRowByControlId(buildExportSections(), controlId);
        const value = readDomValue(el, row);
        if (value !== undefined) {
            exportSettings.send(controlId, value);
        }
    },

    send(controlId: string, value: unknown) {
        if (!controlId.startsWith("export.")) {
            return;
        }
        const rel = controlId.slice("export.".length);
        if (!rel) {
            return;
        }
        const prev = window.siyuan.config.export as unknown as Record<string, unknown>;
        const payload = mergeRecordByDottedPath(prev, rel, value) as unknown as Config.IExport;
        fetchPost("/api/setting/setExport", payload, (response) => {
            // 当前修改导出设置之后内核不推送到所有前端实例，需要手动 apply
            exportSettings.apply(response.data);
        });
    },

    apply(data: Config.IExport) {
        window.siyuan.config.export = data;
        const pathDisplay = document.getElementById("pandocBinPathDisplay");
        console.log("pandocBin", data.pandocBin, pathDisplay);
        if (pathDisplay) {
            pathDisplay.textContent = data.pandocBin;
        }
    },
};

export function buildExportSections(): SettingSection[] {
    return [
        {
            title: window.siyuan.languages.configGroupReferences,
            items: [
                switchRow({
                    id: "export.includeSubDocs",
                    title: window.siyuan.languages.includeSubDocs,
                    desc: window.siyuan.languages.includeSubDocsTip,
                }),
                switchRow({
                    id: "export.includeRelatedDocs",
                    title: window.siyuan.languages.includeRelatedDocs,
                    desc: window.siyuan.languages.includeRelatedDocsTip,
                }),
                selectRow({
                    id: "export.blockRefMode",
                    title: window.siyuan.languages.ref,
                    desc: window.siyuan.languages.export11,
                    options: [
                        {value: 2, label: window.siyuan.languages.export2},
                        {value: 3, label: window.siyuan.languages.export3},
                        {value: 4, label: window.siyuan.languages.export4},
                    ],
                    value: window.siyuan.config.export.blockRefMode,
                }),
                selectRow({
                    id: "export.blockEmbedMode",
                    title: window.siyuan.languages.blockEmbed,
                    desc: window.siyuan.languages.export12,
                    options: [
                        {value: 0, label: window.siyuan.languages.export0},
                        {value: 1, label: window.siyuan.languages.export1},
                    ],
                    value: window.siyuan.config.export.blockEmbedMode,
                }),
            ],
        },
        {
            title: window.siyuan.languages.configGroupFormat,
            items: [
                switchRow({
                    id: "export.markdownYFM",
                    title: window.siyuan.languages.export23,
                    desc: window.siyuan.languages.export24,
                }),
                switchRow({
                    id: "export.addTitle",
                    title: window.siyuan.languages.export17,
                    desc: window.siyuan.languages.export18,
                }),
                switchRow({
                    id: "export.paragraphBeginningSpace",
                    title: window.siyuan.languages.paragraphBeginningSpace,
                    desc: window.siyuan.languages.md4,
                }),
                switchRow({
                    id: "export.removeAssetsID",
                    title: window.siyuan.languages.removeAssetsID,
                    desc: window.siyuan.languages.removeAssetsIDTip,
                }),
                switchRow({
                    id: "export.inlineMemo",
                    title: window.siyuan.languages.export31,
                    desc: window.siyuan.languages.export32,
                }),
                textPairRow({
                    title: window.siyuan.languages.export13,
                    desc: window.siyuan.languages.export14,
                    leftId: "export.blockRefTextLeft",
                    rightId: "export.blockRefTextRight",
                }),
                textPairRow({
                    title: window.siyuan.languages.export15,
                    desc: window.siyuan.languages.export16,
                    leftId: "export.tagOpenMarker",
                    rightId: "export.tagCloseMarker",
                }),
            ],
        },
        ...(isBrowser() ? [] : [{
            title: window.siyuan.languages.configGroupPDF,
            items: [
                selectRow({
                    id: "export.fileAnnotationRefMode",
                    title: window.siyuan.languages.export5,
                    desc: window.siyuan.languages.export6,
                    options: [
                        {value: 0, label: window.siyuan.languages.export7},
                        {value: 1, label: window.siyuan.languages.export8},
                    ],
                    value: window.siyuan.config.export.fileAnnotationRefMode,
                }),
                textRow({
                    id: "export.pdfFooter",
                    title: window.siyuan.languages.export21,
                    desc: window.siyuan.languages.export22,
                }),
                stackRow({
                    lines: [
                        {left: {kind: "title", text: window.siyuan.languages.export27}},
                        {left: {kind: "desc", text: window.siyuan.languages.export28}},
                        {
                            left: {
                                kind: "textBlock",
                                id: "export.pdfWatermarkStr",
                                mode: "input-text",
                                value: window.siyuan.config.export.pdfWatermarkStr,
                            },
                        },
                        {
                            left: {
                                kind: "desc",
                                text: `<a href="https://pdfcpu.io/core/watermark#description" target="_blank">${window.siyuan.languages.export29}</a>`,
                            },
                        },
                        {
                            left: {
                                kind: "textBlock",
                                id: "export.pdfWatermarkDesc",
                                mode: "textarea",
                                value: window.siyuan.config.export.pdfWatermarkDesc,
                            },
                        },
                    ],
                }),
            ],
        }]),
        {
            title: window.siyuan.languages.configGroupImages,
            items: [
                stackRow({
                    lines: [
                        {left: {kind: "title", text: window.siyuan.languages.export30}},
                        {left: {kind: "desc", text: window.siyuan.languages.export28}},
                        {
                            left: {
                                kind: "textBlock",
                                id: "export.imageWatermarkStr",
                                mode: "input-text",
                                value: window.siyuan.config.export.imageWatermarkStr,
                            },
                        },
                        {
                            left: {
                                kind: "desc",
                                text: `${window.siyuan.languages.export29}<div class="fn__hr--small"></div>${window.siyuan.languages.export10}`,
                            },
                        },
                        {
                            left: {
                                kind: "textBlock",
                                id: "export.imageWatermarkDesc",
                                mode: "textarea",
                                value: window.siyuan.config.export.imageWatermarkDesc,
                            },
                        },
                    ],
                }),
            ],
        },
        ...(isBrowser() ? [] : [{
            title: window.siyuan.languages.configGroupPandoc,
            items: [
                stackRow({
                    lines: [
                        {
                            left: {
                                kind: "title",
                                text: `${window.siyuan.languages.export19}<span class="fn__space"></span><a href="javascript:void(0)" id="pandocBinPathDisplay" style="word-break: break-all">${Lute.EscapeHTMLStr(window.siyuan.config.export.pandocBin)}</a>`,
                            },
                            right: {
                                kind: "button",
                                id: "pandocBinReset",
                                label: window.siyuan.languages.reset,
                                icon: "iconUndo",
                                bind: (root) => {
                                    root.querySelector("#pandocBinReset")?.addEventListener("click", () => {
                                        exportSettings.send("export.pandocBin", "");
                                    });
                                },
                            },
                        },
                        {
                            left: {kind: "desc", text: window.siyuan.languages.export20},
                            right: {
                                kind: "button",
                                id: "pandocBinChooser",
                                label: window.siyuan.languages.config,
                                icon: "iconSettings",
                                bind: (root) => {
                                    root.querySelector("#pandocBinPathDisplay")?.addEventListener("click", () => {
                                        if (window.siyuan.config.export.pandocBin) {
                                            useShell("showItemInFolder", window.siyuan.config.export.pandocBin);
                                        }
                                    });
                                    root.querySelector("#pandocBinChooser")?.addEventListener("click", async () => {
                                        const localPath = await ipcRenderer.invoke(Constants.SIYUAN_GET, {
                                            cmd: "showOpenDialog",
                                            defaultPath: window.siyuan.config.system.homeDir,
                                            properties: ["openFile", "showHiddenFiles"],
                                        });
                                        if (!localPath.filePaths.length) {
                                            return;
                                        }
                                        exportSettings.send("export.pandocBin", localPath.filePaths[0]);
                                    });
                                },
                            },
                        },
                    ],
                }),
                textBlockRow({
                    id: "export.pandocParams",
                    title: window.siyuan.languages.export25,
                    desc: window.siyuan.languages.export26,
                    mode: "textarea",
                    value: window.siyuan.config.export.pandocParams,
                }),
            ],
        }]),
    ];
}
