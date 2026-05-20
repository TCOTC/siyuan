import {fetchPost} from "../util/fetch";
import {
    type SettingSection,
    switchRow,
    numberRow,
    switchQueryRow,
    findSettingRowByControlId,
} from "./ui/settingRows";
import {filterSettingSections} from "./ui/search";
import {renderSettingTabHtmlFromSections} from "./ui/render";
import {readDomValue} from "./ui/formValue";
import {mergeRecordByDottedPath} from "./ui/dotPath";
import {mountSettingSaveHandlers} from "./ui/save";

export const searchSettings = {
    mount: async (root: HTMLElement, searchQuery?: string) => {
        const sections = filterSettingSections(buildSearchSections(), searchQuery);
        root.innerHTML = renderSettingTabHtmlFromSections(sections);
        await mountSettingSaveHandlers(root, sections);
    },

    set(el: HTMLElement, controlId: string) {
        if (!controlId.startsWith("search.")) {
            return;
        }
        const row = findSettingRowByControlId(buildSearchSections(), controlId);
        const value = readDomValue(el, row);
        if (value !== undefined) {
            searchSettings.send(controlId, value);
        }
    },

    send(controlId: string, value: unknown) {
        if (!controlId.startsWith("search.")) {
            return;
        }
        const rel = controlId.slice("search.".length);
        if (!rel) {
            return;
        }
        const prev = window.siyuan.config.search as unknown as Record<string, unknown>;
        const payload = mergeRecordByDottedPath(prev, rel, value) as unknown as Config.ISearch;
        fetchPost("/api/setting/setSearch", payload, (response) => {
            // 当前修改搜索设置之后内核不推送到所有前端实例，需要手动 apply
            searchSettings.apply(response.data);
        });
    },

    apply(data: Config.ISearch) {
        window.siyuan.config.search = data;
    },
};

/** 每次调用时重新构造。全量列表供 `filterSettingSections(..., searchQuery)` 使用。 */
export function buildSearchSections(): SettingSection[] {
    return [
        {
            items: [
                switchQueryRow({
                    title: window.siyuan.languages.searchBlockType,
                    footer: `[1] ${window.siyuan.languages.containerBlockTip1}`,
                    items: [
                        {kind: "switch", id: "search.mathBlock", label: window.siyuan.languages.math, icon: "iconMath"},
                        {kind: "switch", id: "search.table", label: window.siyuan.languages.table, icon: "iconTable"},
                        {kind: "switch", id: "search.paragraph", label: window.siyuan.languages.paragraph, icon: "iconParagraph"},
                        {kind: "switch", id: "search.heading", label: window.siyuan.languages.headings, icon: "iconHeadings"},
                        {kind: "switch", id: "search.codeBlock", label: window.siyuan.languages.code, icon: "iconCode"},
                        {kind: "switch", id: "search.htmlBlock", label: "HTML", icon: "iconHTML5"},
                        {kind: "switch", id: "search.databaseBlock", label: window.siyuan.languages.database, icon: "iconDatabase"},
                        {kind: "switch", id: "search.embedBlock", label: window.siyuan.languages.embedBlock, icon: "iconSQL"},
                        {kind: "switch", id: "search.videoBlock", label: window.siyuan.languages.video, icon: "iconVideo"},
                        {kind: "switch", id: "search.audioBlock", label: window.siyuan.languages.audio, icon: "iconRecord"},
                        {kind: "switch", id: "search.iframeBlock", label: "IFrame", icon: "iconGlobe"},
                        {kind: "switch", id: "search.widgetBlock", label: window.siyuan.languages.widget, icon: "iconBoth"},
                        {kind: "switch", id: "search.blockquote", label: `${window.siyuan.languages.quote} <sup>[1]</sup>`, icon: "iconQuote"},
                        {kind: "switch", id: "search.callout", label: `${window.siyuan.languages.callout} <sup>[1]</sup>`, icon: "iconCallout"},
                        {kind: "switch", id: "search.superBlock", label: `${window.siyuan.languages.superBlock} <sup>[1]</sup>`, icon: "iconSuper"},
                        {kind: "switch", id: "search.list", label: `${window.siyuan.languages.list1} <sup>[1]</sup>`, icon: "iconList"},
                        {kind: "switch", id: "search.listItem", label: `${window.siyuan.languages.listItem} <sup>[1]</sup>`, icon: "iconListItem"},
                        {kind: "switch", id: "search.document", label: window.siyuan.languages.doc, icon: "iconFile"},
                    ],
                }),
                switchQueryRow({
                    title: window.siyuan.languages.searchBlockAttr,
                    items: [
                        {kind: "switch", id: "search.name", label: window.siyuan.languages.name, icon: "iconN"},
                        {kind: "switch", id: "search.alias", label: window.siyuan.languages.alias, icon: "iconA"},
                        {kind: "switch", id: "search.memo", label: window.siyuan.languages.memo, icon: "iconM"},
                        {kind: "switch", id: "search.ial", label: window.siyuan.languages.allAttrs},
                    ],
                }),
                switchQueryRow({
                    title: window.siyuan.languages.searchBackmention,
                    items: [
                        {kind: "switch", id: "search.backlinkMentionName", label: window.siyuan.languages.name},
                        {kind: "switch", id: "search.backlinkMentionAlias", label: window.siyuan.languages.alias},
                        {kind: "switch", id: "search.backlinkMentionAnchor", label: window.siyuan.languages.anchor},
                        {kind: "switch", id: "search.backlinkMentionDoc", label: window.siyuan.languages.docName},
                        {kind: "number", id: "search.backlinkMentionKeywordsLimit", label: window.siyuan.languages.keywordsLimit, min: 1, max: 10240},
                    ],
                }),
                switchQueryRow({
                    title: window.siyuan.languages.searchVirtualRef,
                    items: [
                        {kind: "switch", id: "search.virtualRefName", label: window.siyuan.languages.name},
                        {kind: "switch", id: "search.virtualRefAlias", label: window.siyuan.languages.alias},
                        {kind: "switch", id: "search.virtualRefAnchor", label: window.siyuan.languages.anchor},
                        {kind: "switch", id: "search.virtualRefDoc", label: window.siyuan.languages.docName},
                    ],
                }),
                switchQueryRow({
                    title: window.siyuan.languages.searchIndex,
                    items: [
                        {kind: "switch", id: "search.indexAssetPath", label: window.siyuan.languages.indexAssetPath},
                    ],
                }),
            ],
        },
        {
            items: [
                numberRow({
                    id: "search.limit",
                    title: window.siyuan.languages.searchLimit,
                    desc: `${window.siyuan.languages.searchLimit1}<br>${window.siyuan.languages.searchLimit2}`,
                    min: 32,
                    max: 10240,
                }),
                switchRow({
                    id: "search.caseSensitive",
                    title: window.siyuan.languages.searchCaseSensitive,
                    desc: window.siyuan.languages.searchCaseSensitive1,
                }),
            ],
        },
    ];
}
