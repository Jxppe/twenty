import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import {
  PRACTICE_FOLDER_NAV_ITEM_UNIVERSAL_IDENTIFIER,
  UPCOMING_BOOKINGS_NAV_ITEM_UNIVERSAL_IDENTIFIER,
  UPCOMING_BOOKINGS_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: UPCOMING_BOOKINGS_NAV_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Upcoming bookings',
  icon: 'IconCalendarEvent',
  position: 4,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: UPCOMING_BOOKINGS_VIEW_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier:
    PRACTICE_FOLDER_NAV_ITEM_UNIVERSAL_IDENTIFIER,
});
