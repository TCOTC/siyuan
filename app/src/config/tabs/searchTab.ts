import type {TabBuilder} from "../registry/tabBuilder";

export const registerSearchQueryGroup = (p: TabBuilder) => {
    const s = p.group("query", "");

    s.switchQuery({
        key: "blockType",
        title: window.siyuan.languages.searchBlockType,
        footer: `[1] ${window.siyuan.languages.containerBlockTip1}`,
        items: [
            {kind: "switch", id: "mathBlock", label: window.siyuan.languages.math, icon: "iconMath"},
            {kind: "switch", id: "table", label: window.siyuan.languages.table, icon: "iconTable"},
            {kind: "switch", id: "paragraph", label: window.siyuan.languages.paragraph, icon: "iconParagraph"},
            {kind: "switch", id: "heading", label: window.siyuan.languages.headings, icon: "iconHeadings"},
            {kind: "switch", id: "codeBlock", label: window.siyuan.languages.code, icon: "iconCode"},
            {kind: "switch", id: "htmlBlock", label: "HTML", icon: "iconHTML5"},
            {kind: "switch", id: "databaseBlock", label: window.siyuan.languages.database, icon: "iconDatabase"},
            {kind: "switch", id: "embedBlock", label: window.siyuan.languages.embedBlock, icon: "iconSQL"},
            {kind: "switch", id: "videoBlock", label: window.siyuan.languages.video, icon: "iconVideo"},
            {kind: "switch", id: "audioBlock", label: window.siyuan.languages.audio, icon: "iconRecord"},
            {kind: "switch", id: "iframeBlock", label: "IFrame", icon: "iconGlobe"},
            {kind: "switch", id: "widgetBlock", label: window.siyuan.languages.widget, icon: "iconBoth"},
            {kind: "switch", id: "blockquote", label: `${window.siyuan.languages.quote} <sup>[1]</sup>`, icon: "iconQuote"},
            {kind: "switch", id: "callout", label: `${window.siyuan.languages.callout} <sup>[1]</sup>`, icon: "iconCallout"},
            {kind: "switch", id: "superBlock", label: `${window.siyuan.languages.superBlock} <sup>[1]</sup>`, icon: "iconSuper"},
            {kind: "switch", id: "list", label: `${window.siyuan.languages.list1} <sup>[1]</sup>`, icon: "iconList"},
            {kind: "switch", id: "listItem", label: `${window.siyuan.languages.listItem} <sup>[1]</sup>`, icon: "iconListItem"},
            {kind: "switch", id: "document", label: window.siyuan.languages.doc, icon: "iconFile"},
        ],
    });
    s.switchQuery({
        key: "blockAttr",
        title: window.siyuan.languages.searchBlockAttr,
        items: [
            {kind: "switch", id: "name", label: window.siyuan.languages.name, icon: "iconN"},
            {kind: "switch", id: "alias", label: window.siyuan.languages.alias, icon: "iconA"},
            {kind: "switch", id: "memo", label: window.siyuan.languages.memo, icon: "iconM"},
            {kind: "switch", id: "ial", label: window.siyuan.languages.allAttrs},
        ],
    });
    s.switchQuery({
        key: "backmention",
        title: window.siyuan.languages.searchBackmention,
        items: [
            {kind: "switch", id: "backlinkMentionName", label: window.siyuan.languages.name},
            {kind: "switch", id: "backlinkMentionAlias", label: window.siyuan.languages.alias},
            {kind: "switch", id: "backlinkMentionAnchor", label: window.siyuan.languages.anchor},
            {kind: "switch", id: "backlinkMentionDoc", label: window.siyuan.languages.docName},
            {kind: "number", id: "backlinkMentionKeywordsLimit", label: window.siyuan.languages.keywordsLimit, min: 1, max: 10240},
        ],
    });
    s.switchQuery({
        key: "virtualRef",
        title: window.siyuan.languages.searchVirtualRef,
        items: [
            {kind: "switch", id: "virtualRefName", label: window.siyuan.languages.name},
            {kind: "switch", id: "virtualRefAlias", label: window.siyuan.languages.alias},
            {kind: "switch", id: "virtualRefAnchor", label: window.siyuan.languages.anchor},
            {kind: "switch", id: "virtualRefDoc", label: window.siyuan.languages.docName},
        ],
    });
    s.switchQuery({
        key: "index",
        title: window.siyuan.languages.searchIndex,
        items: [
            {kind: "switch", id: "indexAssetPath", label: window.siyuan.languages.indexAssetPath},
        ],
    });
};

export const registerSearchLimitsGroup = (p: TabBuilder) => {
    const s = p.group("limits", "");

    s.number("limit", {
        title: window.siyuan.languages.searchLimit,
        desc: `${window.siyuan.languages.searchLimit1}<br>${window.siyuan.languages.searchLimit2}`,
        min: 32,
        max: 10240,
    });
    s.switch("caseSensitive", {
        title: window.siyuan.languages.searchCaseSensitive,
        desc: window.siyuan.languages.searchCaseSensitive1,
    });
};

export const registerSearchTab = (p: TabBuilder) => {
    registerSearchQueryGroup(p);
    registerSearchLimitsGroup(p);
};
