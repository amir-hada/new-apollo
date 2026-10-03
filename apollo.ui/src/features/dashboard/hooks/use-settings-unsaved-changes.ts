import * as React from "react"
import { useBlocker } from "react-router-dom"

import { normalizeDigits } from "@/features/auth/lib/normalize-digits"
import type { UserProfile } from "@/lib/api/auth-types"

export type ProfileFormState = {
  firstName: string
  lastName: string
  email: string
  nationalId: string
}

type SavedBaseline = {
  form: ProfileFormState
  profilePictureUrl: string | null
}

type UseSettingsUnsavedChangesOptions = {
  user: UserProfile | null
  form: ProfileFormState | null
  selectedPhoto: File | null
  removePhoto: boolean
  activeTab: string
  onTabChange: (tab: string) => void
}

export function createFormStateFromUser(user: UserProfile): ProfileFormState {
  return {
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    email: user.email ?? "",
    nationalId: user.nationalId ?? "",
  }
}

function normalizeFormState(form: ProfileFormState): ProfileFormState {
  return {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    email: form.email.trim(),
    nationalId: normalizeDigits(form.nationalId.trim()),
  }
}

function isFormDirty(form: ProfileFormState, baseline: ProfileFormState) {
  const current = normalizeFormState(form)
  const saved = normalizeFormState(baseline)

  return (
    current.firstName !== saved.firstName ||
    current.lastName !== saved.lastName ||
    current.email !== saved.email ||
    current.nationalId !== saved.nationalId
  )
}

export function useSettingsUnsavedChanges({
  user,
  form,
  selectedPhoto,
  removePhoto,
  activeTab,
  onTabChange,
}: UseSettingsUnsavedChangesOptions) {
  const [savedBaseline, setSavedBaseline] = React.useState<SavedBaseline | null>(
    null
  )
  const [unsavedDialogOpen, setUnsavedDialogOpen] = React.useState(false)
  const [pendingTab, setPendingTab] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!user) {
      setSavedBaseline(null)
      return
    }

    const nextForm = createFormStateFromUser(user)
    setSavedBaseline({
      form: nextForm,
      profilePictureUrl: user.profilePictureUrl,
    })
  }, [user?.userId])

  const hasUnsavedChanges = React.useMemo(() => {
    if (!form || !savedBaseline) return false

    if (selectedPhoto) return true

    if (removePhoto && savedBaseline.profilePictureUrl) return true

    return isFormDirty(form, savedBaseline.form)
  }, [form, removePhoto, savedBaseline, selectedPhoto])

  const blocker = useBlocker(hasUnsavedChanges)

  React.useEffect(() => {
    if (blocker.state === "blocked") {
      setUnsavedDialogOpen(true)
    }
  }, [blocker.state])

  React.useEffect(() => {
    if (!hasUnsavedChanges) return

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault()
      event.returnValue = ""
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [hasUnsavedChanges])

  const markAsSaved = React.useCallback(
    (nextForm: ProfileFormState, nextProfilePictureUrl: string | null) => {
      setSavedBaseline({
        form: normalizeFormState(nextForm),
        profilePictureUrl: nextProfilePictureUrl,
      })
    },
    []
  )

  const discardChanges = React.useCallback(() => {
    if (!savedBaseline) return null

    return {
      form: { ...savedBaseline.form },
    }
  }, [savedBaseline])

  function handleTabChange(nextTab: string) {
    if (nextTab === activeTab) return

    if (hasUnsavedChanges) {
      setPendingTab(nextTab)
      setUnsavedDialogOpen(true)
      return
    }

    onTabChange(nextTab)
  }

  function handleStay() {
    setUnsavedDialogOpen(false)
    setPendingTab(null)

    if (blocker.state === "blocked") {
      blocker.reset()
    }
  }

  function handleLeave(onDiscard: () => void) {
    setUnsavedDialogOpen(false)
    onDiscard()

    if (pendingTab) {
      onTabChange(pendingTab)
      setPendingTab(null)
    }

    if (blocker.state === "blocked") {
      blocker.proceed()
    }
  }

  return {
    hasUnsavedChanges,
    unsavedDialogOpen,
    handleTabChange,
    handleStay,
    handleLeave,
    markAsSaved,
    discardChanges,
  }
}
