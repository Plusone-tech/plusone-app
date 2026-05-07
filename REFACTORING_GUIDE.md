# Code Organization & Refactoring Guide

## Overview

This document outlines the refactoring efforts to improve code maintainability, reusability, and debugging capabilities through component abstraction and proper organization.

## New Directory Structure

```
components/
├── common/                    # Shared components across the app
│   ├── ScreenHeader.tsx      # Reusable header with back button
│   ├── TagsList.tsx          # Tag chips display
│   ├── EntryTypeBadge.tsx    # Event entry type indicator
│   ├── AvailabilitySpots.tsx # Spots remaining with progress bar
│   ├── TicketSelector.tsx    # Ticket quantity selector with price
│   └── EventPreviewCard.tsx  # Event preview card component
│
├── event-details/            # Event details specific components
│   ├── EventHeaderImage.tsx  # Hero image with overlay actions
│   ├── EventInfoCard.tsx     # Date/Time/Location info cards
│   ├── AttendeesList.tsx     # Attendees avatars with count
│   ├── HostCard.tsx          # Host information card
│   └── EventRules.tsx        # Rules list with optional agreement checkbox
│
├── onboarding/               # Onboarding specific components
│   └── OrSeperator.tsx
│
├── BottomNavBar.tsx          # Main navigation bar
├── CButton.tsx               # Custom button with animations
├── CText.tsx                 # Custom text component
└── EventCard.tsx             # Event card for lists

types/
└── index.ts                  # Centralized TypeScript interfaces
```

## Component Abstractions

### 1. Common Components

#### **ScreenHeader**

- **Purpose**: Consistent header across screens
- **Props**: `title`, `showBack`, `rightActions`, `backgroundColor`, `iconColor`
- **Use**: Replaces redundant header code in every screen

```typescript
<ScreenHeader title="Join Event" />
```

#### **TagsList**

- **Purpose**: Display tags/categories
- **Props**: `tags: string[]`
- **Use**: Replaces hardcoded tag mapping logic

```typescript
<TagsList tags={["Coffee", "Networking", "Social"]} />
```

#### **EntryTypeBadge**

- **Purpose**: Show event entry requirements
- **Props**: `type: "open" | "request" | "invite"`
- **Use**: Smart icon and text based on entry type

```typescript
<EntryTypeBadge type="open" />
```

#### **AvailabilitySpots**

- **Purpose**: Show event capacity with progress
- **Props**: `current: number`, `max: number`
- **Use**: Visual capacity indicator

```typescript
<AvailabilitySpots current={12} max={50} />
```

#### **TicketSelector**

- **Purpose**: Ticket quantity selection with pricing
- **Props**: `selected`, `max`, `pricePerTicket`, `onIncrement`, `onDecrement`
- **Use**: Handles ticket logic and displays total

```typescript
<TicketSelector
  selected={tickets}
  max={38}
  pricePerTicket={500}
  onIncrement={() => setTickets(tickets + 1)}
  onDecrement={() => setTickets(tickets - 1)}
/>
```

#### **EventPreviewCard**

- **Purpose**: Compact event preview with host
- **Props**: `title`, `imageUri`, `hostName`, `hostAvatar`
- **Use**: Preview cards in join flow

### 2. Event Details Components

#### **EventHeaderImage**

- **Purpose**: Hero image with overlay controls
- **Props**: `imageUri`, `price`, `onBack`, `onShare`, `onBookmark`, `isBookmarked`
- **Use**: Replaces 100+ lines of header code

```typescript
<EventHeaderImage
  imageUri={event.imageUri}
  price={event.price}
  onBack={() => router.back()}
  onShare={handleShare}
  onBookmark={handleBookmark}
/>
```

#### **EventInfoCard**

- **Purpose**: Info rows with icons
- **Props**: `icon`, `label`, `value`, `subtext`
- **Use**: DRY approach for date/time/location

```typescript
<EventInfoCard icon="calendar-outline" label="Date" value="Nov 15, 2025" />
```

#### **AttendeesList**

- **Purpose**: Display going attendees
- **Props**: `count`, `avatars`, `onSeeAll`
- **Use**: Avatar group with smart rendering

```typescript
<AttendeesList
  count={12}
  avatars={avatarUrls}
  onSeeAll={() => navigate("/attendees")}
/>
```

#### **HostCard**

- **Purpose**: Host information display
- **Props**: `name`, `avatar`, `rating`, `eventsHosted`, `onMessage`
- **Use**: Consistent host UI

```typescript
<HostCard
  name="Priya Sharma"
  avatar={avatarUrl}
  rating={4.8}
  eventsHosted={23}
  onMessage={handleMessage}
/>
```

#### **EventRules**

- **Purpose**: Rules list with optional agreement
- **Props**: `rules`, `showAgreement`, `agreed`, `onAgreeToggle`
- **Use**: Reusable in details and join screens

```typescript
<EventRules
  rules={event.rules}
  showAgreement
  agreed={agreeToRules}
  onAgreeToggle={() => setAgreeToRules(!agreeToRules)}
/>
```

## Type Definitions

### Central Types (`/types/index.ts`)

```typescript
export interface Event {
  id: string;
  title: string;
  imageUri: string;
  description: string;
  date: string;
  time: string;
  category: string;
  attendees: EventAttendees;
  location: EventLocation;
  host: EventHost;
  price: string;
  tags: string[];
  rules: string[];
  entryType: EntryType;
  maxAttendees?: number;
  currentAttendees?: number;
  isTrending?: boolean;
  isBookmarked?: boolean;
}

export type EntryType = "open" | "request" | "invite";
export interface Conversation { ... }
```

## Refactored Screens

### Event Details (`/app/home/event-details.tsx`)

**Before**: 542 lines with hardcoded UI
**After**: ~200 lines with components

**Improvements**:

- Removed 300+ lines of styles
- Components handle their own styling
- Props-based customization
- Type-safe with interfaces
- Easy to debug individual components

```typescript
// Before
<View style={styles.infoRow}>
  <View style={styles.iconCircle}>
    <Ionicons name="calendar-outline" size={20} color="#3D1A66" />
  </View>
  <View style={styles.infoText}>
    <CText style={styles.infoLabel}>Date</CText>
    <CText style={styles.infoValue}>{event.date}</CText>
  </View>
</View>

// After
<EventInfoCard
  icon="calendar-outline"
  label="Date"
  value={event.date}
/>
```

### Join Event (`/app/home/join-event.tsx`)

**Improvements**:

- Used `ScreenHeader` for consistent header
- `EventPreviewCard` for event preview
- `EntryTypeBadge` for entry type display
- `AvailabilitySpots` for capacity
- `TicketSelector` for ticket management
- `EventRules` with agreement checkbox

## Benefits

### 1. **Maintainability**

- Single source of truth for each component
- Changes propagate automatically
- Easier to locate and fix bugs

### 2. **Reusability**

- Components used across multiple screens
- Consistent UI/UX throughout app
- Reduced code duplication

### 3. **Debuggability**

- Isolate issues to specific components
- Test components independently
- Clear component boundaries

### 4. **Type Safety**

- Centralized type definitions
- Props validation at compile time
- IntelliSense support

### 5. **Performance**

- Smaller bundle sizes (no duplicate code)
- Easier to optimize individual components
- Better tree-shaking

## Usage Examples

### Creating a New Event Detail Screen

```typescript
import {
  EventHeaderImage,
  EventInfoCard,
  AttendeesList,
  HostCard,
  EventRules,
} from "@/components/event-details";
import { TagsList } from "@/components/common";
import type { Event } from "@/types";

export default function EventDetails() {
  const event: Event = fetchEvent();

  return (
    <View>
      <EventHeaderImage {...event} />
      <ScrollView>
        <EventInfoCard
          icon="calendar-outline"
          label="Date"
          value={event.date}
        />
        <AttendeesList {...event.attendees} />
        <TagsList tags={event.tags} />
        <HostCard {...event.host} />
        <EventRules rules={event.rules} />
      </ScrollView>
    </View>
  );
}
```

### Adding a New Reusable Component

1. Create component in appropriate directory:

   - `components/common/` for shared components
   - `components/[feature]/` for feature-specific

2. Define TypeScript interface for props
3. Export component from directory
4. Add to this documentation

## Migration Checklist

- [x] Create component structure
- [x] Define TypeScript types
- [x] Refactor EventDetails screen
- [x] Refactor JoinEvent screen (in progress)
- [ ] Refactor Home/Explore screen
- [ ] Refactor Bookmarks screen
- [ ] Refactor Notifications screen
- [ ] Refactor Chat screen
- [ ] Create unit tests for components
- [ ] Document all component APIs

## Best Practices

1. **Keep components focused**: One responsibility per component
2. **Props over context**: Pass data explicitly
3. **Type everything**: Use TypeScript interfaces
4. **Self-contained styles**: Components own their styles
5. **Callbacks for actions**: Parent controls behavior
6. **Optional props**: Use sensible defaults
7. **Document props**: Add JSDoc comments

## Future Improvements

1. **State Management**: Consider Zustand/Redux for global state
2. **API Integration**: Abstract data fetching into hooks
3. **Animation Library**: Standardize animations
4. **Theme System**: Centralize colors and spacing
5. **Component Library**: Publish as internal package
6. **Storybook**: Visual component documentation
7. **Testing**: Add Jest + React Testing Library

## Component API Reference

### EventHeaderImage

```typescript
interface EventHeaderImageProps {
  imageUri: string;
  price: string;
  onBack: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  isBookmarked?: boolean;
}
```

### EventInfoCard

```typescript
interface EventInfoCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  subtext?: string;
}
```

[See individual component files for complete API documentation]

---

**Last Updated**: November 9, 2025
**Status**: In Progress
**Contributors**: Development Team
