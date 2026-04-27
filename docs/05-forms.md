# Forms — TanStack Form + Zod + shadcn/ui

## Overview

Forms use TanStack Form for state management, Zod for validation, and shadcn/ui Field components for UI.

## Setup Pattern

### 1. Define Zod Schema

```ts
import * as z from "zod"

const formSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters.")
    .max(32, "Title must be at most 32 characters."),
  email: z.string().email("Enter a valid email address."),
})
```

### 2. Initialize Form Hook

```tsx
import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"

const form = useForm({
  defaultValues: {
    title: "",
    email: "",
  },
  validators: {
    onSubmit: formSchema,
  },
  onSubmit: async ({ value }) => {
    toast.success("Form submitted")
  },
})
```

### 3. Wrap with Form Element

```tsx
<form
  onSubmit={(e) => {
    e.preventDefault()
    form.handleSubmit()
  }}
>
  {/* Fields */}
</form>
```

## Field Pattern

Every field follows this structure using shadcn/ui `Field` components:

```tsx
<form.Field
  name="title"
  children={(field) => {
    const isInvalid =
      field.state.meta.isTouched && !field.state.meta.isValid
    return (
      <Field data-invalid={isInvalid}>
        <FieldLabel htmlFor={field.name}>Title</FieldLabel>
        <Input
          id={field.name}
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
        />
        {isInvalid && <FieldError errors={field.state.meta.errors} />}
      </Field>
    )
  }}
/>
```

**Key attributes:**
- `data-invalid={isInvalid}` on `<Field>` wrapper — triggers error styling
- `aria-invalid={isInvalid}` on input — accessibility
- `field.handleBlur` + `field.handleChange` — form state updates

## Validation Modes

| Mode       | Trigger              | Use Case                    |
| ---------- | -------------------- | --------------------------- |
| `onSubmit` | Form submission      | Default, least intrusive    |
| `onBlur`   | Field loses focus    | Validate after user is done |
| `onChange` | Every keystroke      | Real-time feedback          |

Configure multiple modes:

```ts
const form = useForm({
  defaultValues: { /* ... */ },
  validators: {
    onSubmit: formSchema,
    onBlur: formSchema,    // optional
    onChange: formSchema,   // optional
  },
})
```

## Component Examples

### Text Input

```tsx
<Input
  id={field.name}
  name={field.name}
  value={field.state.value}
  onBlur={field.handleBlur}
  onChange={(e) => field.handleChange(e.target.value)}
  aria-invalid={isInvalid}
/>
```

### Textarea

```tsx
<InputGroupTextarea
  id={field.name}
  name={field.name}
  value={field.state.value}
  onBlur={field.handleBlur}
  onChange={(e) => field.handleChange(e.target.value)}
  aria-invalid={isInvalid}
  rows={6}
  className="min-h-24 resize-none"
/>
```

### Select

```tsx
<Select
  name={field.name}
  value={field.state.value}
  onValueChange={field.handleChange}
>
  <SelectTrigger id={field.name} aria-invalid={isInvalid}>
    <SelectValue placeholder="Select" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
  </SelectContent>
</Select>
```

### Checkbox (Single)

```tsx
<Checkbox
  id={field.name}
  name={field.name}
  checked={field.state.value}
  onCheckedChange={field.handleChange}
  aria-invalid={isInvalid}
/>
```

### Checkbox Array

Use `mode="array"` for multiple checkboxes:

```tsx
<form.Field
  name="tasks"
  mode="array"
  children={(field) => {
    const isInvalid =
      field.state.meta.isTouched && !field.state.meta.isValid
    return (
      <FieldSet>
        <FieldLegend variant="label">Tasks</FieldLegend>
        <FieldGroup data-slot="checkbox-group">
          {tasks.map((task) => (
            <Field key={task.id} orientation="horizontal" data-invalid={isInvalid}>
              <Checkbox
                id={`checkbox-${task.id}`}
                name={field.name}
                checked={field.state.value.includes(task.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    field.pushValue(task.id)
                  } else {
                    const index = field.state.value.indexOf(task.id)
                    if (index > -1) field.removeValue(index)
                  }
                }}
                aria-invalid={isInvalid}
              />
              <FieldLabel htmlFor={`checkbox-${task.id}`} className="font-normal">
                {task.label}
              </FieldLabel>
            </Field>
          ))}
        </FieldGroup>
        {isInvalid && <FieldError errors={field.state.meta.errors} />}
      </FieldSet>
    )
  }}
/>
```

### Radio Group

```tsx
<form.Field
  name="plan"
  children={(field) => {
    const isInvalid =
      field.state.meta.isTouched && !field.state.meta.isValid
    return (
      <FieldSet>
        <FieldLegend>Plan</FieldLegend>
        <RadioGroup
          name={field.name}
          value={field.state.value}
          onValueChange={field.handleChange}
        >
          {plans.map((plan) => (
            <FieldLabel key={plan.id} htmlFor={`radio-${plan.id}`}>
              <Field orientation="horizontal" data-invalid={isInvalid}>
                <FieldContent>
                  <FieldTitle>{plan.title}</FieldTitle>
                  <FieldDescription>{plan.description}</FieldDescription>
                </FieldContent>
                <RadioGroupItem
                  value={plan.id}
                  id={`radio-${plan.id}`}
                  aria-invalid={isInvalid}
                />
              </Field>
            </FieldLabel>
          ))}
        </RadioGroup>
        {isInvalid && <FieldError errors={field.state.meta.errors} />}
      </FieldSet>
    )
  }}
/>
```

### Switch

```tsx
<form.Field
  name="twoFactor"
  children={(field) => {
    const isInvalid =
      field.state.meta.isTouched && !field.state.meta.isValid
    return (
      <Field orientation="horizontal" data-invalid={isInvalid}>
        <FieldContent>
          <FieldLabel htmlFor="switch-mfa">MFA</FieldLabel>
          <FieldDescription>Enable MFA to secure your account.</FieldDescription>
        </FieldContent>
        <Switch
          id="switch-mfa"
          name={field.name}
          checked={field.state.value}
          onCheckedChange={field.handleChange}
          aria-invalid={isInvalid}
        />
      </Field>
    )
  }}
/>
```

## Array Fields (Dynamic)

For lists of fields that can be added/removed:

### Schema

```ts
const formSchema = z.object({
  emails: z
    .array(
      z.object({
        address: z.string().email("Enter a valid email address."),
      })
    )
    .min(1, "Add at least one email.")
    .max(5, "Max 5 email addresses."),
})
```

### Field

```tsx
<form.Field
  name="emails"
  mode="array"
  children={(field) => (
    <FieldSet>
      <FieldLegend variant="label">Email Addresses</FieldLegend>
      <FieldGroup>
        {field.state.value.map((_, index) => (
          <form.Field
            key={index}
            name={`emails[${index}].address`}
            children={(subField) => {
              const isInvalid =
                subField.state.meta.isTouched && !subField.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <Input
                    id={`email-${index}`}
                    name={subField.name}
                    value={subField.state.value}
                    onBlur={subField.handleBlur}
                    onChange={(e) => subField.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="name@example.com"
                    type="email"
                  />
                  {isInvalid && <FieldError errors={subField.state.meta.errors} />}
                </Field>
              )
            }}
          />
        ))}
      </FieldGroup>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => field.pushValue({ address: "" })}
        disabled={field.state.value.length >= 5}
      >
        Add Email
      </Button>
    </FieldSet>
  )}
/>
```

## Form Actions

```tsx
{/* Reset */}
<Button type="button" variant="outline" onClick={() => form.reset()}>
  Reset
</Button>

{/* Submit */}
<Button type="submit" form="form-id">
  Submit
</Button>
```

## Full Example

```tsx
"use client"

import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card"
import {
  Field, FieldDescription, FieldError, FieldGroup, FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group"

const formSchema = z.object({
  title: z.string().min(5, "Min 5 characters.").max(32, "Max 32 characters."),
  description: z.string().min(20, "Min 20 characters.").max(100, "Max 100 characters."),
})

export function BugReportForm() {
  const form = useForm({
    defaultValues: { title: "", description: "" },
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      toast("Submitted", { description: JSON.stringify(value, null, 2) })
    },
  })

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Bug Report</CardTitle>
        <CardDescription>Report bugs you encounter.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="bug-report-form"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field
              name="title"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Bug Title</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Login button not working"
                      autoComplete="off"
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                )
              }}
            />
            <form.Field
              name="description"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                    <InputGroup>
                      <InputGroupTextarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Describe the issue..."
                        rows={6}
                        className="min-h-24 resize-none"
                        aria-invalid={isInvalid}
                      />
                      <InputGroupAddon align="block-end">
                        <InputGroupText className="tabular-nums">
                          {field.state.value.length}/100
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    <FieldDescription>
                      Include steps to reproduce and expected behavior.
                    </FieldDescription>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                )
              }}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" form="bug-report-form">
            Submit
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}
```
