import { Dream } from "@/type";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image, Text, TouchableOpacity, View } from "react-native";

export const DreamCard = ({ item }: { item: Dream }) => {
  return (
    <View>
      <TouchableOpacity
        activeOpacity={0.9}
        className=" card mb-4 mx-4 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-dream-dark shadow-sm"
        onPress={() => console.log("Navegar para detalhes", item.id)}
      >
        {/* Imagem do Sonho (Se houver) */}
        {item.imageUrl && (
          <View className="h-40 w-full overflow-hidden relative">
            <Image
              source={{ uri: item.imageUrl }}
              className="w-full h-full object-cover opacity-90 dark:opacity-80"
              resizeMode="cover"
            />
            {/* Gradiente sobre a imagem */}

            <LinearGradient
              colors={["transparent", "rgba(0,0,0,10)"]}
              className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent dark:from-dream-surface dark:to-transparent"
            />
          </View>
        )}

        <View className="p-4">
          {/* Cabeçalho do Card: Avatar e Nome */}
          <View className="flex-row items-center mb-3">
            <Image
              source={{ uri: item.authorAvatar }}
              className="w-10 h-10 rounded-full border-2 border-blue-500 mr-3"
            />
            <View>
              <Text className="text-slate-800 dark:text-white font-bold text-sm">
                {item.authorName}
              </Text>
              <Text className="text-slate-500 dark:text-slate-400 text-xs">
                {new Date(item.date).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* Conteúdo: Título e Descrição */}
          <Text
            className="text-xl font-extrabold text-slate-900 dark:text-white mb-2"
            numberOfLines={1}
          >
            {item.title}
          </Text>

          <Text
            className="text-gray-600 dark:text-slate-300 mb-4 text-sm leading-6"
            numberOfLines={3}
          >
            {item.description}
          </Text>

          {/* Tags */}
          <View className="flex-row flex-wrap gap-2 mb-4">
            {item.tags.map((tag) => (
              <View
                key={tag}
                className="bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-md"
              >
                <Text className="text-blue-600 dark:text-blue-300 text-xs font-medium">
                  #{tag}
                </Text>
              </View>
            ))}
          </View>

          {/* Rodapé: Botões de Ação */}
          <View className="flex-row items-center justify-between border-t border-gray-100 dark:border-slate-800 pt-3">
            {/* Botão de Like */}
            <TouchableOpacity
              className="flex-row items-center space-x-2"
              onPress={() => console.log("Toggle like", item.id)}
            >
              <Feather
                name="heart"
                size={20}
                color={item.hasLiked ? "#ec4899" : "#94a3b8"}
                fill={item.hasLiked ? "#ec4899" : "transparent"}
              />
              <Text
                className={`ml-2 text-sm font-bold ${item.hasLiked ? "text-pink-500" : "text-slate-400"}`}
              >
                {item.likes}
              </Text>
            </TouchableOpacity>

            {/* Comentários */}
            <View className="flex-row items-center space-x-2">
              <Feather name="message-circle" size={20} color="#94a3b8" />
              <Text className="ml-2 text-slate-400 text-sm font-bold">
                {item.comments?.length || 0}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};
