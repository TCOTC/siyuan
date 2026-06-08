/// #if !BROWSER
import {ipcRenderer} from "electron";
/// #endif
import type {TabBuilder} from "../registry/tabBuilder";
import {Constants} from "../../constants";
import {isBrowser} from "../../util/functions";
import {useShell} from "../../util/pathName";
import {exportConfigApi} from "./exportRuntime";

export const registerExportReferencesGroup = (p: TabBuilder) => {
    const s = p.group("references", window.siyuan.languages.configGroupReferences);

    s.switch("includeSubDocs", {
        title: window.siyuan.languages.includeSubDocs,
        desc: window.siyuan.languages.includeSubDocsTip,
    });
    s.switch("includeRelatedDocs", {
        title: window.siyuan.languages.includeRelatedDocs,
        desc: window.siyuan.languages.includeRelatedDocsTip,
    });
    s.select("blockRefMode", {
        title: window.siyuan.languages.ref,
        desc: window.siyuan.languages.export11,
        options: [
            {value: 2, label: window.siyuan.languages.export2},
            {value: 3, label: window.siyuan.languages.export3},
            {value: 4, label: window.siyuan.languages.export4},
        ],
    });
    s.select("blockEmbedMode", {
        title: window.siyuan.languages.blockEmbed,
        desc: window.siyuan.languages.export12,
        options: [
            {value: 0, label: window.siyuan.languages.export0},
            {value: 1, label: window.siyuan.languages.export1},
        ],
    });
};

export const registerExportFormatGroup = (p: TabBuilder) => {
    const s = p.group("format", window.siyuan.languages.configGroupFormat);

    s.switch("markdownYFM", {
        title: window.siyuan.languages.export23,
        desc: window.siyuan.languages.export24,
    });
    s.switch("addTitle", {
        title: window.siyuan.languages.export17,
        desc: window.siyuan.languages.export18,
    });
    s.switch("paragraphBeginningSpace", {
        title: window.siyuan.languages.paragraphBeginningSpace,
        desc: window.siyuan.languages.md4,
    });
    s.switch("removeAssetsID", {
        title: window.siyuan.languages.removeAssetsID,
        desc: window.siyuan.languages.removeAssetsIDTip,
    });
    s.switch("inlineMemo", {
        title: window.siyuan.languages.export31,
        desc: window.siyuan.languages.export32,
    });
    s.textPair({
        title: window.siyuan.languages.export13,
        desc: window.siyuan.languages.export14,
        leftPath: "blockRefTextLeft",
        rightPath: "blockRefTextRight",
    });
    s.textPair({
        title: window.siyuan.languages.export15,
        desc: window.siyuan.languages.export16,
        leftPath: "tagOpenMarker",
        rightPath: "tagCloseMarker",
    });
};

export const registerExportPdfGroup = (p: TabBuilder) => {
    if (isBrowser()) {
        return;
    }
    const s = p.group("pdf", window.siyuan.languages.configGroupPDF);

    s.select("fileAnnotationRefMode", {
        title: window.siyuan.languages.export5,
        desc: window.siyuan.languages.export6,
        options: [
            {value: 0, label: window.siyuan.languages.export7},
            {value: 1, label: window.siyuan.languages.export8},
        ],
    });
    s.text("pdfFooter", {
        title: window.siyuan.languages.export21,
        desc: window.siyuan.languages.export22,
    });
    s.block({
        key: "pdfWatermark",
        keywords: [
            window.siyuan.languages.export27,
            window.siyuan.languages.export28,
            window.siyuan.languages.export29,
        ],
    }, (b) => {
        b.title(window.siyuan.languages.export27);
        b.desc(window.siyuan.languages.export28);
        b.textBlock("export.pdfWatermarkStr", {
            mode: "input-text",
        });
        b.desc(`<a href="https://pdfcpu.io/core/watermark#description" target="_blank">${window.siyuan.languages.export29}</a>`);
        b.textBlock("export.pdfWatermarkDesc", {
            mode: "textarea",
        });
    });
};

export const registerExportImagesGroup = (p: TabBuilder) => {
    const s = p.group("images", window.siyuan.languages.configGroupImages);

    s.block({
        key: "imageWatermark",
        keywords: [
            window.siyuan.languages.export30,
            window.siyuan.languages.export28,
            window.siyuan.languages.export29,
            window.siyuan.languages.export10,
        ],
    }, (b) => {
        b.title(window.siyuan.languages.export30);
        b.desc(window.siyuan.languages.export28);
        b.textBlock("export.imageWatermarkStr", {
            mode: "input-text",
        });
        b.desc(`${window.siyuan.languages.export29}<div class="fn__hr--small"></div>${window.siyuan.languages.export10}`);
        b.textBlock("export.imageWatermarkDesc", {
            mode: "textarea",
        });
    });
};

export const registerExportPandocGroup = (p: TabBuilder) => {
    if (isBrowser()) {
        return;
    }
    const s = p.group("pandoc", window.siyuan.languages.configGroupPandoc);

    s.block({
        key: "pandocBin",
        keywords: [
            window.siyuan.languages.export19,
            window.siyuan.languages.export20,
            window.siyuan.languages.reset,
            window.siyuan.languages.config,
        ],
        afterMount: mountExportPandocStack,
    }, (b) => {
        b.title(`${window.siyuan.languages.export19}<span class="fn__space"></span><a href="javascript:void(0)" id="pandocBinPathDisplay" style="word-break: break-all">${Lute.EscapeHTMLStr(window.siyuan.config.export.pandocBin)}</a>`);
        b.button({
            id: "pandocBinReset",
            label: window.siyuan.languages.reset,
            icon: "iconUndo",
        });
        b.desc(window.siyuan.languages.export20);
        b.button({
            id: "pandocBinChooser",
            label: window.siyuan.languages.config,
            icon: "iconSettings",
        });
    });
    s.textBlock("pandocParams", {
        title: window.siyuan.languages.export25,
        desc: window.siyuan.languages.export26,
        mode: "textarea",
    });
};

const mountExportPandocStack = (root: HTMLElement) => {
    root.querySelector("#pandocBinReset")?.addEventListener("click", () => {
        exportConfigApi.patch("export.pandocBin", "");
    });
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
        exportConfigApi.patch("export.pandocBin", localPath.filePaths[0]);
    });
};

export const registerExportTab = (p: TabBuilder) => {
    registerExportReferencesGroup(p);
    registerExportFormatGroup(p);
    registerExportPdfGroup(p);
    registerExportImagesGroup(p);
    registerExportPandocGroup(p);
};
