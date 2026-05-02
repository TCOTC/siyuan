import {fetchPost} from "../../util/fetch";

export const setReadOnly = (readOnly: boolean) => {
    fetchPost("/api/setting/setEditor", {
        ...window.siyuan.config.editor,
        readOnly,
    }, (response) => {
        window.siyuan.config.editor = response.data;
    });
};
