"use server";

import prisma from "@/lib/client";
import { requireAdmin } from "@/lib/auth/require-admin";

export interface ResponseTemplate {
  id: string;
  name: string;
  category: "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "PROFESSIONAL" | "FRIENDLY";
  content: string;
  variables: string[];
  isDefault: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export const DEFAULT_TEMPLATES: Omit<
  ResponseTemplate,
  "id" | "usageCount" | "createdAt" | "updatedAt"
>[] = [
  {
    name: "Thank You - Positive",
    category: "POSITIVE",
    content:
      "Thank you so much for the wonderful review! I'm thrilled to hear you enjoyed the performance. Looking forward to playing for you again!",
    variables: [],
    isDefault: true,
  },
  {
    name: "Thank You - Constructive",
    category: "NEUTRAL",
    content:
      "Thank you for your feedback. I appreciate you taking the time to share your experience. I'll definitely take your comments into account for future performances.",
    variables: [],
    isDefault: true,
  },
  {
    name: "Apology - Negative",
    category: "NEGATIVE",
    content:
      "I'm sorry to hear that your experience didn't meet expectations. I value all feedback and would love the opportunity to discuss this further and make things right.",
    variables: [],
    isDefault: true,
  },
  {
    name: "Professional - General",
    category: "PROFESSIONAL",
    content:
      "Thank you for your review. I appreciate your feedback and am committed to providing the best possible experience for all my clients.",
    variables: [],
    isDefault: true,
  },
  {
    name: "Friendly - Enthusiastic",
    category: "FRIENDLY",
    content:
      "Wow, thank you for the amazing review! I had such a great time performing for you. Your energy made it an unforgettable experience!",
    variables: [],
    isDefault: true,
  },
  {
    name: "Event-Specific",
    category: "PROFESSIONAL",
    content:
      "Thank you for reviewing my performance at {event_name}. I'm glad I could be part of your special occasion. It was a pleasure working with you!",
    variables: ["{event_name}"],
    isDefault: true,
  },
];

export async function getResponseTemplates(
  category?: ResponseTemplate["category"],
): Promise<ResponseTemplate[]> {
  await requireAdmin();

  const where = category ? { category } : {};

  const templates = await prisma.responseTemplate.findMany({
    where,
    orderBy: [{ isDefault: "desc" }, { usageCount: "desc" }, { name: "asc" }],
  });

  return templates;
}

export async function getResponseTemplateById(
  id: string,
): Promise<ResponseTemplate | null> {
  await requireAdmin();

  const template = await prisma.responseTemplate.findUnique({
    where: { id },
  });

  return template;
}

export async function createResponseTemplate(
  input: Omit<
    ResponseTemplate,
    "id" | "usageCount" | "createdAt" | "updatedAt"
  >,
): Promise<ResponseTemplate> {
  await requireAdmin();

  // Extract variables from content
  const variablePattern = /\{([^}]+)\}/g;
  const variables: string[] = [];
  let match;
  while ((match = variablePattern.exec(input.content)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }

  const template = await prisma.responseTemplate.create({
    data: {
      name: input.name,
      category: input.category,
      content: input.content,
      variables,
      isDefault: input.isDefault,
    },
  });

  return template;
}

export async function updateResponseTemplate(
  id: string,
  input: Partial<
    Omit<ResponseTemplate, "id" | "usageCount" | "createdAt" | "updatedAt">
  >,
): Promise<ResponseTemplate> {
  await requireAdmin();

  // Extract variables from content if provided
  let variables = input.variables;
  if (input.content) {
    const variablePattern = /\{([^}]+)\}/g;
    const extractedVariables: string[] = [];
    let match;
    while ((match = variablePattern.exec(input.content)) !== null) {
      if (!extractedVariables.includes(match[1])) {
        extractedVariables.push(match[1]);
      }
    }
    variables = extractedVariables;
  }

  const template = await prisma.responseTemplate.update({
    where: { id },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.category && { category: input.category }),
      ...(input.content && { content: input.content }),
      ...(input.isDefault !== undefined && { isDefault: input.isDefault }),
      variables,
    },
  });

  return template;
}

export async function deleteResponseTemplate(
  id: string,
): Promise<{ success: boolean }> {
  await requireAdmin();

  await prisma.responseTemplate.delete({
    where: { id },
  });

  return { success: true };
}

export async function incrementTemplateUsage(id: string): Promise<void> {
  await prisma.responseTemplate.update({
    where: { id },
    data: {
      usageCount: {
        increment: 1,
      },
    },
  });
}

export async function initializeDefaultTemplates(): Promise<void> {
  await requireAdmin();

  const existingCount = await prisma.responseTemplate.count();

  if (existingCount > 0) {
    return; // Templates already initialized
  }

  await prisma.responseTemplate.createMany({
    data: DEFAULT_TEMPLATES,
  });
}

export async function applyTemplateVariables(
  templateId: string,
  variables: Record<string, string>,
): Promise<string> {
  await requireAdmin();

  const template = await getResponseTemplateById(templateId);
  if (!template) {
    throw new Error("Template not found");
  }

  let content = template.content;
  for (const [key, value] of Object.entries(variables)) {
    content = content.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  }

  return content;
}
