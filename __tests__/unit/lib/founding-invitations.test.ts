import { beforeEach, describe, expect, it, vi } from "vitest";

const { invitationTokenFindFirst, transaction } = vi.hoisted(() => ({
  invitationTokenFindFirst: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/client", () => ({
  default: {
    invitationToken: { findFirst: invitationTokenFindFirst },
    $transaction: transaction,
  },
}));

import {
  acceptFoundingInvitation,
  getValidFoundingInvitation,
  hashFoundingInvitationToken,
} from "@/lib/founding/invitations";

const token = "a".repeat(64);
const applicationId = 42;
const validInvitation = {
  id: 7,
  email: "dj@example.com",
  expiresAt: new Date(Date.now() + 60_000),
  foundingApplication: { id: applicationId, name: "DJ", stageName: "DJ One" },
};

describe("founding invitation token helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("hashes the raw token with SHA-256", () => {
    expect(hashFoundingInvitationToken(token)).toMatch(/^[a-f0-9]{64}$/);
    expect(hashFoundingInvitationToken(token)).toBe(
      hashFoundingInvitationToken(token),
    );
  });

  it("does not query storage for malformed token strings", async () => {
    await expect(getValidFoundingInvitation("invalid")).resolves.toBeNull();
    expect(invitationTokenFindFirst).not.toHaveBeenCalled();
  });

  it("rejects an email mismatch without consuming the invitation", async () => {
    invitationTokenFindFirst.mockResolvedValue(validInvitation);

    await expect(
      acceptFoundingInvitation(token, "user-1", "other@example.com"),
    ).resolves.toEqual({ success: false, reason: "email_mismatch" });
    expect(transaction).not.toHaveBeenCalled();
  });

  it("atomically accepts and links a matching invitation", async () => {
    invitationTokenFindFirst.mockResolvedValue(validInvitation);
    const invitationUpdateMany = vi.fn().mockResolvedValue({ count: 1 });
    const applicationUpdateMany = vi.fn().mockResolvedValue({ count: 1 });
    const tx = {
      invitationToken: { updateMany: invitationUpdateMany },
      foundingApplication: { updateMany: applicationUpdateMany },
      userRole: { upsert: vi.fn().mockResolvedValue({}) },
    };
    transaction.mockImplementation(async (callback) => callback(tx));

    await expect(
      acceptFoundingInvitation(token, "user-1", "DJ@Example.com"),
    ).resolves.toEqual({ success: true, applicationId });
    expect(invitationUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: validInvitation.id,
          status: "PENDING",
          tokenHash: hashFoundingInvitationToken(token),
        }),
        data: expect.objectContaining({ status: "ACCEPTED" }),
      }),
    );
    expect(applicationUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: applicationId,
          OR: [{ userId: null }, { userId: "user-1" }],
        }),
        data: { userId: "user-1" },
      }),
    );
  });

  it("rejects concurrent or replayed token consumption", async () => {
    invitationTokenFindFirst.mockResolvedValue(validInvitation);
    const tx = {
      invitationToken: { updateMany: vi.fn().mockResolvedValue({ count: 0 }) },
      foundingApplication: { updateMany: vi.fn() },
      userRole: { upsert: vi.fn() },
    };
    transaction.mockImplementation(async (callback) => callback(tx));

    await expect(
      acceptFoundingInvitation(token, "user-1", "dj@example.com"),
    ).resolves.toEqual({ success: false, reason: "invalid" });
    expect(tx.foundingApplication.updateMany).not.toHaveBeenCalled();
  });
});
