/** 移动端侧栏中设置标签页菜单项的 DOM `id` */
export const configTabToMenuId = (tabId: string): string =>
    "menuConfig" + tabId[0].toUpperCase() + tabId.slice(1);
