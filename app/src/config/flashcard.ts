import {fetchPost} from "../util/fetch";
import {
    type SettingSection,
    switchRow,
    textBlockRow,
    numberRow,
    selectRow,
    findSettingRowByControlId,
} from "./ui/settingRows";
import {filterSettingSections} from "./ui/search";
import {renderSettingTabHtmlFromSections} from "./ui/render";
import {readDomValue} from "./ui/formValue";
import {mergeRecordByDottedPath} from "./ui/dotPath";
import {mountSettingSaveHandlers} from "./ui/save";

export const flashcard = {
    mount: async (root: HTMLElement, searchQuery?: string) => {
        const sections = filterSettingSections(buildFlashcardSections(), searchQuery);
        root.innerHTML = renderSettingTabHtmlFromSections(sections);
        await mountSettingSaveHandlers(root, sections);
    },

    set(root: HTMLElement, controlId: string, sections: SettingSection[]) {
        if (!controlId.startsWith("flashcard.")) {
            return;
        }
        const el = root.querySelector<HTMLElement>(`#${CSS.escape(controlId)}`);
        if (!el) {
            return;
        }
        const row = findSettingRowByControlId(sections, controlId);
        const value = readDomValue(el, row);
        if (value !== undefined) {
            flashcard.send(controlId, value);
        }
    },

    send(controlId: string, value: unknown) {
        if (!controlId.startsWith("flashcard.")) {
            return;
        }
        const rel = controlId.slice("flashcard.".length);
        if (!rel) {
            return;
        }
        const prev = window.siyuan.config.flashcard as unknown as Record<string, unknown>;
        const payload = mergeRecordByDottedPath(prev, rel, value) as unknown as Config.IFlashCard;
        fetchPost("/api/setting/setFlashcard", payload, (response) => {
            // 当前修改闪卡设置之后内核不推送到所有前端实例，需要手动 apply
            flashcard.apply(response.data);
        });
    },

    apply(data: Config.IFlashCard) {
        window.siyuan.config.flashcard = data;
    },
};

/** 每次调用时重新构造。全量列表供 `filterSettingSections(..., searchQuery)` 使用。 */
export function buildFlashcardSections(): SettingSection[] {
    return [
        {
            title: window.siyuan.languages.configGroupCardCreation,
            items: [
                switchRow({
                    id: "flashcard.mark",
                    title: window.siyuan.languages.flashcardMark,
                    desc: window.siyuan.languages.flashcardMarkTip,
                }),
                switchRow({
                    id: "flashcard.list",
                    title: window.siyuan.languages.flashcardList,
                    desc: window.siyuan.languages.flashcardListTip,
                }),
                switchRow({
                    id: "flashcard.heading",
                    title: window.siyuan.languages.flashcardHeading,
                    desc: window.siyuan.languages.flashcardHeadingTip,
                }),
                switchRow({
                    id: "flashcard.superBlock",
                    title: window.siyuan.languages.flashcardSuperBlock,
                    desc: window.siyuan.languages.flashcardSuperBlockTip,
                }),
            ],
        },
        {
            title: window.siyuan.languages.configGroupReview,
            items: [
                selectRow({
                    id: "flashcard.reviewMode",
                    title: window.siyuan.languages.reviewMode,
                    desc: window.siyuan.languages.reviewModeTip,
                    options: [
                        {value: 0, label: window.siyuan.languages.reviewMode0},
                        {value: 1, label: window.siyuan.languages.reviewMode1},
                        {value: 2, label: window.siyuan.languages.reviewMode2},
                    ],
                    value: window.siyuan.config.flashcard.reviewMode,
                }),
                numberRow({
                    id: "flashcard.newCardLimit",
                    title: window.siyuan.languages.flashcardNewCardLimit,
                    desc: window.siyuan.languages.flashcardNewCardLimitTip,
                    min: 0,
                }),
                numberRow({
                    id: "flashcard.reviewCardLimit",
                    title: window.siyuan.languages.flashcardReviewCardLimit,
                    desc: window.siyuan.languages.flashcardReviewCardLimitTip,
                    min: 0,
                }),
                numberRow({
                    id: "flashcard.requestRetention",
                    title: window.siyuan.languages.flashcardFSRSParamRequestRetention,
                    desc: window.siyuan.languages.flashcardFSRSParamRequestRetentionTip,
                    min: 0,
                    max: 1,
                    step: "0.01",
                }),
                numberRow({
                    id: "flashcard.maximumInterval",
                    title: window.siyuan.languages.flashcardFSRSParamMaximumInterval,
                    desc: window.siyuan.languages.flashcardFSRSParamMaximumIntervalTip,
                    min: 365,
                    max: 36500,
                }),
                textBlockRow({
                    id: "flashcard.weights",
                    title: window.siyuan.languages.flashcardFSRSParamWeights,
                    desc: window.siyuan.languages.flashcardFSRSParamWeightsTip,
                    mode: "input-text",
                    value: window.siyuan.config.flashcard.weights,
                }),
            ],
        },
        {
            title: window.siyuan.languages.configGroupOthers,
            items: [
                switchRow({
                    id: "flashcard.deck",
                    title: window.siyuan.languages.flashcardDeck,
                    desc: window.siyuan.languages.flashcardDeckTip,
                }),
            ],
        },
    ];
}
