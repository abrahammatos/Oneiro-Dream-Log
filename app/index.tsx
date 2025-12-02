import { DreamCard } from "@/components/Dreamcard";
import Filter from "@/components/Filter";
import HeaderHome from "@/components/HeaderHome";
import RealityCheckWidget from "@/components/RealityCheckWidget";
import { Dream } from "@/type";
import { FlashList } from "@shopify/flash-list";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- Mock Data Initialization ---
const INITIAL_DREAMS: Dream[] = [
  {
    id: "d1",
    userId: "u2",
    authorName: "LunaLove",
    authorAvatar: "https://picsum.photos/seed/luna/200/200",
    title: "Flying over a neon city",
    description:
      "I was flying like a bird over a city made of neon lights. The wind felt warm.",
    date: new Date().toISOString(),
    visibility: "public",
    tags: ["Flying", "Neon", "City"],
    likes: 42,
    hasLiked: false,
    mood: "Excited",
    isLucid: true,
    clarity: 5,
    comments: [
      {
        id: "c1",
        userId: "u1",
        authorName: "DreamWalker",
        authorAvatar: "https://picsum.photos/seed/user1/200/200",
        text: "Wow, I had a similar dream last week!",
        date: new Date().toISOString(),
      },
    ],
    imageUrl:
      "https://image.pollinations.ai/prompt/neon%20city%20dream%20flying%20cyberpunk?width=800&height=600&nologo=true",
  },
  {
    id: "d2",
    userId: "u1",
    authorName: "DreamWalker",
    authorAvatar: "https://picsum.photos/seed/user1/200/200",
    title: "Lost in a library",
    description:
      "Infinite rows of books, but none of them had titles on the spine. I was looking for something specific but forgot what it was.",
    date: new Date(Date.now() - 86400000).toISOString(),
    visibility: "public",
    tags: ["Books", "Mystery", "Lost"],
    likes: 12,
    hasLiked: false,
    mood: "Confused",
    isLucid: false,
    clarity: 3,
    comments: [],
  },
  {
    id: "d3",
    userId: "u1",
    authorName: "DreamWalker",
    authorAvatar: "https://picsum.photos/seed/user1/200/200",
    title: "Late for Exam",
    description:
      "I arrived at school but realized I was wearing pajamas and didn't study for the math test.",
    date: new Date(Date.now() - 172800000).toISOString(),
    visibility: "private",
    tags: ["Anxiety", "School", "Embarrassment"],
    likes: 0,
    hasLiked: false,
    mood: "Anxious",
    isLucid: false,
    clarity: 4,
    comments: [],
  },
];

export default function Index() {
  return (
    <SafeAreaView className="flex-1 dark:bg-dream-dark">
      <FlashList<Dream>
        data={INITIAL_DREAMS}
        renderItem={({ item }) => <DreamCard item={item} />}
        contentContainerStyle={{ paddingVertical: 20 }}
        ListHeaderComponent={() => (
          <View>
            <HeaderHome />
            <RealityCheckWidget />
            <Filter />
          </View>
        )}
      />
    </SafeAreaView> //
  );
}
