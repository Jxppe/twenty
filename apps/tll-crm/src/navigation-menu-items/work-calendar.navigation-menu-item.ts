import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import {
  WORK_CALENDAR_NAV_ITEM_UNIVERSAL_IDENTIFIER,
  WORK_CALENDAR_VIEW_UNIVERSAL_IDENTIFIER,
  PRACTICE_FOLDER_NAV_ITEM_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: WORK_CALENDAR_NAV_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Work by day',
  icon: 'IconCalendar',
  position: 5,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: WORK_CALENDAR_VIEW_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier: PRACTICE_FOLDER_NAV_ITEM_UNIVERSAL_IDENTIFIER,
});
