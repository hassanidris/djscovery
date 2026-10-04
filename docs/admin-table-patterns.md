# Admin Table Component Patterns

This document documents reusable patterns from existing admin table components for use in Phase 3 (Founding Members admin UI).

## Core Components

### 1. AdminActionButton
**Location**: `src/components/admin/AdminActionButton.tsx`

A reusable action button component that handles server actions with optional confirmation dialogs.

**Props**:
- `label`: Button text
- `description`: Confirmation dialog description
- `confirmLabel`: Dialog confirm button text (default: "Confirm")
- `fields`: Record<string, string> - form data to send to server action
- `action`: Server action function
- `successMessage`: Toast message on success
- `variant`: Button variant (default: "ghost")
- `className`: Additional CSS classes
- `requireConfirm`: Skip dialog if false (default: true)
- `children`: Optional custom button content

**Usage Pattern**:
```tsx
<AdminActionButton
  label="Approve"
  description={`Approve ${dj.stageName}'s profile?`}
  confirmLabel="Approve"
  fields={{ djProfileId: String(dj.id) }}
  action={approveDjProfile}
  successMessage="DJ profile approved"
  variant="outline"
  className="border-green-500/30 text-green-400 hover:bg-green-500/10"
/>
```

**Key Features**:
- Automatic toast notifications (success/error)
- Loading state with ellipsis
- Optional confirmation dialog via AlertDialog
- FormData construction from fields object
- Client component with useTransition

### 2. AdminFilters
**Location**: `src/components/admin/AdminFilters.tsx`

Reusable filter bar with dropdowns, search, date ranges, and rating ranges.

**Props**:
- `filters`: Array of FilterConfig with key, placeholder, options
- `currentValues`: Record<string, string> of current filter values
- `searchKey`: Optional search parameter key
- `searchPlaceholder`: Search input placeholder (default: "Search...")
- `currentSearch`: Current search value
- `dateRange`: Optional { startDateKey, endDateKey }
- `ratingRange`: Optional { minKey, maxKey }

**Usage Pattern**:
```tsx
<AdminFilters
  currentValues={{ status: status ?? "" }}
  filters={[
    {
      key: "status",
      placeholder: "All Statuses",
      options: [
        { value: "PENDING_APPROVAL", label: "Pending" },
        { value: "APPROVED", label: "Approved" },
      ],
    },
  ]}
/>
```

**Key Features**:
- Debounced search input (400ms)
- URL parameter management
- "Clear all" button when filters active
- Date range picker support
- Rating range input support
- Cursor reset on filter change

### 3. AdminPagination
**Location**: `src/components/admin/AdminPagination.tsx`

Cursor-based pagination component.

**Props**:
- `nextCursor`: string | null - cursor for next page
- `hasPrev`: boolean - whether previous page exists

**Usage Pattern**:
```tsx
<AdminPagination
  nextCursor={nextCursor ? String(nextCursor) : null}
  hasPrev={!!cursor}
/>
```

**Key Features**:
- Cursor-based pagination (not page numbers)
- Preserves existing URL params
- Disabled state for unavailable directions

### 4. AdminEmptyState
**Location**: `src/components/admin/AdminEmptyState.tsx`

Empty state component for when no results exist.

**Props**:
- `title`: Main message
- `description`: Optional subtext
- `className`: Optional CSS classes

**Usage Pattern**:
```tsx
<AdminEmptyState
  title="No DJ profiles found"
  description="Try adjusting your filters."
/>
```

### 5. AdminTableSkeleton
**Location**: `src/components/admin/AdminTableSkeleton.tsx`

Loading skeleton for table rows.

**Props**:
- `cols`: Number of columns
- `rows`: Number of rows

**Usage Pattern**:
```tsx
<Suspense fallback={<AdminTableSkeleton cols={7} rows={8} />}>
  {/* table content */}
</Suspense>
```

## Page Structure Pattern

All admin table pages follow this consistent structure:

```tsx
export default async function AdminXPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const cursor = params.cursor ? Number(params.cursor) : undefined;
  const filter1 = params.filter1;
  const filter2 = params.filter2;

  const { items, nextCursor } = await getAdminItems({ cursor, filter1, filter2 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Title</h1>
        <p className="text-muted-foreground mt-1 text-sm">Description</p>
      </div>

      {/* Filters */}
      <AdminFilters
        currentValues={{ filter1: filter1 ?? "" }}
        filters={[...]}
      />

      {/* Table with Suspense */}
      <Suspense fallback={<AdminTableSkeleton cols={7} rows={8} />}>
        {items.length === 0 ? (
          <AdminEmptyState title="No items found" />
        ) : (
          <>
            <div className="overflow-hidden rounded-xl border border-white/8">
              <div className="overflow-x-auto">
                <table className="w-full min-w-160 text-sm">
                  <thead>
                    <tr className="border-b border-white/8 bg-white/2">
                      <th className="px-4 py-3 text-left font-medium text-gray-400">
                        Column 1
                      </th>
                      {/* more columns */}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {items.map((item) => (
                      <tr key={item.id} className="transition-colors hover:bg-white/2">
                        {/* row cells */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <AdminActionButton {...} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <AdminPagination nextCursor={...} hasPrev={!!cursor} />
          </>
        )}
      </Suspense>
    </div>
  );
}
```

## Server Action Pattern

All admin server actions follow this pattern:

```tsx
"use server";

import prisma from "@/lib/client";
import { requireAdmin } from "@/lib/auth/require-admin";
import { ActionSchema } from "@/lib/validation/admin";
import { revalidatePath } from "next/cache";

type ActionResult = { success: true } | { error: string };

export async function adminAction(formData: FormData): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();

  const parsed = ActionSchema.safeParse({
    itemId: formData.get("itemId"),
    reason: formData.get("reason") ?? undefined,
  });
  if (!parsed.success)
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const { itemId, reason } = parsed.data;

  try {
    await prisma.$transaction([
      prisma.item.update({ where: { id: itemId }, data: { ... } }),
      prisma.adminActionLog.create({
        data: {
          adminId,
          action: "ACTION_NAME",
          targetType: "ItemType",
          targetId: String(itemId),
          metadata: reason ? { reason } : undefined,
        },
      }),
    ]);

    revalidatePath("/admin/items");
    return { success: true };
  } catch {
    return { error: "Failed to perform action" };
  }
}
```

**Key Features**:
- `requireAdmin()` for auth check
- Zod schema validation
- Prisma transaction for atomicity
- Admin action log for audit trail
- Path revalidation for cache invalidation
- Consistent error handling

## Data Fetching Pattern

All admin data fetchers follow this pattern:

```tsx
export async function getAdminItems({
  cursor,
  take = 20,
  filter1,
  filter2,
}: {
  cursor?: number;
  take?: number;
  filter1?: string;
  filter2?: string;
}): Promise<{ items: ItemType[]; nextCursor: number | null }> {
  await requireAdmin();

  const items = await prisma.item.findMany({
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    where: {
      deletedAt: null,
      ...(filter1 ? { field1: filter1 } : {}),
      ...(filter2 ? { field2: filter2 } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      // other fields
    },
  });

  const hasNextPage = items.length > take;
  if (hasNextPage) items.pop();

  return {
    items,
    nextCursor: hasNextPage ? (items[items.length - 1]?.id ?? null) : null,
  };
}
```

**Key Features**:
- Cursor-based pagination
- Default take = 20
- take + 1 to check for next page
- DeletedAt filtering
- Admin auth check
- Consistent return type

## Status Badge Pattern

Status badges use a color mapping object:

```tsx
const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "border-green-500/30 bg-green-500/10 text-green-400",
  SUSPENDED: "border-red-500/30 bg-red-500/10 text-red-400",
  PENDING: "border-amber-500/30 bg-amber-500/10 text-amber-400",
};

<Badge className={`border text-xs ${STATUS_COLORS[item.status] ?? ""}`}>
  {item.status}
</Badge>
```

## Date Formatting Pattern

Relative dates for timestamps:

```tsx
import { formatDistanceToNow } from "date-fns";

{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
```

Absolute dates for events:

```tsx
import { format } from "date-fns";

{format(new Date(item.eventDate), "dd MMM yyyy")}
```

## Icon Usage Pattern

Icons from lucide-react for visual indicators:

```tsx
import { EyeOff, Star, Crown } from "lucide-react";

{item.featured && (
  <Crown className="h-3.5 w-3.5 shrink-0 text-amber-400" />
)}
{item.hidden && (
  <EyeOff className="h-3.5 w-3.5 shrink-0 text-gray-400" />
)}
```

## Founding Members Application

For Phase 3 (Founding Members admin UI), apply these patterns:

1. **Page**: `src/app/admin/founding-members/page.tsx`
2. **Server Actions**: `src/lib/actions/admin/founding-members.ts`
3. **Validation**: `src/lib/validation/founding-members.ts` (new)
4. **Data Fetcher**: `getAdminFoundingMembers()` in actions file

**Expected columns**:
- DJ (name, slug, avatar)
- Application Date
- Status (PENDING, APPROVED, REJECTED)
- Application Type (SELF_NOMINATED, ADMIN_INVITED)
- Actions (Approve, Reject, View Details)

**Expected filters**:
- Status (All, Pending, Approved, Rejected)
- Application Type (All, Self-Nominated, Admin Invited)

**Expected actions**:
- Approve application
- Reject application (with reason)
- View application details
