export type PlatformSmsSettings = {
  isEnabled: boolean
  hasApiKey: boolean
  apiKeyMasked: string | null
  lineNumber: number | null
  otpTemplateId: number
  otpParameterName: string
  orderTemplateId: number
  orderParameterName: string
  orderMessageTemplate: string
}

export type UpdatePlatformSmsSettingsRequest = {
  isEnabled: boolean
  apiKey?: string | null
  lineNumber?: number | null
  otpTemplateId: number
  otpParameterName: string
  orderTemplateId: number
  orderParameterName: string
  orderMessageTemplate: string
}
