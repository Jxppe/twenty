import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import {
  INBOX_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  UNASSIGNED_CONVERSATIONS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  UNASSIGNED_CONVERSATIONS_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier:
    UNASSIGNED_CONVERSATIONS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Unassigned',
  icon: 'IconInbox',
  position: 2,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: UNASSIGNED_CONVERSATIONS_VIEW_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier:
    INBOX_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
});
