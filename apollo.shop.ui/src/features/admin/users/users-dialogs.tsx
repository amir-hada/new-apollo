"use client";

import type { CreateUserPayload } from "./users-action-dialog";
import { UsersActionDialog } from "./users-action-dialog";
import { UsersDeleteDialog } from "./users-delete-dialog";
import { UsersInviteDialog } from "./users-invite-dialog";
import { useUsers } from "./users-provider";
import type { User } from "./types";

type UsersDialogsProps = {
  onCreated?: (payload: CreateUserPayload) => Promise<void> | void;
  onDeactivated?: (user: User) => Promise<void> | void;
  creating?: boolean;
  deactivating?: boolean;
};

export function UsersDialogs({
  onCreated,
  onDeactivated,
  creating = false,
  deactivating = false,
}: UsersDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useUsers();

  return (
    <>
      <UsersActionDialog
        key="user-add"
        open={open === "add"}
        onOpenChange={(state) => {
          if (!state) setOpen(null);
        }}
        onSubmit={onCreated}
        submitting={creating}
      />

      <UsersInviteDialog
        key="user-invite"
        open={open === "invite"}
        onOpenChange={(state) => {
          if (!state) setOpen(null);
        }}
      />

      {currentRow && (
        <>
          <UsersActionDialog
            key={`user-edit-${currentRow.id}`}
            open={open === "edit"}
            onOpenChange={(state) => {
              if (!state) {
                setOpen(null);
                setTimeout(() => setCurrentRow(null), 300);
              }
            }}
            currentRow={currentRow}
          />

          <UsersDeleteDialog
            key={`user-delete-${currentRow.id}`}
            open={open === "delete"}
            onOpenChange={(state) => {
              if (!state) {
                setOpen(null);
                setTimeout(() => setCurrentRow(null), 300);
              }
            }}
            currentRow={currentRow}
            onConfirm={onDeactivated}
            submitting={deactivating}
          />
        </>
      )}
    </>
  );
}
