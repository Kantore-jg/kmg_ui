import { inject, provide, computed } from 'vue'
import { useFieldError, useIsFieldDirty, useIsFieldTouched, useIsFieldValid } from 'vee-validate'

const FORM_ITEM_INJECTION_KEY = Symbol('FORM_ITEM_INJECTION_KEY')
const FORM_FIELD_INJECTION_KEY = Symbol('FORM_FIELD_INJECTION_KEY')

export function useFormField() {
  const fieldContext = inject(FORM_FIELD_INJECTION_KEY, null)
  const itemContext = inject(FORM_ITEM_INJECTION_KEY, null)

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>')
  }

  const { name } = fieldContext
  const id = itemContext

  const fieldState = {
    valid: useIsFieldValid(name),
    isDirty: useIsFieldDirty(name),
    isTouched: useIsFieldTouched(name),
    error: useFieldError(name),
  }

  return {
    id,
    name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

export { FORM_ITEM_INJECTION_KEY, FORM_FIELD_INJECTION_KEY }
