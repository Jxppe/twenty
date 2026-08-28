import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import {
  WORK_THIS_WEEK_NAV_ITEM_UNIVERSAL_IDENTIFIER,
  WORK_THIS_WEEK_VIEW_UNIVERSAL_IDENTIFIER,
  PRACTICE_FOLDER_NAV_ITEM_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: WORK_THIS_WEEK_NAV_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Work this week',
  icon: 'IconClockEdit',
  position: 5,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: WORK_THIS_WEEK_VIEW_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier: PRACTICE_FOLDER_NAV_ITEM_UNIVERSAL_IDENTIFIER,
});
