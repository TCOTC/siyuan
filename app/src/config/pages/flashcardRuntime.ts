import {fetchPost} from "../../util/fetch";
import {mergeRecordByDottedPath} from "../ui/dotPath";

/** 将内核返回的闪卡配置写回当前实例 */
export const applyFlashcardConfig = (data: Config.IFlashCard) => {
    window.siyuan.config.flashcard = data;
};

const postFlashcardConfig = (payload: Config.IFlashCard) => {
    fetchPost("/api/setting/setFlashcard", payload, (response) => {
        // 当前修改闪卡设置之后内核不推送到所有前端实例，需要手动 apply
        applyFlashcardConfig(response.data);
    });
};

const mergeAndPost = (rel: string, value: unknown) => {
    if (!rel) {
        return;
    }
    const prev = window.siyuan.config.flashcard as unknown as Record<string, unknown>;
    const payload = mergeRecordByDottedPath(prev, rel, value) as unknown as Config.IFlashCard;
    postFlashcardConfig(payload);
};

/** 闪卡 Tab 命名空间：设置面板注册项 save */
export const flashcardConfigApi = {
    patch(relOrFullId: string, value: unknown) {
        const rel = relOrFullId.startsWith("flashcard.")
            ? relOrFullId.slice("flashcard.".length)
            : relOrFullId;
        mergeAndPost(rel, value);
    },

    apply: applyFlashcardConfig,
};
