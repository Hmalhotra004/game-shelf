import Header from "@/components/Header";
import Loader from "@/components/Loader";
import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import ScreenWrapper from "@/components/ui/screen-wrapper";
import { Text } from "@/components/ui/text";
import { api } from "@/lib/api";
import { authClient } from "@/lib/authClient";
import { refreshSession } from "@/lib/refreshSession";
import { THEME } from "@/lib/theme";
import { ACCOUNT_PLATFORM_IMAGE, cn, handleError } from "@/lib/utils";
import { useThemeStore } from "@/store/useThemeStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { SearchByUsernamePSNType } from "@repo/schemas/types/psn";
import { useDebounce } from "@repo/utils/hooks/useDebounce";
import { linkPSNAccountMutationOptions } from "@repo/utils/mutations/psn";
import { searchPSNByUsernameQueryOptions } from "@repo/utils/queries/psn";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Redirect, useRouter } from "expo-router";
import { CheckIcon } from "lucide-react-native";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  LinkPSNAccountSchemaType,
  linkPSNAccountSchema,
} from "@repo/schemas/schemas/psn";

import { FlashList } from "@shopify/flash-list";
import { KeyboardAvoidingView, Platform, Pressable, View } from "react-native";

const MIN_QUERY_LENGTH = 3;

const Playstation = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const theme = useThemeStore((s) => s.theme);

  const { data: session } = authClient.useSession();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim());

  const canSearch = debouncedSearch.length >= MIN_QUERY_LENGTH;

  const { data, isFetching, isError } = useQuery(
    searchPSNByUsernameQueryOptions(api, canSearch, debouncedSearch),
  );

  const form = useForm<LinkPSNAccountSchemaType>({
    resolver: zodResolver(linkPSNAccountSchema),
    defaultValues: { PSNAccountId: "", PSNAccountUsername: "" },
  });

  const selectedId = form.watch("PSNAccountId");
  const selectedUsername = form.watch("PSNAccountUsername");

  const link = useMutation(
    linkPSNAccountMutationOptions(api, queryClient, (err) => handleError(err)),
  );

  const linkedPsnId = (
    session?.user as { psnAccountId?: string | null } | undefined
  )?.psnAccountId;
  if (linkedPsnId) return <Redirect href="/profile/accounts" />;

  const users = canSearch ? data : [];
  const isPending = link.isPending;

  const onSubmit = async (values: LinkPSNAccountSchemaType) => {
    await link.mutateAsync(values);
    await refreshSession();
    router.back();
  };

  const clearSelection = () => form.reset();

  const renderItem = ({ item }: { item: SearchByUsernamePSNType }) => {
    const isSelected = selectedId === item.accountId;

    return (
      <Pressable
        disabled={isPending}
        onPress={() => {
          if (isSelected) return clearSelection();
          form.setValue("PSNAccountId", item.accountId, {
            shouldValidate: true,
          });
          form.setValue("PSNAccountUsername", item.onlineId, {
            shouldValidate: true,
          });
        }}
        className={cn(
          "flex-row items-center gap-3 rounded-2xl border p-3 active:bg-muted",
          isSelected ? "border-primary bg-primary/10" : "border-border bg-card",
        )}
      >
        <Image
          source={{ uri: item.avatarUrl }}
          style={{ width: 44, height: 44, borderRadius: 22 }}
          contentFit="cover"
        />
        <Text
          className="flex-1 font-semibold"
          numberOfLines={1}
        >
          {item.onlineId}
        </Text>
        {isSelected && (
          <CheckIcon
            size={20}
            color={THEME[theme].foreground}
          />
        )}
      </Pressable>
    );
  };

  const renderEmpty = () => {
    if (!canSearch) {
      return (
        <Text className="py-6 text-center text-sm text-muted-foreground">
          Type at least {MIN_QUERY_LENGTH} characters to search
        </Text>
      );
    }
    if (isFetching) {
      return (
        <View className="items-center py-6">
          <Loader />
        </View>
      );
    }
    if (isError) {
      return (
        <Text className="py-6 text-center text-sm text-destructive">
          Something went wrong. Please try again.
        </Text>
      );
    }
    return (
      <Text className="py-6 text-center text-sm text-muted-foreground">
        No users found
      </Text>
    );
  };

  return (
    <View className="flex-1">
      <Header />

      <ScreenWrapper paddingTop={16}>
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Title */}
          <View className="items-center gap-2 pb-4">
            <Image
              source={ACCOUNT_PLATFORM_IMAGE["playstation"]}
              style={{ width: 48, height: 48 }}
              contentFit="cover"
            />
            <Text className="text-2xl font-bold">
              Link your PlayStation account
            </Text>
            <Text className="text-center text-sm text-muted-foreground">
              Search for your PSN username and select your profile
            </Text>
          </View>

          <SearchBar
            value={search}
            onChangeText={(text) => {
              setSearch(text);
              clearSelection();
            }}
            placeholder="Search PSN username"
            focus
          />

          <View className="h-2" />

          {/* Results */}
          <FlashList
            className="flex-1"
            data={users}
            keyExtractor={(item) => item.accountId}
            renderItem={renderItem}
            ListEmptyComponent={renderEmpty}
            ItemSeparatorComponent={() => <View className="h-2" />}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />

          <Button
            disabled={!selectedId || isPending}
            onPress={form.handleSubmit(onSubmit)}
          >
            {isPending ? (
              <Loader />
            ) : (
              <Text>
                {selectedUsername ? `Link ${selectedUsername}` : "Link account"}
              </Text>
            )}
          </Button>
        </KeyboardAvoidingView>
      </ScreenWrapper>
    </View>
  );
};

export default Playstation;
