import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import {
  ALL_CONVERSATIONS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  ALL_CONVERSATIONS_VIEW_UNIVERSAL_IDENTIFIER,
  INBOX_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// The native record view of the same data. Kept alongside the custom Inbox
// page so the two can be compared during the prototype: this one gets search,
// filters and live SSE updates for free.
export default defineNavigationMenuItem({
  universalIdentifier:
    ALL_CONVERSATIONS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Conversation list',
  icon: 'IconTable',
  position: 1,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: ALL_CONVERSATIONS_VIEW_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier:
    INBOX_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
});
