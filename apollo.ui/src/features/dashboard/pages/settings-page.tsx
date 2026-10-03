import * as React from "react"
import { Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import {
  SettingsAnimatedTabList,
  SettingsTabTrigger,
} from "@/features/dashboard/components/settings-animated-tab-list"
import { LoginHistoryGrid } from "@/features/dashboard/components/login-history-grid"
import { SettingsField } from "@/features/dashboard/components/settings-field"
import { SettingsProfileSection } from "@/features/dashboard/components/settings-profile-section"
import { SettingsSaveConfirmDialog } from "@/features/dashboard/components/settings-save-confirm-dialog"
import { SettingsTabPanel } from "@/features/dashboard/components/settings-tab-panel"
import { SettingsUnsavedChangesDialog } from "@/features/dashboard/components/settings-unsaved-changes-dialog"
import {
  createFormStateFromUser,
  type ProfileFormState,
  useSettingsUnsavedChanges,
} from "@/features/dashboard/hooks/use-settings-unsaved-changes"
import { useAuth } from "@/features/auth/context/auth-provider"
import { resolveAuthError } from "@/features/auth/lib/auth-errors"
import { normalizeDigits } from "@/features/auth/lib/normalize-digits"
import { validateEmail } from "@/features/auth/lib/validators"
import {
  removeProfilePicture,
  uploadProfilePicture,
} from "@/lib/api/files-api"
import { ApiError, SESSION_EXPIRED_MESSAGE } from "@/lib/api/client"
import { dashboardToast } from "@/lib/dashboard-toast"
import {
  getUserDisplayName,
  getUserInitials,
  getUserMobile,
} from "@/lib/auth/user-display"

function validateProfileForm(form: ProfileFormState) {
  const errors: Partial<Record<keyof ProfileFormState, string>> = {}

  if (form.email.trim()) {
    const emailError = validateEmail(form.email)
    if (emailError) errors.email = emailError
  }

  const nationalId = normalizeDigits(form.nationalId.trim())
  if (nationalId && !/^\d{10}$/.test(nationalId)) {
    errors.nationalId = "کد ملی باید ۱۰ رقم باشد."
  }

  return errors
}

function formatMobileDisplay(mobile: string) {
  const digits = normalizeDigits(mobile)
  if (digits.length !== 11) return mobile

  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`
}

const settingsActionButtonClass =
  "h-10 rounded-xl border-primary/70 bg-transparent px-5 text-xs font-light text-primary hover:bg-primary/10 hover:text-primary"

export function SettingsPage() {
  const { user, updateProfile, updateUserProfilePicture, logout, isLoading } =
    useAuth()
  const [form, setForm] = React.useState<ProfileFormState | null>(null)
  const [fieldErrors, setFieldErrors] = React.useState<
    Partial<Record<keyof ProfileFormState, string>>
  >({})
  const [selectedPhoto, setSelectedPhoto] = React.useState<File | null>(null)
  const [removePhoto, setRemovePhoto] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("personal")
  const [saveConfirmOpen, setSaveConfirmOpen] = React.useState(false)

  const {
    unsavedDialogOpen,
    handleTabChange,
    handleStay,
    handleLeave,
    markAsSaved,
    discardChanges,
  } = useSettingsUnsavedChanges({
    user,
    form,
    selectedPhoto,
    removePhoto,
    activeTab,
    onTabChange: setActiveTab,
  })

  React.useEffect(() => {
    if (!user) return
    setForm(createFormStateFromUser(user))
  }, [user?.userId])

  if (!user || !form) {
    return null
  }

  const mobile = getUserMobile(user)
  const displayName = getUserDisplayName({
    ...user,
    firstName: form.firstName,
    lastName: form.lastName,
  })
  const initials = getUserInitials({
    ...user,
    firstName: form.firstName,
    lastName: form.lastName,
  })

  function applyDiscardChanges() {
    const baseline = discardChanges()
    if (!baseline) return

    setForm({ ...baseline.form })
    setSelectedPhoto(null)
    setRemovePhoto(false)
    setFieldErrors({})
  }

  function updateField<K extends keyof ProfileFormState>(
    key: K,
    value: ProfileFormState[K]
  ) {
    setForm((current) => (current ? { ...current, [key]: value } : current))
    if (fieldErrors[key]) {
      setFieldErrors((current) => {
        const next = { ...current }
        delete next[key]
        return next
      })
    }
  }

  function requestSave() {
    if (!form) return

    const validationErrors = validateProfileForm(form)
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors)
      const firstError = Object.values(validationErrors)[0]
      if (firstError) {
        dashboardToast.error("لطفاً فیلدها را بررسی کنید", firstError)
      }
      return
    }

    setFieldErrors({})
    setSaveConfirmOpen(true)
  }

  async function confirmSave() {
    if (!form || !user) return

    const currentUser = user

    const validationErrors = validateProfileForm(form)
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors)
      setSaveConfirmOpen(false)
      const firstError = Object.values(validationErrors)[0]
      if (firstError) {
        dashboardToast.error("لطفاً فیلدها را بررسی کنید", firstError)
      }
      return
    }

    setFieldErrors({})
    setIsSaving(true)

    try {
      let nextProfilePictureUrl: string | null | undefined

      if (removePhoto) {
        await removeProfilePicture()
        nextProfilePictureUrl = null
      } else if (selectedPhoto) {
        const uploadResult = await uploadProfilePicture(selectedPhoto)
        nextProfilePictureUrl =
          uploadResult.profilePictureUrl ?? uploadResult.file.accessUrl ?? null
      }

      const savedForm = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        nationalId: normalizeDigits(form.nationalId.trim()),
      }

      await updateProfile({
        firstName: savedForm.firstName,
        lastName: savedForm.lastName,
        email: savedForm.email || null,
        nationalId: savedForm.nationalId || null,
      })

      const resolvedProfilePictureUrl =
        nextProfilePictureUrl !== undefined
          ? nextProfilePictureUrl
          : currentUser.profilePictureUrl

      if (nextProfilePictureUrl !== undefined) {
        updateUserProfilePicture(nextProfilePictureUrl)
      }

      setForm(savedForm)
      setSelectedPhoto(null)
      setRemovePhoto(false)
      markAsSaved(savedForm, resolvedProfilePictureUrl)
      setSaveConfirmOpen(false)
      dashboardToast.success("تنظیمات ذخیره شد")
    } catch (error) {
      const resolved = resolveAuthError(error)
      if (error instanceof ApiError && error.status === 401) {
        logout()
        if (resolved.message === SESSION_EXPIRED_MESSAGE) {
          dashboardToast.error(resolved.message)
        }
      } else {
        dashboardToast.error(resolved.message)
      }
      setFieldErrors(resolved.fieldErrors)
    } finally {
      setIsSaving(false)
    }
  }

  const saving = isLoading || isSaving

  return (
    <>
      <div className="grid w-full min-w-0 gap-8">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="gap-8"
        >
          <SettingsAnimatedTabList activeTab={activeTab}>
            <SettingsTabTrigger value="personal">
              اطلاعات شخصی
            </SettingsTabTrigger>
            <SettingsTabTrigger value="logs">لاگ های سیستم</SettingsTabTrigger>
          </SettingsAnimatedTabList>

          <TabsContent value="personal" className="outline-none">
            <SettingsTabPanel active={activeTab === "personal"}>
              <SettingsProfileSection
                imageUrl={user.profilePictureUrl}
                initials={initials}
                displayName={displayName}
                disabled={saving}
                selectedFile={selectedPhoto}
                markedForRemoval={removePhoto}
                onSelectFile={(file) => {
                  setSelectedPhoto(file)
                  setRemovePhoto(false)
                }}
                onMarkForRemoval={() => {
                  setSelectedPhoto(null)
                  setRemovePhoto(true)
                }}
              />

              <div className="settings-fields-stagger grid gap-5 sm:grid-cols-2">
                <SettingsField
                  id="settings-first-name"
                  label="نام"
                  value={form.firstName}
                  onChange={(event) =>
                    updateField("firstName", event.target.value)
                  }
                  error={fieldErrors.firstName}
                  autoComplete="given-name"
                />

                <SettingsField
                  id="settings-last-name"
                  label="نام خانوادگی"
                  value={form.lastName}
                  onChange={(event) =>
                    updateField("lastName", event.target.value)
                  }
                  error={fieldErrors.lastName}
                  autoComplete="family-name"
                />

                <SettingsField
                  id="settings-email"
                  label="ایمیل"
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  error={fieldErrors.email}
                  dir="ltr"
                  className="text-start"
                  autoComplete="email"
                />

                <SettingsField
                  id="settings-national-id"
                  label="کد ملی"
                  inputMode="numeric"
                  value={form.nationalId}
                  onChange={(event) =>
                    updateField("nationalId", normalizeDigits(event.target.value))
                  }
                  error={fieldErrors.nationalId}
                  dir="ltr"
                  className="text-start tabular-nums"
                />

                <SettingsField
                  id="settings-mobile"
                  label="شماره تماس"
                  value={formatMobileDisplay(mobile)}
                  readOnly
                  mutedWhenLocked={false}
                  dir="ltr"
                  className="text-start tabular-nums"
                  hint="شماره تماس غیر قابل تغییر است."
                />
              </div>

              <div className="flex justify-end border-t border-white/10 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  className={settingsActionButtonClass}
                  disabled={saving}
                  onClick={requestSave}
                >
                  {saving ? (
                    <>
                      <Loader2Icon
                        className="animate-spin"
                        data-icon="inline-start"
                      />
                      در حال ذخیره...
                    </>
                  ) : (
                    "ذخیره تغییرات"
                  )}
                </Button>
              </div>
            </SettingsTabPanel>
          </TabsContent>

          <TabsContent value="logs" className="outline-none">
            <SettingsTabPanel active={activeTab === "logs"}>
              <LoginHistoryGrid />
            </SettingsTabPanel>
          </TabsContent>
        </Tabs>
      </div>

      <SettingsSaveConfirmDialog
        open={saveConfirmOpen}
        saving={isSaving}
        onCancel={() => setSaveConfirmOpen(false)}
        onConfirm={() => void confirmSave()}
      />

      <SettingsUnsavedChangesDialog
        open={unsavedDialogOpen}
        onStay={handleStay}
        onLeave={() => handleLeave(applyDiscardChanges)}
      />
    </>
  )
}
