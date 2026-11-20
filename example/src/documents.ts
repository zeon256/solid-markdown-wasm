export interface MarkdownDocument {
  id: string;
  content: string;
}

export interface DocumentState {
  documents: MarkdownDocument[];
  activeId: string;
}

const STORAGE_KEY = "solid-markdown-wasm:documents";

const UNTITLED = "Untitled";

// First ATX heading, minus any closing hashes.
const HEADING = /^ {0,3}#{1,6}[ \t]+(.*?)(?:[ \t]+#+)?[ \t]*$/m;

export const createDocument = (content = ""): MarkdownDocument => ({
  id: `doc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
  content,
});

/** Tab label: the document's first heading, else "Untitled". */
export const documentTitle = (content: string): string =>
  content.match(HEADING)?.[1]?.trim() || UNTITLED;

/** Saved tabs, else a single tab holding `defaultContent`. */
export const loadDocuments = (defaultContent: string): DocumentState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (raw) {
      // SAFETY: STORAGE_KEY is only written by saveDocuments() as JSON of a
      // DocumentState; malformed data throws into the catch below.
      const { documents, activeId } = JSON.parse(raw) as DocumentState;

      if (documents.length > 0) {
        return {
          documents,
          activeId: documents.some((doc) => doc.id === activeId)
            ? activeId
            : documents[0].id,
        };
      }
    }
  } catch {
    // Unreadable storage or data: start fresh.
  }

  const doc = createDocument(defaultContent);

  return { documents: [doc], activeId: doc.id };
};

export const saveDocuments = (state: DocumentState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked (private mode): tabs just won't survive a reload.
  }
};
