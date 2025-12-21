export const MOODS = [
  {
    label: "Happy",
    emoji: "😊",
  },
  {
    label: "Scared",
    emoji: "😱",
  },
  { label: "Weird", emoji: "🤪" },
  { label: "Peaceful", emoji: "😌" },
  { label: "Sad", emoji: "😢" },
  { label: "Confused", emoji: "😵‍💫" },
] as const;

export type Visibility = "private" | "public";
