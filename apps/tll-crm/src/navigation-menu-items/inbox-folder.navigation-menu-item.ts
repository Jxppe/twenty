import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import { INBOX_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: INBOX_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Inbox',
  icon: 'IconInbox',
  position: 0,
  type: NavigationMenuItemType.FOLDER,
});
