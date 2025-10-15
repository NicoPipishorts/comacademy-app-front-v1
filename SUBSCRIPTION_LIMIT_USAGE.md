# Subscription Limit Feature - Usage Guide

## Overview
The subscription limit feature restricts content access for free users while allowing premium users full access. This implementation includes:
- A reusable hook (`useSubscriptionLimit`)
- A reusable modal component (`UpgradeSubscriptionModal`)
- Visual feedback for locked items

## How to Use in Other Components

### 1. Import the required dependencies

```tsx
import { useSubscriptionLimit } from "@/hooks/useSubscriptionLimit";
import UpgradeSubscriptionModal from "@/components/modal/UpgradeSubscriptionModal";
```

### 2. Initialize the hook with your desired limit

```tsx
const {
  isItemLocked,
  showUpgradeModal,
  handleLockedItemPress,
  closeUpgradeModal,
} = useSubscriptionLimit({ freeLimit: 10 }); // Adjust freeLimit as needed
```

### 3. Check if an item is locked and handle clicks

```tsx
const handleItemPress = (itemId: number, index: number) => {
  if (isItemLocked(index)) {
    handleLockedItemPress();
    return;
  }
  // Your normal navigation/action logic
  navigation.navigate("details", { id: itemId });
};
```

### 4. Apply visual styling to locked items

```tsx
<TouchableOpacity onPress={() => handleItemPress(item.id, index)}>
  <Text style={[styles.item, isItemLocked(index) && styles.lockedItem]}>
    {item.name}
  </Text>
</TouchableOpacity>

// In your StyleSheet
const styles = StyleSheet.create({
  item: {
    // your normal styles
  },
  lockedItem: {
    opacity: 0.4, // or any visual indicator
  },
});
```

### 5. Add the modal component to your JSX

```tsx
<UpgradeSubscriptionModal
  visible={showUpgradeModal}
  onClose={closeUpgradeModal}
  message="Custom message for your specific feature"
/>
```

## Example Implementation

See [app/(tabs)/dico/list.tsx](app/(tabs)/dico/list.tsx) for a complete working example.

## Customization

### Different limits per component
Simply pass different `freeLimit` values:
```tsx
useSubscriptionLimit({ freeLimit: 5 })  // For one component
useSubscriptionLimit({ freeLimit: 20 }) // For another component
```

### Custom modal messages
Pass a custom message to the modal:
```tsx
<UpgradeSubscriptionModal
  visible={showUpgradeModal}
  onClose={closeUpgradeModal}
  message="Your custom message here"
/>
```

### Custom upgrade action
Modify the `handleUpgradePress` function in `UpgradeSubscriptionModal.tsx` to navigate to your subscription page.

## Files Created/Modified

### New Files:
- `hooks/useSubscriptionLimit.ts` - Reusable hook for subscription limits
- `components/modal/UpgradeSubscriptionModal.tsx` - Reusable upgrade modal

### Modified Files:
- `app/(tabs)/dico/list.tsx` - Example implementation in dico list
