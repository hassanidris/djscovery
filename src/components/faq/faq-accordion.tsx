"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FaqItem } from "@/data/faq-data";

type FaqAccordionProps = {
  items: FaqItem[];
  defaultOpen?: string;
  idPrefix?: string;
};

export default function FaqAccordion({
  items,
  defaultOpen,
  idPrefix = "faq",
}: FaqAccordionProps) {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultOpen}
      className="w-full"
    >
      {items.map((item, index) => {
        const value = `${idPrefix}-${index}`;
        return (
          <AccordionItem
            key={value}
            value={value}
            className="border-b border-white/8 last:border-0"
          >
            <AccordionTrigger className="hover:text-h_red/80 data-[state=open]:text-h_red/80 py-5 text-left text-sm font-semibold text-white transition-colors hover:no-underline sm:text-base">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="pb-5 text-sm leading-relaxed text-gray-400">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
