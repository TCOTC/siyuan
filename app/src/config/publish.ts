import {access} from "./access";

/** 移动端等单独打开发布设置时使用，逻辑在 {@link access} 中 */
export const publish = {
    element: undefined as Element,
    genHTML: () => access.genPublishHTML(),
    bindEvent: () => {
        access.bindPublishEvent(publish.element as Element);
    },
};
