import Bold from "@tiptap/extension-bold";
import Document from "@tiptap/extension-document";
import Highlight from "@tiptap/extension-highlight";
import History from "@tiptap/extension-history";
import Italic from "@tiptap/extension-italic";
import Paragraph from "@tiptap/extension-paragraph";
import Strike from "@tiptap/extension-strike";
import Text from "@tiptap/extension-text";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import { type useEditor } from "@tiptap/react";

import { EmojiReplacer } from "./extensions/emoji-replacer";

const grayBorder = "border-b-[var(--chakra-colors-gray-200)]";
const darkGrayBorder = "dark:border-b-[var(--chakra-colors-gray-600)]";
const blueBorder = "focus:border-b-[var(--chakra-colors-blue-300)]";
const darkBlueBorder = "dark:focus:border-b-[var(--chakra-colors-blue-300)]";
const boxShadow =
  "focus:shadow-[0px_1px_0px_0px_var(--chakra-colors-blue-300)]";

export const editorConfig = (
  tabIndex?: number,
): Parameters<typeof useEditor>[0] => ({
  extensions: [
    Document,
    Paragraph,
    Text,
    Typography,
    Bold,
    Italic,
    Strike,
    Underline,
    Highlight,
    EmojiReplacer,
    History.configure({
      depth: 20,
    }),
  ],
  editorProps: {
    attributes: {
      class: `focus:outline-none py-[7px] border-b-[1px] transition-[border,box-shadow] ${grayBorder} ${darkGrayBorder} ${blueBorder} ${darkBlueBorder} ${boxShadow}`,
      ...(tabIndex !== undefined ? { tabindex: `${tabIndex}` } : {}),
    },
  },
});