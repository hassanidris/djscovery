"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { ReviewModal } from "./ReviewModal";

// ── Types ───────────────────────────────────────────────────────────────────

/** Parameters needed to open the review modal for a specific DJ + optional event */
export interface ReviewModalState {
  djProfileId: number;
  djName: string;
  djAvatar?: string | null;
  djSlug?: string;
  eventId?: number | null;
  eventTitle?: string;
  eventSlug?: string;
  eventStartDate?: Date | string;
  eventCity?: string;
  isOrganizer?: boolean;
}

interface ReviewModalContextValue {
  /** Open the review modal with the given DJ/event context */
  openReviewModal: (state: ReviewModalState) => void;
  /** Close the review modal */
  closeReviewModal: () => void;
  /** Whether the modal is currently open */
  isReviewModalOpen: boolean;
}

// ── Context ─────────────────────────────────────────────────────────────────

const ReviewModalContext = createContext<ReviewModalContextValue | null>(null);

// ── Provider ────────────────────────────────────────────────────────────────

/**
 * Provider that mounts the ReviewModal and exposes a context API to open it
 * from anywhere in the component tree.
 *
 * Usage:
 *   <ReviewModalProvider>
 *     <App />
 *   </ReviewModalProvider>
 *
 * Then in any child:
 *   const { openReviewModal } = useReviewModal();
 *   openReviewModal({ djProfileId: 1, djName: "Test DJ" });
 */
export function ReviewModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalState, setModalState] = useState<ReviewModalState | null>(null);

  const openReviewModal = useCallback((state: ReviewModalState) => {
    setModalState(state);
    setIsOpen(true);
  }, []);

  const closeReviewModal = useCallback(() => {
    setIsOpen(false);
    // Clear state after a short delay to allow close animation
    setTimeout(() => setModalState(null), 200);
  }, []);

  return (
    <ReviewModalContext.Provider
      value={{
        openReviewModal,
        closeReviewModal,
        isReviewModalOpen: isOpen,
      }}
    >
      {children}
      {modalState && (
        <ReviewModal
          isOpen={isOpen}
          onClose={closeReviewModal}
          djProfileId={modalState.djProfileId}
          djName={modalState.djName}
          djAvatar={modalState.djAvatar}
          djSlug={modalState.djSlug}
          eventId={modalState.eventId}
          eventTitle={modalState.eventTitle}
          eventSlug={modalState.eventSlug}
          eventStartDate={modalState.eventStartDate}
          eventCity={modalState.eventCity}
          isOrganizer={modalState.isOrganizer}
        />
      )}
    </ReviewModalContext.Provider>
  );
}

// ── Hook ────────────────────────────────────────────────────────────────────

/**
 * Access the review modal context.
 * Must be used within a <ReviewModalProvider>.
 */
export function useReviewModal(): ReviewModalContextValue {
  const ctx = useContext(ReviewModalContext);
  if (!ctx) {
    throw new Error("useReviewModal must be used within a ReviewModalProvider");
  }
  return ctx;
}
