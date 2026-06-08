import type {PageBuilder} from "../registry/pageBuilder";

/** 闪卡 Tab：各组注册实现（由 registry/pages.ts 中的 registry 调用） */
export const registerFlashcardCreationGroup = (p: PageBuilder) => {
    const s = p.group("creation", window.siyuan.languages.configGroupCardCreation);

    s.switch("mark", {
        title: window.siyuan.languages.flashcardMark,
        desc: window.siyuan.languages.flashcardMarkTip,
    });
    s.switch("list", {
        title: window.siyuan.languages.flashcardList,
        desc: window.siyuan.languages.flashcardListTip,
    });
    s.switch("heading", {
        title: window.siyuan.languages.flashcardHeading,
        desc: window.siyuan.languages.flashcardHeadingTip,
    });
    s.switch("superBlock", {
        title: window.siyuan.languages.flashcardSuperBlock,
        desc: window.siyuan.languages.flashcardSuperBlockTip,
    });
};

export const registerFlashcardReviewGroup = (p: PageBuilder) => {
    const s = p.group("review", window.siyuan.languages.configGroupReview);

    s.select("reviewMode", {
        title: window.siyuan.languages.reviewMode,
        desc: window.siyuan.languages.reviewModeTip,
        options: [
            {value: 0, label: window.siyuan.languages.reviewMode0},
            {value: 1, label: window.siyuan.languages.reviewMode1},
            {value: 2, label: window.siyuan.languages.reviewMode2},
        ],
    });
    s.number("newCardLimit", {
        title: window.siyuan.languages.flashcardNewCardLimit,
        desc: window.siyuan.languages.flashcardNewCardLimitTip,
        min: 0,
    });
    s.number("reviewCardLimit", {
        title: window.siyuan.languages.flashcardReviewCardLimit,
        desc: window.siyuan.languages.flashcardReviewCardLimitTip,
        min: 0,
    });
    s.number("requestRetention", {
        title: window.siyuan.languages.flashcardFSRSParamRequestRetention,
        desc: window.siyuan.languages.flashcardFSRSParamRequestRetentionTip,
        min: 0,
        max: 1,
        step: "0.01",
    });
    s.number("maximumInterval", {
        title: window.siyuan.languages.flashcardFSRSParamMaximumInterval,
        desc: window.siyuan.languages.flashcardFSRSParamMaximumIntervalTip,
        min: 365,
        max: 36500,
    });
    s.textBlock("weights", {
        title: window.siyuan.languages.flashcardFSRSParamWeights,
        desc: window.siyuan.languages.flashcardFSRSParamWeightsTip,
        mode: "input-text",
    });
};

export const registerFlashcardOthersGroup = (p: PageBuilder) => {
    const s = p.group("others", window.siyuan.languages.configGroupOthers);

    s.switch("deck", {
        title: window.siyuan.languages.flashcardDeck,
        desc: window.siyuan.languages.flashcardDeckTip,
    });
};

export const registerFlashcardPage = (p: PageBuilder) => {
    registerFlashcardCreationGroup(p);
    registerFlashcardReviewGroup(p);
    registerFlashcardOthersGroup(p);
};
