import {fetchPost} from "../util/fetch";
/// #if !BROWSER
import {ipcRenderer} from "electron";
/// #endif
import {isBrowser} from "../util/functions";
import {useShell} from "../util/pathName";
import {Constants} from "../constants";

export const exportConfig = {
    element: undefined as Element,
    genHTML: () => {
        return `<b class="config-group__title">${window.siyuan.languages.configGroupReferences}</b>
<div class="config-group">
<label class="fn__flex b3-label">
    <div class="fn__flex-1">
        ${window.siyuan.languages.includeSubDocs}
        <div class="b3-label__text">${window.siyuan.languages.includeSubDocsTip}</div>
    </div>
    <span class="fn__space"></span>
    <input class="b3-switch fn__flex-center" id="includeSubDocs" type="checkbox"${window.siyuan.config.export.includeSubDocs ? " checked" : ""}/>
</label>
<label class="fn__flex b3-label">
    <div class="fn__flex-1">
        ${window.siyuan.languages.includeRelatedDocs}
        <div class="b3-label__text">${window.siyuan.languages.includeRelatedDocsTip}</div>
    </div>
    <span class="fn__space"></span>
    <input class="b3-switch fn__flex-center" id="includeRelatedDocs" type="checkbox"${window.siyuan.config.export.includeRelatedDocs ? " checked" : ""}/>
</label>
<div class="fn__flex b3-label config__item">
    <div class="fn__flex-1">
        ${window.siyuan.languages.ref}
        <div class="b3-label__text">${window.siyuan.languages.export11}</div>
    </div>
    <span class="fn__space"></span>
    <select id="blockRefMode" class="b3-select fn__flex-center fn__size200">
        <option value="2" ${window.siyuan.config.export.blockRefMode === 2 ? "selected" : ""}>${window.siyuan.languages.export2}</option>
        <option value="3" ${window.siyuan.config.export.blockRefMode === 3 ? "selected" : ""}>${window.siyuan.languages.export3}</option>
        <option value="4" ${window.siyuan.config.export.blockRefMode === 4 ? "selected" : ""}>${window.siyuan.languages.export4}</option>
    </select>
</div>
<div class="fn__flex b3-label config__item">
    <div class="fn__flex-1">
        ${window.siyuan.languages.blockEmbed}
        <div class="b3-label__text">${window.siyuan.languages.export12}</div>
    </div>
    <span class="fn__space"></span>
    <select id="blockEmbedMode" class="b3-select fn__flex-center fn__size200">
        <option value="0" ${window.siyuan.config.export.blockEmbedMode === 0 ? "selected" : ""}>${window.siyuan.languages.export0}</option>
        <option value="1" ${window.siyuan.config.export.blockEmbedMode === 1 ? "selected" : ""}>${window.siyuan.languages.export1}</option>
    </select>
</div>
</div>
<b class="config-group__title">${window.siyuan.languages.configGroupFormat}</b>
<div class="config-group">
<label class="fn__flex b3-label">
    <div class="fn__flex-1">
        ${window.siyuan.languages.export23}
        <div class="b3-label__text">${window.siyuan.languages.export24}</div>
    </div>
    <span class="fn__space"></span>
    <input class="b3-switch fn__flex-center" id="markdownYFM" type="checkbox"${window.siyuan.config.export.markdownYFM ? " checked" : ""}/>
</label>
<label class="fn__flex b3-label">
    <div class="fn__flex-1">
        ${window.siyuan.languages.export17}
        <div class="b3-label__text">${window.siyuan.languages.export18}</div>
    </div>
    <span class="fn__space"></span>
    <input class="b3-switch fn__flex-center" id="addTitle" type="checkbox"${window.siyuan.config.export.addTitle ? " checked" : ""}/>
</label>
<label class="fn__flex b3-label">
    <div class="fn__flex-1">
        ${window.siyuan.languages.paragraphBeginningSpace}
        <div class="b3-label__text">${window.siyuan.languages.md4}</div>
    </div>
    <span class="fn__space"></span>
    <input class="b3-switch fn__flex-center" id="paragraphBeginningSpace" type="checkbox"${window.siyuan.config.export.paragraphBeginningSpace ? " checked" : ""}/>
</label>
<label class="fn__flex b3-label">
    <div class="fn__flex-1">
        ${window.siyuan.languages.removeAssetsID}
        <div class="b3-label__text">${window.siyuan.languages.removeAssetsIDTip}</div>
    </div>
    <span class="fn__space"></span>
    <input class="b3-switch fn__flex-center" id="removeAssetsID" type="checkbox"${window.siyuan.config.export.removeAssetsID ? " checked" : ""}/>
</label>
<label class="fn__flex b3-label">
    <div class="fn__flex-1">
        ${window.siyuan.languages.export31}
        <div class="b3-label__text">${window.siyuan.languages.export32}</div>
    </div>
    <span class="fn__space"></span>
    <input class="b3-switch fn__flex-center" id="inlineMemo" type="checkbox"${window.siyuan.config.export.inlineMemo ? " checked" : ""}/>
</label>
<div class="fn__flex b3-label config__item">
    <div class="fn__flex-1">
        ${window.siyuan.languages.export13}
        <div class="b3-label__text">${window.siyuan.languages.export14}</div>
    </div>
    <span class="fn__space"></span>
    <input class="b3-text-field fn__flex-center fn__size96" id="blockRefTextLeft">
    <span class="fn__space"></span>
    <input class="b3-text-field fn__flex-center fn__size96" id="blockRefTextRight">
</div>
<div class="fn__flex b3-label config__item">
    <div class="fn__flex-1">
        ${window.siyuan.languages.export15}
        <div class="b3-label__text">${window.siyuan.languages.export16}</div>
    </div>
    <span class="fn__space"></span>
    <input class="b3-text-field fn__flex-center fn__size96" id="tagOpenMarker">
    <span class="fn__space"></span>
    <input class="b3-text-field fn__flex-center fn__size96" id="tagCloseMarker">
</div>
</div>
<b class="config-group__title">${window.siyuan.languages.configGroupPDF}</b>
<div class="config-group">
<div class="fn__flex b3-label config__item">
    <div class="fn__flex-1">
        ${window.siyuan.languages.export5}
        <div class="b3-label__text">${window.siyuan.languages.export6}</div>
    </div>
    <span class="fn__space"></span>
    <select id="fileAnnotationRefMode" class="b3-select fn__flex-center fn__size200">
        <option value="0" ${window.siyuan.config.export.fileAnnotationRefMode === 0 ? "selected" : ""}>${window.siyuan.languages.export7}</option>
        <option value="1" ${window.siyuan.config.export.fileAnnotationRefMode === 1 ? "selected" : ""}>${window.siyuan.languages.export8}</option>
    </select>
</div>
<div class="fn__flex b3-label config__item">
    <div class="fn__flex-1">
        ${window.siyuan.languages.export21}
        <div class="b3-label__text">${window.siyuan.languages.export22}</div>
    </div>
    <input class="b3-text-field fn__flex-center fn__size200" id="pdfFooter">
</div>
<div class="b3-label config__item">
    ${window.siyuan.languages.export27}
    <div class="b3-label__text">${window.siyuan.languages.export28}</div>
    <div class="fn__hr"></div>
    <input class="b3-text-field fn__block" id="pdfWatermarkStr">
    <div class="fn__hr"></div>
    <div class="b3-label__text"><a href="https://pdfcpu.io/core/watermark#description" target="_blank">${window.siyuan.languages.export29}</a></div>
    <div class="fn__hr"></div>
    <textarea class="b3-text-field fn__block" id="pdfWatermarkDesc"></textarea>
</div>
</div>
<b class="config-group__title">${window.siyuan.languages.configGroupImages}</b>
<div class="config-group">
<div class="b3-label config__item">
    ${window.siyuan.languages.export30}
    <div class="b3-label__text">${window.siyuan.languages.export28}</div>
    <div class="fn__hr"></div>
    <input class="b3-text-field fn__block" id="imageWatermarkStr">
    <div class="fn__hr"></div>
    <div class="b3-label__text">    
        ${window.siyuan.languages.export29}<br>
        ${window.siyuan.languages.export10}
    </div>
    <div class="fn__hr"></div>
    <textarea class="b3-text-field fn__block" id="imageWatermarkDesc"></textarea>
</div>
</div>
<b class="config-group__title">${window.siyuan.languages.configGroupPandoc}</b>
<div class="config-group">
<div class="fn__flex b3-label config__item${isBrowser() ? " fn__none" : ""}">
    <div class="fn__flex-1">
        ${window.siyuan.languages.export19}
        <span class="fn__space"></span>
        <a href="javascript:void(0)" id="pandocBinPath" style="word-break: break-all">${window.siyuan.config.export.pandocBin}</a>
        <div class="b3-label__text">${window.siyuan.languages.export20}</div>
    </div>
    <span class="fn__space"></span>
    <button class="b3-button b3-button--outline fn__flex-center fn__size200" id="pandocBin"><svg><use xlink:href="#iconSettings"></use></svg>${window.siyuan.languages.config}</button>
</div>
<div class="b3-label config__item${isBrowser() ? " fn__none" : ""}">
    ${window.siyuan.languages.export25}
    <div class="b3-label__text">${window.siyuan.languages.export26}</div>
    <div class="fn__hr"></div>
    <textarea class="b3-text-field fn__block" id="pandocParams"></textarea>
</div>
</div>`;
    },
    bindEvent: () => {
        (exportConfig.element.querySelector("#pandocParams") as HTMLInputElement).value = window.siyuan.config.export.pandocParams;
        (exportConfig.element.querySelector("#pdfFooter") as HTMLInputElement).value = window.siyuan.config.export.pdfFooter;
        (exportConfig.element.querySelector("#pdfWatermarkStr") as HTMLInputElement).value = window.siyuan.config.export.pdfWatermarkStr;
        (exportConfig.element.querySelector("#pdfWatermarkDesc") as HTMLInputElement).value = window.siyuan.config.export.pdfWatermarkDesc;
        (exportConfig.element.querySelector("#imageWatermarkStr") as HTMLInputElement).value = window.siyuan.config.export.imageWatermarkStr;
        (exportConfig.element.querySelector("#imageWatermarkDesc") as HTMLInputElement).value = window.siyuan.config.export.imageWatermarkDesc;
        (exportConfig.element.querySelector("#blockRefTextLeft") as HTMLInputElement).value = window.siyuan.config.export.blockRefTextLeft;
        (exportConfig.element.querySelector("#blockRefTextRight") as HTMLInputElement).value = window.siyuan.config.export.blockRefTextRight;
        (exportConfig.element.querySelector("#tagOpenMarker") as HTMLInputElement).value = window.siyuan.config.export.tagOpenMarker;
        (exportConfig.element.querySelector("#tagCloseMarker") as HTMLInputElement).value = window.siyuan.config.export.tagCloseMarker;
        const pandocBinPathElement = exportConfig.element.querySelector("#pandocBinPath");
        const setexprt = (pandocBin?: string) => {
            fetchPost("/api/setting/setExport", {
                ...window.siyuan.config.export,
                paragraphBeginningSpace: (exportConfig.element.querySelector("#paragraphBeginningSpace") as HTMLInputElement).checked,
                addTitle: (exportConfig.element.querySelector("#addTitle") as HTMLInputElement).checked,
                removeAssetsID: (exportConfig.element.querySelector("#removeAssetsID") as HTMLInputElement).checked,
                markdownYFM: (exportConfig.element.querySelector("#markdownYFM") as HTMLInputElement).checked,
                inlineMemo: (exportConfig.element.querySelector("#inlineMemo") as HTMLInputElement).checked,
                includeSubDocs: (exportConfig.element.querySelector("#includeSubDocs") as HTMLInputElement).checked,
                includeRelatedDocs: (exportConfig.element.querySelector("#includeRelatedDocs") as HTMLInputElement).checked,
                blockRefMode: parseInt((exportConfig.element.querySelector("#blockRefMode") as HTMLSelectElement).value, 10),
                blockEmbedMode: parseInt((exportConfig.element.querySelector("#blockEmbedMode") as HTMLSelectElement).value, 10),
                fileAnnotationRefMode: parseInt((exportConfig.element.querySelector("#fileAnnotationRefMode") as HTMLSelectElement).value, 10),
                pdfFooter: (exportConfig.element.querySelector("#pdfFooter") as HTMLInputElement).value,
                pdfWatermarkStr: (exportConfig.element.querySelector("#pdfWatermarkStr") as HTMLInputElement).value,
                pdfWatermarkDesc: (exportConfig.element.querySelector("#pdfWatermarkDesc") as HTMLInputElement).value,
                imageWatermarkStr: (exportConfig.element.querySelector("#imageWatermarkStr") as HTMLInputElement).value,
                imageWatermarkDesc: (exportConfig.element.querySelector("#imageWatermarkDesc") as HTMLInputElement).value,
                pandocParams: (exportConfig.element.querySelector("#pandocParams") as HTMLInputElement).value,
                blockRefTextLeft: (exportConfig.element.querySelector("#blockRefTextLeft") as HTMLInputElement).value,
                blockRefTextRight: (exportConfig.element.querySelector("#blockRefTextRight") as HTMLInputElement).value,
                tagOpenMarker: (exportConfig.element.querySelector("#tagOpenMarker") as HTMLInputElement).value,
                tagCloseMarker: (exportConfig.element.querySelector("#tagCloseMarker") as HTMLInputElement).value,
                pandocBin: pandocBin || window.siyuan.config.export.pandocBin,
            }, (response) => {
                window.siyuan.config.export = response.data;
                pandocBinPathElement.textContent = response.data.pandocBin;
            });
        };
        exportConfig.element.querySelectorAll("select").forEach((item) => {
            item.addEventListener("change", () => {
                setexprt();
            });
        });
        exportConfig.element.querySelectorAll("input, textarea").forEach((item) => {
            item.addEventListener("change", () => {
                setexprt();
            });
        });
        /// #if !BROWSER
        pandocBinPathElement.addEventListener("click", () => {
            if (window.siyuan.config.export.pandocBin) {
                useShell("showItemInFolder", window.siyuan.config.export.pandocBin);
            }
        });
        const pandocBinElement = exportConfig.element.querySelector("#pandocBin") as HTMLInputElement;
        pandocBinElement.addEventListener("click", async () => {
            const localPath = await ipcRenderer.invoke(Constants.SIYUAN_GET, {
                cmd: "showOpenDialog",
                defaultPath: window.siyuan.config.system.homeDir,
                properties: ["openFile", "showHiddenFiles"],
            });
            if (localPath.filePaths.length === 0) {
                pandocBinElement.value = window.siyuan.config.export.pandocBin;
                return;
            }
            setexprt(localPath.filePaths[0]);
        });
        /// #endif
    },
};
