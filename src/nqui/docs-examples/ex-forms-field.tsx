import { useState } from "react";
import {
  Button,
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@nqlib/nqui";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { ExampleFrame, ExampleHint } from "./shared";

/** FieldGroup spacing, InputGroup addon, and invalid styling. */
export default function ExFormsField() {
  const [email, setEmail] = useState("not-an-email");
  const invalid = !email.includes("@");

  return (
    <ExampleFrame>
      <ExampleHint>
        Use FieldGroup / Field for rhythm. Mark invalid on both the Field and the
        control.
      </ExampleHint>
      <FieldGroup className="max-w-md">
        <Field>
          <FieldLabel htmlFor="docs-search">Search</FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
            </InputGroupAddon>
            <InputGroupInput id="docs-search" placeholder="Search projects…" />
          </InputGroup>
        </Field>
        <Field data-invalid={invalid || undefined}>
          <FieldLabel htmlFor="docs-email">Email</FieldLabel>
          <Input
            id="docs-email"
            type="email"
            value={email}
            aria-invalid={invalid || undefined}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FieldDescription>
            {invalid ? "Enter a valid email address." : "Use your work email."}
          </FieldDescription>
        </Field>
        <Button size="sm" className="w-fit" disabled={invalid}>
          Continue
        </Button>
      </FieldGroup>
    </ExampleFrame>
  );
}
