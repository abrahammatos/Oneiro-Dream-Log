import { Feather } from "@expo/vector-icons";

export interface AppSettings {
  language: "en" | "pt" | "es";
  theme: "light" | "dark";
  notifications: boolean;
}

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isPro: boolean;
  streak: number;
  bedtime?: string;
  settings?: AppSettings;
}

export interface Achievement {
  id: string;
  label: string;
  icon: string;
  description: string;
  condition: (user: User, dreams: Dream[]) => boolean;
}

export interface Comment {
  id: string;
  userId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  date: string;
}

export interface Dream {
  id: string;
  userId: string;
  authorName: string;
  authorAvatar: string;
  title: string;
  description: string;
  date: string;
  visibility: "public" | "private";
  tags: string[];
  likes: number;
  hasLiked?: boolean;
  comments: Comment[];
  analysis?: string;
  language?: "en" | "pt" | "es";
  mood?: string;
  isLucid?: boolean;
  clarity?: number;
  imageUrl?: string;
}

interface CustomInputProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  label: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
}

interface CustomButtonProps {
  onPress?: () => void;
  title?: string;
  style?: StyleProp<ViewStyle>;
  variant?: "primary" | "secondary" | "danger" | "ghost" | "premium";
  leftIcon?: React.ReactNode;
  textStyle?: string;
  isLoading?: boolean;
  disabled?: boolean;
}

interface CreateUserParams {
  name: string;
  username: string;
  email: string;
  password: string;
}

interface SignInParams {
  email: string;
  password: string;
}

interface TabIconProps {
  focused: boolean;
  name: keyof typeof Feather.glyphMap;
}
export type ThemeColor = "dark" | "purple" | "blue" | "lilac" | "light";

export const MOCK_USER: User = {
  id: "u1",
  name: "DreamWalker",
  username: "dreamwalker_01",
  avatar: "https://picsum.photos/seed/user1/200/200",
  isPro: false,
  streak: 12,
  bedtime: "23:00",
  settings: {
    language: "en",
    theme: "dark",
    notifications: true,
  },
};

export const ACHIEVEMENTS_LIST: Achievement[] = [
  {
    id: "first_light",
    label: "First Light",
    icon: "🌤️",
    description: "Record your first dream",
    condition: (u, dreams) => dreams.some((d) => d.userId === u.id),
  },
  {
    id: "chronicler",
    label: "Chronicler",
    icon: "📚",
    description: "Record 5 dreams",
    condition: (u, dreams) =>
      dreams.filter((d) => d.userId === u.id).length >= 5,
  },
  {
    id: "awakened",
    label: "Awakened",
    icon: "👁️",
    description: "Have a lucid dream",
    condition: (u, dreams) =>
      dreams.some((d) => d.userId === u.id && d.isLucid),
  },
  {
    id: "night_owl",
    label: "Night Owl",
    icon: "🦉",
    description: "Record a dream between 2AM and 5AM",
    condition: (u, dreams) =>
      dreams.some((d) => {
        if (d.userId !== u.id) return false;
        const hour = new Date(d.date).getHours();
        return hour >= 2 && hour < 5;
      }),
  },
  {
    id: "influencer",
    label: "Influencer",
    icon: "🌟",
    description: "Get 50 likes on a single dream",
    condition: (u, dreams) =>
      dreams.some((d) => d.userId === u.id && d.likes >= 50),
  },
  {
    id: "socialite",
    label: "Socialite",
    icon: "💬",
    description: "Comment on 5 different dreams",
    condition: (u, dreams) => {
      // Mock check logic, assuming we tracked comments properly.
      // Simple heuristic: User has commented on dreams that aren't theirs?
      // For now, return false or mock it.
      return false;
    },
  },
];
