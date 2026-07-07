# Fan Profile — Product Specification

**Status:** ✅ Implemented (Complete)
**Created:** June 2026
**Last Updated:** July 7, 2026

---

## Implementation Status

The Fan Profile feature has been fully implemented and is live in production. This document serves as historical reference for the design decisions made during implementation.

---

## Overview

Fan profiles enable users to follow DJs, save events, and engage with the DJ community without requiring a DJ or Organizer profile.

---

## Implemented Features

### Fan Onboarding

- `/become-fan` route with multi-step form
- Country and city selection with dynamic city loading
- Profile creation with avatar upload
- Bio and location information

### Fan Profile Management

- Profile editing via `/account/settings`
- Avatar upload and management
- Location updates (country/city)

### Fan Features

- Follow DJs functionality (via `DjFollow` model)
- Save events functionality (via `SavedEvent` model)
- View followed DJs in `/organizer/followed-djs` (for users with Organizer role)
- View saved events in `/organizer/saved-events` (for users with Organizer role)

### Database Schema

- `FanProfile` model with:
  - User relation
  - Country and city relations
  - Avatar and avatarPath for Supabase Storage
  - Bio field
  - Soft delete support (deletedAt)

### Integration Points

- Auth flow redirects to `/become-fan` for new users
- Account settings includes fan profile management
- Follow system integrated with DJ profiles
- Event saving integrated with events system

---

## Technical Notes

- Fan profiles use the same Supabase Storage bucket (`djscovery-media`) as DJ profiles
- City selection uses the same `getCitiesByCountry` action as other forms
- Follow limits: FOLLOWS_LIMIT = 200 for DJs, SAVES_LIMIT = 50 for events
- Fan profiles are optional - users can exist without a fan profile
