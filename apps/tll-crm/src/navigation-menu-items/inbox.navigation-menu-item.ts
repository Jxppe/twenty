import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import {
  INBOX_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  INBOX_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  INBOX_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: INBOX_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'All conversations',
  icon: 'IconMessages',
  position: 0,
  type: NavigationMenuItemType.PAGE_LAYOUT,
  pageLayoutUniversalIdentifier: INBOX_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier:
    INBOX_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
});
