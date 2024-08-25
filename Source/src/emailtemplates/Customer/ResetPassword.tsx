import { Button, Html } from "@react-email/components";
import React from "react";
export default function ResetPasswordEmail(props: {
  token: string;
}): React.ReactElement {
  const { token } = props;
  return (
    <Html>
      <Button
        href="https://example.com"
        style={{ background: "#000", color: "#fff", padding: "12px 20px" }}
      >
        token: {token}
      </Button>
    </Html>
  );
}
