import { DocumentSchema, type UIDLDocument } from "uidl-runtime";

export interface ValidationErrorItem {
  path: string;
  message: string;
  code?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrorItem[];
  schemaVersion?: string;
}

export function validateDocument(doc: unknown): ValidationResult {
  if (!doc || typeof doc !== "object") {
    return {
      isValid: false,
      errors: [{ path: "root", message: "Document must be a valid JSON object." }],
    };
  }

  const parseResult = DocumentSchema.safeParse(doc);

  if (!parseResult.success) {
    const errors: ValidationErrorItem[] = parseResult.error.issues.map((issue) => ({
      path: issue.path.join(".") || "document",
      message: issue.message,
      code: issue.code,
    }));

    return {
      isValid: false,
      errors,
    };
  }

  const validDoc = parseResult.data as UIDLDocument;

  return {
    isValid: true,
    errors: [],
    schemaVersion: validDoc.version || "1.0.0",
  };
}
