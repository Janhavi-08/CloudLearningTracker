export interface Note {
  noteId: number;
  noteTitle: string;
  content?: string | null;
  resourceURL?: string | null;
  subTopicId: number;
  createdDate: string;
}
