import type {SettingTabBuilder} from "../setting/builder";

/** 闪卡 Tab：各组注册实现（由 setting/tabs.ts 调用） */
export const registerFlashcardCreationGroup = (tab: SettingTabBuilder) => {
    const group = tab.group("creation", window.siyuan.languages.configGroupCardCreation);

    group.switch("mark", {
        title: window.siyuan.languages.flashcardMark,
        desc: window.siyuan.languages.flashcardMarkTip,
    });
    group.switch("list", {
        title: window.siyuan.languages.flashcardList,
        desc: window.siyuan.languages.flashcardListTip,
    });
    group.switch("heading", {
        title: window.siyuan.languages.flashcardHeading,
        desc: window.siyuan.languages.flashcardHeadingTip,
    });
    group.switch("superBlock", {
        title: window.siyuan.languages.flashcardSuperBlock,
        desc: window.siyuan.languages.flashcardSuperBlockTip,
    });
};

export const registerFlashcardReviewGroup = (tab: SettingTabBuilder) => {
    const group = tab.group("review", window.siyuan.languages.configGroupReview);

    group.select("reviewMode", {
        title: window.siyuan.languages.reviewMode,
        desc: window.siyuan.languages.reviewModeTip,
        options: [
            {value: 0, label: window.siyuan.languages.reviewMode0},
            {value: 1, label: window.siyuan.languages.reviewMode1},
            {value: 2, label: window.siyuan.languages.reviewMode2},
        ],
    });
    group.number("newCardLimit", {
        title: window.siyuan.languages.flashcardNewCardLimit,
        desc: window.siyuan.languages.flashcardNewCardLimitTip,
        min: 0,
    });
    group.number("reviewCardLimit", {
        title: window.siyuan.languages.flashcardReviewCardLimit,
        desc: window.siyuan.languages.flashcardReviewCardLimitTip,
        min: 0,
    });
    group.number("requestRetention", {
        title: window.siyuan.languages.flashcardFSRSParamRequestRetention,
        desc: window.siyuan.languages.flashcardFSRSParamRequestRetentionTip,
        min: 0,
        max: 1,
        step: "0.01",
    });
    group.number("maximumInterval", {
        title: window.siyuan.languages.flashcardFSRSParamMaximumInterval,
        desc: window.siyuan.languages.flashcardFSRSParamMaximumIntervalTip,
        min: 365,
        max: 36500,
    });
    group.textBlock("weights", {
        title: window.siyuan.languages.flashcardFSRSParamWeights,
        desc: window.siyuan.languages.flashcardFSRSParamWeightsTip,
        mode: "input-text",
    });
};

export const registerFlashcardOthersGroup = (tab: SettingTabBuilder) => {
    const group = tab.group("others", window.siyuan.languages.configGroupOthers);

    group.switch("deck", {
        title: window.siyuan.languages.flashcardDeck,
        desc: window.siyuan.languages.flashcardDeckTip,
    });
};

export const registerFlashcardTab = (tab: SettingTabBuilder) => {
    registerFlashcardCreationGroup(tab);
    registerFlashcardReviewGroup(tab);
    registerFlashcardOthersGroup(tab);
};
