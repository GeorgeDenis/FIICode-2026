import React from 'react';
import { Image, Text, View } from 'react-native';
import EliteHero from '../../assets/img/elite_hero.png';
import ReliableHelper from '../../assets/img/reliable_helper.png';
import RisingStar from '../../assets/img/rising_star.png';
import Newbie from '../../assets/img/newbie.png';

const ProfileRank = ({ currentUser }) => {
  const getLogoImage = (score) => {
    switch (true) {
      case score >= 90:
        return EliteHero;
      case score >= 50:
        return ReliableHelper;
      case score >= 20:
        return RisingStar;
      default:
        return Newbie;
    }
  };
  return (
    <View className={`mt-5 w-full flex-row items-center rounded-3xl p-5 bg-surface`}>
      <View className="relative">
        <View className="rounded-2xl border bg-background p-2 shadow-sm">
          <Image source={getLogoImage(currentUser.trust_score)} className="h-36 w-28" />
        </View>
        <View className="absolute -right-2 -top-2 rounded-lg bg-primary px-2 py-1">
          <Text className="text-[10px] font-black text-white">{currentUser.trust_score}%</Text>
        </View>
      </View>

      <View className="ml-5 flex-1">
        <View>
          <Text className="text-foreground/50 text-[10px] font-bold uppercase tracking-widest">
            Current Rank
          </Text>
          <Text className="text-2xl font-black uppercase italic leading-none text-primary">
            {currentUser.rank}
          </Text>
        </View>

        <View className="mt-3">
          <Text className="text-foreground/50 text-[10px] font-bold uppercase tracking-widest">
            Hero Motto
          </Text>
          <Text className="text-foreground text-sm font-medium italic opacity-80">
            {currentUser.rank_label}
          </Text>
        </View>

        <View className="bg-secondary/20 mt-4 h-1.5 w-full overflow-hidden rounded-full">
          <View style={{ width: `${currentUser.trust_score}%` }} className="h-full bg-primary" />
        </View>
      </View>
    </View>
  );
};

export default ProfileRank;
