import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import {
  BOOKINGS_CALENDAR_NAV_ITEM_UNIVERSAL_IDENTIFIER,
  BOOKINGS_CALENDAR_VIEW_UNIVERSAL_IDENTIFIER,
  PRACTICE_FOLDER_NAV_ITEM_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: BOOKINGS_CALENDAR_NAV_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Calendar',
  icon: 'IconCalendar',
  position: 3,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: BOOKINGS_CALENDAR_VIEW_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier:
    PRACTICE_FOLDER_NAV_ITEM_UNIVERSAL_IDENTIFIER,
});
