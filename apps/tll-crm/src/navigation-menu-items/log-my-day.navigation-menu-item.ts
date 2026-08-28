import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import {
  LOG_MY_DAY_NAV_ITEM_UNIVERSAL_IDENTIFIER,
  LOG_MY_DAY_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  PRACTICE_FOLDER_NAV_ITEM_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// First in the folder because it is the thing staff do every day. The rest of
// the folder is looked at when something is wrong; this is opened at six.
export default defineNavigationMenuItem({
  universalIdentifier: LOG_MY_DAY_NAV_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Log my day',
  icon: 'IconClockEdit',
  position: 0,
  type: NavigationMenuItemType.PAGE_LAYOUT,
  pageLayoutUniversalIdentifier: LOG_MY_DAY_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier: PRACTICE_FOLDER_NAV_ITEM_UNIVERSAL_IDENTIFIER,
});
